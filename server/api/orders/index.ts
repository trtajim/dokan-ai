/**
 * Customer Orders Handler - Decrements live stock upon order
 */
import { memoryStore, type OrderRecord } from '../../utils/memoryStore'
import { getSupabaseClient } from '../../utils/supabase'
import { sendMetaPurchaseEvent } from '../../utils/metaCapi'
import { sendTelegramMessage, formatOrderTelegramMessage } from '../../utils/telegram'

export default defineEventHandler(async (event) => {
  const method = getMethod(event)

  if (method === 'GET') {
    const query = getQuery(event)
    const storeSlug = query.slug as string | undefined

    const supabase = getSupabaseClient()
    if (supabase) {
      try {
        let req = supabase.from('orders').select('*').order('created_at', { ascending: false })
        if (storeSlug) {
          req = req.eq('store_slug', storeSlug)
        }
        const { data } = await req
        if (data && data.length > 0) {
          return { success: true, orders: data }
        }
      } catch (err) {
        console.warn('Supabase fetch orders failed:', err)
      }
    }

    return {
      success: true,
      orders: memoryStore.getOrders(storeSlug)
    }
  }

  if (method === 'POST') {
    const body = await readBody(event)
    const { store_slug, customer_name, customer_phone, customer_address, delivery_zone, quantity, unit_price } = body

    if (!store_slug || !customer_name || !customer_phone || !customer_address) {
      throw createError({ statusCode: 400, message: 'Missing required customer order fields' })
    }

    const cleanPhone = customer_phone.replace(/\D/g, '')
    if (cleanPhone.length < 11) {
      throw createError({ statusCode: 400, message: 'সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 01712345678)' })
    }

    const qty = Number(quantity) || 1
    const price = Number(unit_price) || 0
    const deliveryFee = delivery_zone === 'outside_dhaka' ? 130 : 70
    const totalPrice = (price * qty) + deliveryFee

    // Check available stock before accepting order
    const supabase = getSupabaseClient()
    let availableStock = 25

    if (supabase) {
      try {
        const { data: store } = await supabase.from('stores').select('config').eq('slug', store_slug).single()
        if (store) {
          const cfg = store.config || {}
          if (typeof cfg.stock === 'number') availableStock = cfg.stock
        }
      } catch (e) {}
    } else {
      const mem = memoryStore.getStore(store_slug)
      if (mem && typeof mem.stock === 'number') availableStock = mem.stock
    }

    if (availableStock <= 0) {
      throw createError({ statusCode: 400, message: 'দুঃখিত! এই পণ্যটির স্টক শেষ হয়ে গেছে।' })
    }

    if (qty > availableStock) {
      throw createError({ statusCode: 400, message: `স্টকে সর্বোচ্চ ${availableStock}টি আইটেম অবশিষ্ট আছে।` })
    }

    const newOrder: OrderRecord = {
      id: 'ord-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
      store_slug,
      customer_name: customer_name.trim(),
      customer_phone: cleanPhone,
      customer_address: customer_address.trim(),
      delivery_zone: delivery_zone === 'outside_dhaka' ? 'outside_dhaka' : 'inside_dhaka',
      delivery_fee: deliveryFee,
      total_price: totalPrice,
      quantity: qty,
      status: 'pending',
      created_at: new Date().toISOString()
    }

    // Automatically decrement live stock
    memoryStore.decrementStock(store_slug, qty)

    if (supabase) {
      try {
        await supabase.from('orders').insert({
          id: newOrder.id,
          store_slug: newOrder.store_slug,
          customer_name: newOrder.customer_name,
          customer_phone: newOrder.customer_phone,
          customer_address: newOrder.customer_address,
          delivery_zone: newOrder.delivery_zone,
          delivery_fee: newOrder.delivery_fee,
          total_price: newOrder.total_price,
          quantity: newOrder.quantity,
          status: newOrder.status
        })

        // Also update Supabase config.stock
        const { data: store } = await supabase.from('stores').select('config').eq('slug', store_slug).single()
        if (store) {
          const cfg = store.config || {}
          const currentStock = typeof cfg.stock === 'number' ? cfg.stock : 25
          cfg.stock = Math.max(0, currentStock - qty)
          await supabase.from('stores').update({ config: cfg }).eq('slug', store_slug)
        }
      } catch (dbErr) {
        console.warn('Failed to insert into Supabase:', dbErr)
      }
    }

    memoryStore.addOrder(newOrder)

    // Send Telegram Notification to Merchant if chat_id is configured
    try {
      let storeConfig: any = null
      let storeTitle: string = store_slug

      if (supabase) {
        const { data: storeData } = await supabase.from('stores').select('product_title, config').eq('slug', store_slug).single()
        if (storeData) {
          storeConfig = storeData.config
          storeTitle = storeData.product_title || store_slug
        }
      }
      if (!storeConfig) {
        const mem = memoryStore.getStore(store_slug)
        if (mem) {
          storeConfig = mem.config
          storeTitle = mem.product_title || store_slug
        }
      }

      const telegramChatId = storeConfig?.telegram_chat_id
      if (telegramChatId) {
        const msgText = formatOrderTelegramMessage({
          store_title: storeTitle,
          store_slug,
          customer_name: newOrder.customer_name,
          customer_phone: newOrder.customer_phone,
          customer_address: newOrder.customer_address,
          selected_variant: newOrder.selected_variant,
          quantity: newOrder.quantity,
          total_price: newOrder.total_price,
          delivery_zone: newOrder.delivery_zone,
          delivery_fee: newOrder.delivery_fee
        })

        await sendTelegramMessage({
          chatId: telegramChatId,
          text: msgText
        })
      }
    } catch (telegramErr) {
      console.warn('Telegram new order notification error:', telegramErr)
    }

    return {
      success: true,
      message: 'আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে!',
      order: newOrder
    }
  }

  if (method === 'PATCH') {
    const body = await readBody(event)
    const { order_id, status } = body

    if (!order_id || !status) {
      throw createError({ statusCode: 400, message: 'order_id and status are required' })
    }

    const supabase = getSupabaseClient()
    let currentOrder: any = null

    if (supabase) {
      try {
        const { data } = await supabase.from('orders').select('*').eq('id', order_id).single()
        if (data) currentOrder = data
        await supabase.from('orders').update({ status }).eq('id', order_id)
      } catch (err) {
        console.warn('Failed to update status on Supabase:', err)
      }
    }

    const updated = memoryStore.updateOrderStatus(order_id, status)
    if (!currentOrder && updated) {
      currentOrder = updated
    }

    // Trigger Meta Conversions API (CAPI) Purchase event when admin confirms order
    if (status === 'confirmed' && currentOrder) {
      try {
        const storeSlug = currentOrder.store_slug
        let storeConfig: any = null

        if (supabase) {
          const { data: storeData } = await supabase.from('stores').select('config').eq('slug', storeSlug).single()
          if (storeData) storeConfig = storeData.config
        }
        if (!storeConfig) {
          const memStore = memoryStore.getStore(storeSlug)
          if (memStore) storeConfig = memStore.config
        }

        const pixelId = storeConfig?.pixel_id
        const accessToken = storeConfig?.meta_access_token

        if (pixelId && accessToken) {
          await sendMetaPurchaseEvent({
            pixelId,
            accessToken,
            orderId: currentOrder.id,
            totalPrice: currentOrder.total_price,
            currency: 'BDT',
            customerPhone: currentOrder.customer_phone,
            customerName: currentOrder.customer_name,
            customerAddress: currentOrder.customer_address
          })
        }
      } catch (capiErr) {
        console.warn('Meta CAPI trigger error upon confirmation:', capiErr)
      }
    }

    return {
      success: true,
      order: updated
    }
  }
})

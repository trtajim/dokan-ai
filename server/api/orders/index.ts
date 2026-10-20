/**
 * Customer Orders Handler - Decrements live stock upon order
 */
import { memoryStore, type OrderRecord } from '../../utils/memoryStore'
import { getSupabaseClient } from '../../utils/supabase'

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

    const supabase = getSupabaseClient()
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
    if (supabase) {
      try {
        await supabase.from('orders').update({ status }).eq('id', order_id)
      } catch (err) {
        console.warn('Failed to update status on Supabase:', err)
      }
    }

    const updated = memoryStore.updateOrderStatus(order_id, status)

    return {
      success: true,
      order: updated
    }
  }
})

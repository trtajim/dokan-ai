/**
 * Store update and fetch API
 */
import { memoryStore } from '../../utils/memoryStore'
import { getSupabaseClient } from '../../utils/supabase'

export default defineEventHandler(async (event) => {
  const method = getMethod(event)
  const query = getQuery(event)
  const slug = query.slug as string | undefined

  if (method === 'GET') {
    if (slug) {
      const supabase = getSupabaseClient()
      if (supabase) {
        try {
          const { data } = await supabase.from('stores').select('*').eq('slug', slug).single()
          if (data) return { success: true, store: data }
        } catch (err) {
          console.warn('Supabase store fetch error:', err)
        }
      }

      const store = memoryStore.getStore(slug)
      if (!store) {
        throw createError({ statusCode: 404, message: 'Store not found' })
      }
      return { success: true, store }
    }

    // List all stores
    const supabase = getSupabaseClient()
    if (supabase) {
      try {
        const { data } = await supabase.from('stores').select('*').order('created_at', { ascending: false })
        if (data && data.length > 0) return { success: true, stores: data }
      } catch (err) {
        console.warn('Supabase all stores error:', err)
      }
    }

    return {
      success: true,
      stores: memoryStore.getAllStores()
    }
  }

  // PUT: Edit store details (Title, Price, Delivery Charges, Copy, Theme, Images)
  if (method === 'PUT') {
    const body = await readBody(event)
    const { slug, product_title, price, regular_price, theme_color, image_url, config } = body

    if (!slug) {
      throw createError({ statusCode: 400, message: 'Store slug is required' })
    }

    const updatedData = {
      product_title,
      price: Number(price),
      regular_price: Number(regular_price),
      theme_color,
      image_url,
      config
    }

    const supabase = getSupabaseClient()
    if (supabase) {
      try {
        await supabase.from('stores').update(updatedData).eq('slug', slug)
      } catch (err) {
        console.warn('Supabase store update error:', err)
      }
    }

    // Update in-memory store
    const existing = memoryStore.getStore(slug)
    if (existing) {
      Object.assign(existing, updatedData)
      memoryStore.setStore(slug, existing)
      return { success: true, store: existing }
    }

    return { success: true }
  }
})

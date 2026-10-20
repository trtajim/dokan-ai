/**
 * Store update, fetch, and live stock/variant API
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
          if (data) {
            const mem = memoryStore.getStore(slug)
            data.stock = mem?.stock ?? data.config?.stock ?? 25
            data.variants = mem?.variants ?? data.config?.variants ?? []
            return { success: true, store: data }
          }
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
        if (data && data.length > 0) {
          data.forEach((s: any) => {
            const mem = memoryStore.getStore(s.slug)
            s.stock = mem?.stock ?? s.config?.stock ?? 25
            s.variants = mem?.variants ?? s.config?.variants ?? []
          })
          return { success: true, stores: data }
        }
      } catch (err) {
        console.warn('Supabase all stores error:', err)
      }
    }

    return {
      success: true,
      stores: memoryStore.getAllStores()
    }
  }

  // PATCH: Quick stock update from dashboard
  if (method === 'PATCH') {
    const body = await readBody(event)
    const { slug, stock } = body

    if (!slug || typeof stock !== 'number') {
      throw createError({ statusCode: 400, message: 'slug and stock (number) are required' })
    }

    const updatedStock = Math.max(0, stock)
    memoryStore.updateStock(slug, updatedStock)

    const supabase = getSupabaseClient()
    if (supabase) {
      try {
        const { data: store } = await supabase.from('stores').select('config').eq('slug', slug).single()
        if (store) {
          const cfg = store.config || {}
          cfg.stock = updatedStock
          await supabase.from('stores').update({ config: cfg }).eq('slug', slug)
        }
      } catch (e) {
        console.warn('Supabase stock sync error:', e)
      }
    }

    return { success: true, stock: updatedStock }
  }

  // PUT: Full store edit (including variants)
  if (method === 'PUT') {
    const body = await readBody(event)
    const { slug, product_title, price, regular_price, stock, variants, theme_color, image_url, config } = body

    if (!slug) {
      throw createError({ statusCode: 400, message: 'Store slug is required' })
    }

    const updatedConfig = config || {}
    if (typeof stock === 'number') {
      updatedConfig.stock = stock
      memoryStore.updateStock(slug, stock)
    }
    if (Array.isArray(variants)) {
      updatedConfig.variants = variants
    }

    const updatedData = {
      product_title,
      price: Number(price),
      regular_price: Number(regular_price),
      theme_color,
      image_url,
      config: updatedConfig
    }

    const supabase = getSupabaseClient()
    if (supabase) {
      try {
        await supabase.from('stores').update(updatedData).eq('slug', slug)
      } catch (err) {
        console.warn('Supabase store update error:', err)
      }
    }

    const existing = memoryStore.getStore(slug)
    if (existing) {
      Object.assign(existing, updatedData)
      if (typeof stock === 'number') existing.stock = stock
      if (Array.isArray(variants)) existing.variants = variants
      memoryStore.setStore(slug, existing)
      return { success: true, store: existing }
    }

    return { success: true }
  }
})

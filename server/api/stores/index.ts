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
      if (memoryStore.isDeleted(slug)) {
        throw createError({ statusCode: 404, message: 'Store not found' })
      }

      // 1. Check local/memory store first for freshest in-flight edits
      const memStore = memoryStore.getStore(slug)

      const supabase = getSupabaseClient()
      if (supabase) {
        try {
          const { data } = await supabase.from('stores').select('*').eq('slug', slug).single()
          if (data) {
            // Merge freshest memory updates if available
            if (memStore) {
              const activeVariants = (Array.isArray(memStore.variants) && memStore.variants.length > 0)
                ? memStore.variants
                : (Array.isArray(memStore.config?.variants) && memStore.config.variants.length > 0
                  ? memStore.config.variants
                  : (data.config?.variants ?? []))
              const activeStock = memStore.stock ?? memStore.config?.stock ?? data.config?.stock ?? 25
              const merged = {
                ...data,
                ...memStore,
                stock: activeStock,
                variants: activeVariants,
                config: {
                  ...(data.config || {}),
                  ...(memStore.config || {}),
                  variants: activeVariants,
                  stock: activeStock
                }
              }
              return { success: true, store: merged }
            }
            data.stock = data.config?.stock ?? 25
            data.variants = data.config?.variants ?? []
            return { success: true, store: data }
          }
        } catch (err) {
          console.warn('Supabase store fetch error:', err)
        }
      }

      if (memStore) {
        return { success: true, store: memStore }
      }

      throw createError({ statusCode: 404, message: 'Store not found' })
    }

    // List all stores
    const supabase = getSupabaseClient()
    if (supabase) {
      try {
        const { data } = await supabase.from('stores').select('*').order('created_at', { ascending: false })
        if (data && data.length > 0) {
          const filtered = data.filter((s: any) => !memoryStore.isDeleted(s.slug))
          const mergedList = filtered.map((s: any) => {
            const mem = memoryStore.getStore(s.slug)
            if (mem) {
              const activeVariants = (Array.isArray(mem.variants) && mem.variants.length > 0)
                ? mem.variants
                : (Array.isArray(mem.config?.variants) && mem.config.variants.length > 0
                  ? mem.config.variants
                  : (s.config?.variants ?? []))
              const activeStock = mem.stock ?? mem.config?.stock ?? s.config?.stock ?? 25
              return {
                ...s,
                ...mem,
                stock: activeStock,
                variants: activeVariants,
                config: {
                  ...(s.config || {}),
                  ...(mem.config || {}),
                  variants: activeVariants,
                  stock: activeStock
                }
              }
            }
            s.stock = s.config?.stock ?? 25
            s.variants = s.config?.variants ?? []
            return s
          })
          return { success: true, stores: mergedList }
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

  // PATCH: Quick stock, pixel, or telegram update from dashboard
  if (method === 'PATCH') {
    const body = await readBody(event)
    const { slug, stock, pixel_id, meta_access_token, telegram_chat_id } = body

    if (!slug) {
      throw createError({ statusCode: 400, message: 'slug is required' })
    }

    let updatedStock: number | undefined
    if (typeof stock === 'number') {
      updatedStock = Math.max(0, stock)
      memoryStore.updateStock(slug, updatedStock)
    }

    const currentStore = memoryStore.getStore(slug)
    if (currentStore) {
      if (!currentStore.config) currentStore.config = {}
      if (typeof stock === 'number') currentStore.config.stock = updatedStock
      if (pixel_id !== undefined) currentStore.config.pixel_id = pixel_id ? String(pixel_id).trim() : null
      if (meta_access_token !== undefined) currentStore.config.meta_access_token = meta_access_token ? String(meta_access_token).trim() : null
      if (telegram_chat_id !== undefined) currentStore.config.telegram_chat_id = telegram_chat_id ? String(telegram_chat_id).trim() : null
      memoryStore.setStore(slug, currentStore)
    }

    const supabase = getSupabaseClient()
    if (supabase) {
      try {
        const { data: store } = await supabase.from('stores').select('config').eq('slug', slug).single()
        if (store) {
          const cfg = store.config || {}
          if (typeof stock === 'number') cfg.stock = updatedStock
          if (pixel_id !== undefined) cfg.pixel_id = pixel_id ? String(pixel_id).trim() : null
          if (meta_access_token !== undefined) cfg.meta_access_token = meta_access_token ? String(meta_access_token).trim() : null
          if (telegram_chat_id !== undefined) cfg.telegram_chat_id = telegram_chat_id ? String(telegram_chat_id).trim() : null
          await supabase.from('stores').update({ config: cfg }).eq('slug', slug)
        }
      } catch (e) {
        console.warn('Supabase store patch error:', e)
      }
    }

    return { 
      success: true, 
      stock: updatedStock,
      pixel_id: pixel_id !== undefined ? (pixel_id ? String(pixel_id).trim() : null) : undefined,
      meta_access_token: meta_access_token !== undefined ? (meta_access_token ? String(meta_access_token).trim() : null) : undefined,
      telegram_chat_id: telegram_chat_id !== undefined ? (telegram_chat_id ? String(telegram_chat_id).trim() : null) : undefined
    }
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

  // DELETE: Delete store by slug
  if (method === 'DELETE') {
    const body = await readBody(event)
    const { slug } = body

    if (!slug) {
      throw createError({ statusCode: 400, message: 'Store slug is required' })
    }

    memoryStore.deleteStore(slug)

    const supabase = getSupabaseClient()
    if (supabase) {
      try {
        await supabase.from('stores').delete().eq('slug', slug)
      } catch (err) {
        console.warn('Supabase store delete error:', err)
      }
    }

    return { success: true, message: 'Store deleted successfully' }
  }
})

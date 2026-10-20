/**
 * Shared memory fallback store with live dynamic stock and variant support
 */

export interface ProductVariant {
  name: string // e.g. "1 কেজি", "2 কেজি" or "L (Large)", "XL (Extra Large)"
  price?: number // override price if different, or null to use base
  stock?: number
}

export interface StoreRecord {
  id: string
  slug: string
  user_id?: string
  product_title: string
  price: number
  regular_price: number
  image_url: string
  images?: string[]
  variants?: ProductVariant[]
  stock: number
  delivery_fee_inside?: number
  delivery_fee_outside?: number
  theme_color: string
  config: any
  created_at: string
}

export interface OrderRecord {
  id: string
  store_slug: string
  customer_name: string
  customer_phone: string
  customer_address: string
  delivery_zone: 'inside_dhaka' | 'outside_dhaka'
  delivery_fee: number
  total_price: number
  quantity: number
  selected_variant?: string
  status: 'pending' | 'confirmed' | 'shipped' | 'cancelled'
  created_at: string
}

declare global {
  var __dokan_stores: Map<string, StoreRecord> | undefined
  var __dokan_orders: OrderRecord[] | undefined
  var __dokan_deleted_slugs: Set<string> | undefined
  var __dokan_user_telegram: Map<string, string> | undefined
}

if (!globalThis.__dokan_deleted_slugs) {
  globalThis.__dokan_deleted_slugs = new Set<string>()
}

if (!globalThis.__dokan_user_telegram) {
  globalThis.__dokan_user_telegram = new Map<string, string>()
}

if (!globalThis.__dokan_stores) {
  globalThis.__dokan_stores = new Map<string, StoreRecord>()
}

if (!globalThis.__dokan_orders) {
  globalThis.__dokan_orders = []
}

export const memoryStore = {
  isDeleted: (slug: string) => globalThis.__dokan_deleted_slugs?.has(slug) || false,
  getStore: (slug: string) => {
    if (globalThis.__dokan_deleted_slugs?.has(slug)) return null
    return globalThis.__dokan_stores?.get(slug) || null
  },
  setStore: (slug: string, data: StoreRecord) => {
    globalThis.__dokan_deleted_slugs?.delete(slug)
    globalThis.__dokan_stores?.set(slug, data)
    return data
  },
  decrementStock: (slug: string, qty: number) => {
    const store = globalThis.__dokan_stores?.get(slug)
    if (store && typeof store.stock === 'number') {
      store.stock = Math.max(0, store.stock - qty)
      return store.stock
    }
    return null
  },
  updateStock: (slug: string, newStock: number) => {
    const store = globalThis.__dokan_stores?.get(slug)
    if (store) {
      store.stock = Math.max(0, newStock)
      return store.stock
    }
    return null
  },
  deleteStore: (slug: string) => {
    globalThis.__dokan_deleted_slugs?.add(slug)
    return globalThis.__dokan_stores?.delete(slug) || false
  },
  getAllStores: () => {
    const all = Array.from(globalThis.__dokan_stores?.values() || [])
    return all.filter(s => !globalThis.__dokan_deleted_slugs?.has(s.slug))
  },
  getOrders: (slug?: string) => {
    if (!slug) return globalThis.__dokan_orders || []
    return (globalThis.__dokan_orders || []).filter(o => o.store_slug === slug)
  },
  addOrder: (order: OrderRecord) => {
    globalThis.__dokan_orders?.unshift(order)
    return order
  },
  updateOrderStatus: (orderId: string, status: OrderRecord['status']) => {
    const order = globalThis.__dokan_orders?.find(o => o.id === orderId)
    if (order) {
      order.status = status
      return order
    }
    return null
  },
  getUserTelegramChatId: (userId: string) => {
    return globalThis.__dokan_user_telegram?.get(userId) || null
  },
  setUserTelegramChatId: (userId: string, chatId: string | null) => {
    if (!chatId) {
      globalThis.__dokan_user_telegram?.delete(userId)
    } else {
      globalThis.__dokan_user_telegram?.set(userId, chatId)
    }
  }
}

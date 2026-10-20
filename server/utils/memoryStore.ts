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
}

if (!globalThis.__dokan_deleted_slugs) {
  globalThis.__dokan_deleted_slugs = new Set<string>()
}

if (!globalThis.__dokan_stores) {
  globalThis.__dokan_stores = new Map<string, StoreRecord>()
  const demoStore: StoreRecord = {
    id: 'demo-store-1',
    slug: 't900-ultra-smartwatch',
    user_id: 'guest_merchant_demo',
    product_title: 'T900 Ultra 2 Max Smartwatch (অরিজিনাল)',
    price: 1350,
    regular_price: 2200,
    stock: 14,
    image_url: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'
    ],
    variants: [
      { name: 'Black (কালো স্ট্র্যাপ)', price: 1350 },
      { name: 'Orange (কমলা স্ট্র্যাপ)', price: 1350 },
      { name: 'Silver (সিলভার মেটাল)', price: 1450 }
    ],
    delivery_fee_inside: 70,
    delivery_fee_outside: 130,
    theme_color: 'emerald',
    config: {
      headline: 'প্রিমিয়াম ব্লুটুথ কলিং ও ফুল ওয়াটারপ্রুফ স্মার্টওয়াচ',
      subheadline: '২.০৯ ইঞ্চি ফুল এইচডি ডিসপ্লে, ২ দিনের ব্যাটারি লাইফ এবং প্রিমিয়াম মেটালিক ডিজাইন সহ প্রিমিয়াম কোয়ালিটি ওয়াচ। সাথে থাকছে ২টি ফ্রি স্ট্র্যাপ!',
      urgency_text: '🔥 অফারটি সীমিত সময়ের জন্য! ক্যাশ অন ডেলিভারিতে অর্ডার করুন!',
      variants: [
        { name: 'Black (কালো স্ট্র্যাপ)', price: 1350 },
        { name: 'Orange (কমলা স্ট্র্যাপ)', price: 1350 },
        { name: 'Silver (সিলভার মেটাল)', price: 1450 }
      ],
      trust_badges: [
        'ক্যাশ অন ডেলিভারি (পণ্য দেখে মূল্য পরিশোধ)',
        '৭ দিনের রিপ্লেসমেন্ট গ্যারান্টি',
        '১০০% অরিজিনাল প্রোডাক্ট'
      ],
      features: [
        {
          title: 'সরাসরি কল রিসিভ ও ডায়াল',
          desc: 'বিল্ট-ইন স্পিকার ও মাইক্রোফোন থাকায় ফোন পকেটে রেখেই যেকোনো কল কথা বলুন পরিষ্কারভাবে।'
        },
        {
          title: 'ফুল টাচ ২.০৯" বিগ ডিসপ্লে',
          desc: 'ক্রিস্টাল ক্লিয়ার সুপার ব্রাইট বেজেল-লেস ডিসপ্লে যা সরাসরি রোদের আলোতেও পরিষ্কার দেখা যায়।'
        },
        {
          title: 'লং লাস্টিং ব্যাটারি ব্যাকআপ',
          desc: 'একবার ফুল চার্জে টানা ২ থেকে ৩ দিন অনায়াসে ব্যবহার করা যায়।'
        }
      ],
      faqs: [
        {
          q: 'আমি কি পণ্য চেক করে টাকা দিতে পারব?',
          a: 'হ্যাঁ, সম্পূর্ণ ক্যাশ অন ডেলিভারি সুবিধা রয়েছে। ডেলিভারি ম্যানের সামনে প্যাকেট খুলে চেক করে টাকা পরিশোধ করবেন।'
        },
        {
          q: 'ডেলিভারি পেতে কতদিন সময় লাগবে?',
          a: 'ঢাকার ভেতরে ২৪ থেকে ৪৮ ঘণ্টার মধ্যে এবং ঢাকার বাইরে ২ থেকে ৩ দিনের মধ্যে ডেলিভারি সম্পন্ন হয়।'
        }
      ],
      testimonials: [
        {
          name: 'তানভীর আহমেদ',
          location: 'মিরপুর, ঢাকা',
          comment: 'কালকে অর্ডার করেছিলাম আজকেই ডেলিভারি পেলাম! ওয়াচটির ডিসপ্লে আর কলিং কোয়ালিটি সত্যি দারুণ।'
        }
      ]
    },
    created_at: new Date().toISOString()
  }
  globalThis.__dokan_stores.set(demoStore.slug, demoStore)
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
  }
}

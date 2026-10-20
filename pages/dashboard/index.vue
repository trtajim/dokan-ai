<template>
  <div class="min-h-screen bg-slate-50 flex flex-col">
    <Navbar />

    <main class="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      
      <!-- Top Title -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">মার্চেন্ট ড্যাশবোর্ড</h1>
            <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
              {{ currentUser?.displayName }}
            </span>
          </div>
          <p class="text-xs sm:text-sm text-slate-500 mt-1">আপনার সকল সক্রিয় দোকান, লাইভ স্টক ও কাস্টমারদের ক্যাশ অন ডেলিভারি অর্ডার তালিকা</p>
        </div>
      </div>

      <!-- Stats Metrics Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Revenue -->
        <div class="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-sm">
          <div class="flex items-center justify-between text-slate-400 mb-2">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-500">মোট বিক্রয় (অর্ডার ভ্যালু)</span>
            <Banknote class="w-5 h-5 text-emerald-600" />
          </div>
          <div class="text-2xl sm:text-3xl font-black text-slate-900">৳{{ totalRevenue.toLocaleString() }}</div>
          <span class="text-[11px] text-emerald-600 font-semibold mt-1 block">ক্যাশ অন ডেলিভারি ভ্যালু</span>
        </div>

        <!-- Total Orders -->
        <div class="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-sm">
          <div class="flex items-center justify-between text-slate-400 mb-2">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-500">মোট অর্ডার</span>
            <ShoppingBag class="w-5 h-5 text-indigo-600" />
          </div>
          <div class="text-2xl sm:text-3xl font-black text-slate-900">{{ filteredOrdersByStore.length }}</div>
          <span class="text-[11px] text-slate-500 font-semibold mt-1 block">সর্বমোট প্রাপ্ত অর্ডার</span>
        </div>

        <!-- Pending Orders -->
        <div class="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-sm">
          <div class="flex items-center justify-between text-slate-400 mb-2">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-500">পেন্ডিং অর্ডার (কল প্রয়োজন)</span>
            <Clock class="w-5 h-5 text-amber-500" />
          </div>
          <div class="text-2xl sm:text-3xl font-black text-amber-600">{{ pendingCount }}</div>
          <span class="text-[11px] text-amber-600 font-semibold mt-1 block">ভেরিফাই করে কনফার্ম করুন</span>
        </div>

        <!-- Stores Count -->
        <div class="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-sm">
          <div class="flex items-center justify-between text-slate-400 mb-2">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-500">আপনার সক্রিয় দোকান</span>
            <Store class="w-5 h-5 text-teal-600" />
          </div>
          <div class="text-2xl sm:text-3xl font-black text-slate-900">{{ userStores.length }}</div>
          <span class="text-[11px] text-teal-600 font-semibold mt-1 block">একাধিক ওয়েবসাইট ম্যানেজ করুন</span>
        </div>
      </div>

      <!-- Multi-Store Shelf & Live Stock Management -->
      <div class="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 class="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <Boxes class="w-4 h-4 text-emerald-600" />
              <span>আপনার পরিচালিত দোকানসমূহ ({{ userStores.length }} টি স্টোর)</span>
            </h2>
            <p class="text-xs text-slate-400 mt-0.5">যে কোনো স্টোরে ক্লিক করে নির্দিষ্ট অর্ডার তালিকা ফিল্টার করুন</p>
          </div>

          <!-- Store Switcher Filter -->
          <div class="flex items-center gap-1.5 overflow-x-auto text-xs">
            <button 
              @click="selectedStoreFilter = 'all'"
              class="px-3 py-1.5 rounded-lg font-bold transition-colors"
              :class="selectedStoreFilter === 'all' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
            >
              সকল দোকান
            </button>
            <button 
              v-for="st in userStores"
              :key="st.id"
              @click="selectedStoreFilter = st.slug"
              class="px-3 py-1.5 rounded-lg font-bold transition-colors truncate max-w-[140px]"
              :class="selectedStoreFilter === st.slug ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
            >
              {{ st.product_title }}
            </button>
          </div>
        </div>

        <!-- Stores Row List -->
        <div class="divide-y divide-slate-100 border border-slate-200/80 rounded-2xl overflow-hidden bg-white">
          <div 
            v-for="st in userStores" 
            :key="st.id" 
            class="p-3 sm:p-4 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            :class="selectedStoreFilter === st.slug ? 'bg-emerald-50/30' : ''"
          >
            <!-- Store Details -->
            <div class="flex items-center gap-3 min-w-0">
              <div class="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black shrink-0">
                <Store class="w-4 h-4" />
              </div>
              <div class="min-w-0">
                <div class="flex items-center gap-2">
                  <h3 class="font-bold text-slate-900 text-sm truncate">{{ st.product_title }}</h3>
                  <span 
                    class="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shrink-0"
                    :class="getStoreStock(st) > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'"
                  >
                    {{ getStoreStock(st) > 0 ? 'ইন স্টক' : 'স্টক শেষ' }}
                  </span>
                </div>
                <p class="text-xs text-slate-400 font-medium truncate mt-0.5">
                  ৳{{ st.price }} · <span class="font-mono text-slate-600">/s/{{ st.slug }}</span>
                </p>
              </div>
            </div>

            <!-- Stock & Actions Row -->
            <div class="flex items-center justify-between sm:justify-end gap-2.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-slate-100">
              <!-- Stock count with clean prompt alert -->
              <button 
                @click="openStockPrompt(st)"
                class="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                title="স্টক পরিবর্তন করতে ক্লিক করুন"
              >
                <span class="text-slate-400 font-normal">স্টক:</span>
                <span class="font-black text-slate-900">{{ getStoreStock(st) }}টি</span>
              </button>

              <NuxtLink 
                :to="`/s/${st.slug}`" 
                target="_blank" 
                class="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
              >
                <span>স্টোর ভিজিট</span>
                <ExternalLink class="w-3.5 h-3.5" />
              </NuxtLink>

              <button 
                @click="copyStoreLink(st.slug)" 
                class="px-2.5 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                title="লিংক কপি করুন"
              >
                <Copy class="w-3.5 h-3.5" />
                <span>লিংক</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Realtime Incoming Orders Table -->
      <div class="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div class="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 class="text-base font-bold text-slate-900 flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>লাইভ ক্যাশ অন ডেলিভারি অর্ডার তালিকা</span>
            </h2>
            <p class="text-xs text-slate-500 mt-0.5">
              {{ selectedStoreFilter === 'all' ? 'সকল দোকানের সম্মিলিত অর্ডার' : `ফিল্টার্ড স্টোর: /s/${selectedStoreFilter}` }}
            </p>
          </div>

          <!-- Status Filter buttons -->
          <div class="flex items-center gap-1.5 overflow-x-auto text-xs">
            <button 
              v-for="flt in statusFilterOptions" 
              :key="flt.value"
              @click="activeStatusFilter = flt.value"
              class="px-3 py-1.5 rounded-lg font-bold transition-colors whitespace-nowrap"
              :class="activeStatusFilter === flt.value ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
            >
              {{ flt.label }}
            </button>
          </div>
        </div>

        <!-- Orders: Responsive Card View on Mobile, Table on Desktop -->
        <!-- Mobile Orders List (< md) -->
        <div class="md:hidden divide-y divide-slate-100">
          <div v-if="finalDisplayOrders.length === 0" class="py-10 text-center text-slate-400 font-semibold text-xs">
            কোনো অর্ডার খুঁজে পাওয়া যায়নি।
          </div>
          <div v-for="order in finalDisplayOrders" :key="'mob_' + order.id" class="p-4 space-y-2.5">
            <div class="flex items-start justify-between gap-2">
              <div>
                <h4 class="font-bold text-slate-900 text-sm">{{ order.customer_name }}</h4>
                <a :href="`tel:${order.customer_phone}`" class="inline-flex items-center gap-1 text-emerald-700 text-xs font-mono font-bold mt-0.5">
                  <PhoneCall class="w-3 h-3 text-emerald-600" />
                  <span>{{ order.customer_phone }}</span>
                </a>
              </div>
              <!-- Status Select Dropdown on Mobile -->
              <select 
                :value="order.status"
                @change="changeStatus(order.id, $event.target.value)"
                class="px-2 py-1 text-[11px] font-bold rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:border-emerald-500"
              >
                <option value="pending">পেন্ডিং (Pending)</option>
                <option value="confirmed">কনফার্মড (Confirmed)</option>
                <option value="under_courier">কুরিয়ারে আছে (Under Courier)</option>
                <option value="delivered">ডেলিভার্ড (Delivered)</option>
                <option value="cancelled">বাতিল (Cancelled)</option>
              </select>
            </div>

            <div class="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200/70 space-y-1">
              <div class="flex justify-between text-[11px]">
                <span class="text-slate-400">স্টোর / ভ্যারিয়েন্ট:</span>
                <span class="font-bold text-slate-800">/s/{{ order.store_slug }} {{ order.selected_variant ? `(${order.selected_variant})` : '' }}</span>
              </div>
              <div class="flex justify-between text-[11px]">
                <span class="text-slate-400">বিল (পরিমাণ):</span>
                <span class="font-black text-slate-900">৳{{ order.total_price }} ({{ order.quantity }}টি)</span>
              </div>
              <div class="text-[11px] text-slate-500 pt-1 border-t border-slate-200/50 truncate">
                📍 {{ order.customer_address }}
              </div>
            </div>

            <!-- Mobile Footer Row -->
            <div class="flex items-center justify-between pt-1">
              <span class="text-[10px] text-slate-400">{{ formatTime(order.created_at) }}</span>
              <button 
                v-if="order.status !== 'cancelled'"
                @click="changeStatus(order.id, 'cancelled')"
                class="text-xs text-slate-400 hover:text-red-600 flex items-center gap-1"
                title="অর্ডার বাতিল"
              >
                <Trash2 class="w-3 h-3" />
                <span>বাতিল</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Orders Table (Desktop >= md) -->
        <div class="hidden md:block overflow-x-auto">
          <table class="w-full text-left text-xs sm:text-sm">
            <thead class="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-200/70 text-[11px] uppercase tracking-wider">
              <tr>
                <th class="py-3 px-4">কাস্টমার</th>
                <th class="py-3 px-4">ফোন নম্বর</th>
                <th class="py-3 px-4">দোকান ও ভ্যারিয়েন্ট</th>
                <th class="py-3 px-4">ঠিকানা ও এরিয়া</th>
                <th class="py-3 px-4">পরিমাণ ও মোট বিল</th>
                <th class="py-3 px-4">অর্ডার স্ট্যাটাস</th>
                <th class="py-3 px-4 text-right">ডিলিট</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 font-medium text-slate-700">
              <tr v-if="finalDisplayOrders.length === 0">
                <td colspan="7" class="py-12 text-center text-slate-400 font-semibold">
                  কোনো অর্ডার খুঁজে পাওয়া যায়নি।
                </td>
              </tr>
              <tr v-for="order in finalDisplayOrders" :key="order.id" class="hover:bg-slate-50/60 transition-colors">
                <!-- Customer Name -->
                <td class="py-3.5 px-4">
                  <div class="font-bold text-slate-900">{{ order.customer_name }}</div>
                  <span class="text-[11px] text-slate-400 block">{{ formatTime(order.created_at) }}</span>
                </td>

                <!-- Phone (with 1-click Call) -->
                <td class="py-3.5 px-4 font-mono font-semibold">
                  <a :href="`tel:${order.customer_phone}`" class="inline-flex items-center gap-1.5 text-emerald-700 hover:underline">
                    <PhoneCall class="w-3.5 h-3.5 text-emerald-600" />
                    <span>{{ order.customer_phone }}</span>
                  </a>
                </td>

                <!-- Store & Variant -->
                <td class="py-3.5 px-4">
                  <div class="text-xs font-bold text-slate-800">/s/{{ order.store_slug }}</div>
                  <span v-if="order.selected_variant" class="text-[11px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold">
                    {{ order.selected_variant }}
                  </span>
                </td>

                <!-- Address -->
                <td class="py-3.5 px-4 max-w-xs">
                  <div class="truncate text-xs">{{ order.customer_address }}</div>
                  <span class="text-[10px] px-2 py-0.5 rounded font-bold" :class="order.delivery_zone === 'outside_dhaka' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'">
                    {{ order.delivery_zone === 'outside_dhaka' ? 'ঢাকার বাইরে' : 'ঢাকার ভিতরে' }}
                  </span>
                </td>

                <!-- Quantity and Bill -->
                <td class="py-3.5 px-4">
                  <div class="font-bold text-slate-900">৳{{ order.total_price }}</div>
                  <span class="text-[11px] text-slate-400">{{ order.quantity }} টি আইটেম</span>
                </td>

                <!-- Status Select Dropdown (Interactive update) -->
                <td class="py-3.5 px-4">
                  <select 
                    :value="order.status"
                    @change="changeStatus(order.id, $event.target.value)"
                    class="px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-emerald-500 cursor-pointer shadow-xs"
                    :class="{
                      'text-amber-700 bg-amber-50/50 border-amber-200': order.status === 'pending',
                      'text-emerald-700 bg-emerald-50/50 border-emerald-200': order.status === 'confirmed',
                      'text-indigo-700 bg-indigo-50/50 border-indigo-200': order.status === 'under_courier',
                      'text-blue-700 bg-blue-50/50 border-blue-200': order.status === 'delivered',
                      'text-red-700 bg-red-50/50 border-red-200': order.status === 'cancelled'
                    }"
                  >
                    <option value="pending">পেন্ডিং (Pending)</option>
                    <option value="confirmed">কনফার্মড (Confirmed)</option>
                    <option value="under_courier">কুরিয়ারে আছে (Under Courier)</option>
                    <option value="delivered">ডেলিভার্ড (Delivered)</option>
                    <option value="cancelled">বাতিল (Cancelled)</option>
                  </select>
                </td>

                <!-- Delete / Cancel Button -->
                <td class="py-3.5 px-4 text-right">
                  <button 
                    v-if="order.status !== 'cancelled'"
                    @click="changeStatus(order.id, 'cancelled')"
                    class="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                    title="অর্ডার বাতিল"
                  >
                    <Trash2 class="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { RefreshCw, Plus, Banknote, ShoppingBag, Clock, Store, Boxes, Copy, ExternalLink, PhoneCall, Trash2 } from 'lucide-vue-next'
import { useAuth } from '~/composables/useAuth'

const { currentUser, initAuth } = useAuth()
const router = useRouter()

const isRefreshing = ref(false)
const activeStatusFilter = ref('all')
const selectedStoreFilter = ref('all')

const stores = ref([])
const orders = ref([])

onMounted(async () => {
  await initAuth()
  // Strict Login Check: If not logged in, redirect to login page immediately
  if (!currentUser.value) {
    router.replace('/login?redirect=/dashboard')
    return
  }
  refreshData()
  const interval = setInterval(refreshData, 15000)
  onUnmounted(() => clearInterval(interval))
})

const refreshData = async () => {
  isRefreshing.value = true
  try {
    const [storesRes, ordersRes] = await Promise.all([
      $fetch('/api/stores'),
      $fetch('/api/orders')
    ])
    stores.value = storesRes?.stores || []
    orders.value = ordersRes?.orders || []
  } catch (err) {
    console.error('Failed to load dashboard data:', err)
  } finally {
    isRefreshing.value = false
  }
}

// User stores list (supports managing multiple stores)
const userStores = computed(() => {
  if (!currentUser.value) return []
  // If demo guest, show all demo/guest stores; if custom user, filter by user_id or show all user stores
  if (currentUser.value.isGuest) {
    return stores.value
  }
  const myStores = stores.value.filter(s => s.user_id === currentUser.value?.id)
  return myStores.length > 0 ? myStores : stores.value
})

const filteredOrdersByStore = computed(() => {
  if (selectedStoreFilter.value === 'all') {
    // Show orders belonging to user's stores
    const userSlugs = new Set(userStores.value.map(s => s.slug))
    return orders.value.filter(o => userSlugs.has(o.store_slug))
  }
  return orders.value.filter(o => o.store_slug === selectedStoreFilter.value)
})

const finalDisplayOrders = computed(() => {
  if (activeStatusFilter.value === 'all') return filteredOrdersByStore.value
  return filteredOrdersByStore.value.filter(o => o.status === activeStatusFilter.value)
})

const getStoreStock = (st) => {
  if (typeof st.stock === 'number') return st.stock
  if (typeof st.config?.stock === 'number') return st.config.stock
  return 15
}

const quickAdjustStock = async (slug, newStock) => {
  const stockVal = Math.max(0, newStock)
  try {
    await $fetch('/api/stores', {
      method: 'PATCH',
      body: { slug, stock: stockVal }
    })
    const st = stores.value.find(s => s.slug === slug)
    if (st) {
      st.stock = stockVal
      if (st.config) st.config.stock = stockVal
    }
  } catch (e) {
    alert('স্টক আপডেট করা সম্ভব হয়নি।')
  }
}

const totalRevenue = computed(() => {
  return filteredOrdersByStore.value.reduce((acc, o) => acc + (Number(o.total_price) || 0), 0)
})

const pendingCount = computed(() => {
  return filteredOrdersByStore.value.filter(o => o.status === 'pending').length
})

const formatTime = (isoString) => {
  if (!isoString) return ''
  const d = new Date(isoString)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const statusFilterOptions = [
  { value: 'all', label: 'সকল অর্ডার (All)' },
  { value: 'pending', label: 'পেন্ডিং (Pending)' },
  { value: 'confirmed', label: 'কনফার্মড (Confirmed)' },
  { value: 'under_courier', label: 'কুরিয়ারে আছে (Under Courier)' },
  { value: 'delivered', label: 'ডেলিভার্ড (Delivered)' },
  { value: 'cancelled', label: 'বাতিল (Cancelled)' }
]

const openStockPrompt = async (st) => {
  const current = getStoreStock(st)
  const input = prompt(`"${st.product_title}"-এর নতুন স্টক সংখ্যা কত দিতে চান?`, current.toString())
  if (input === null) return
  const num = parseInt(input.trim(), 10)
  if (isNaN(num) || num < 0) {
    alert('দয়া করে সঠিক সংখ্যা প্রদান করুন।')
    return
  }
  await quickAdjustStock(st.slug, num)
}

const copyStoreLink = (slug) => {
  const url = `${window.location.origin}/s/${slug}`
  navigator.clipboard.writeText(url)
  alert(`স্টোর লিংক কপি হয়েছে:\n${url}`)
}

const changeStatus = async (orderId, newStatus) => {
  try {
    await $fetch('/api/orders', {
      method: 'PATCH',
      body: { order_id: orderId, status: newStatus }
    })
    await refreshData()
  } catch (e) {
    alert('স্ট্যাটাস পরিবর্তন করা সম্ভব হয়নি।')
  }
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 flex flex-col">
    <Navbar />

    <main class="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      
      <!-- Top Title & Account Actions -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">মার্চেন্ট ড্যাশবোর্ড</h1>
          <p class="text-xs sm:text-sm text-slate-500 mt-1">আপনার সকল সক্রিয় দোকান, লাইভ স্টক ও কাস্টমারদের ক্যাশ অন ডেলিভারি অর্ডার তালিকা</p>
        </div>

        <!-- Account-Wide Telegram Alerts & Courier Setup Buttons -->
        <div class="flex items-center gap-2.5 flex-wrap">
          <!-- Courier Setup Button -->
          <button 
            @click="courierModal.isOpen = true"
            class="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shadow-xs cursor-pointer border bg-white hover:bg-slate-50 text-slate-700 border-slate-200"
          >
            <div class="w-6 h-6 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Truck class="w-3.5 h-3.5" />
            </div>
            <span>কুরিয়ার ইন্টিগ্রেশন</span>
            <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
          </button>

          <!-- Telegram Alerts Button -->
          <button 
            @click="openAccountTelegramModal"
            class="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shadow-xs cursor-pointer border"
            :class="userTelegramChatId ? 'bg-sky-50 hover:bg-sky-100 text-sky-800 border-sky-300' : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'"
          >
            <div class="w-6 h-6 rounded-lg flex items-center justify-center shrink-0" :class="userTelegramChatId ? 'bg-sky-500 text-white' : 'bg-slate-100 text-slate-500'">
              <Send class="w-3.5 h-3.5" />
            </div>
            <span>{{ userTelegramChatId ? 'টেলিগ্রাম নোটিফিকেশন অন' : 'টেলিগ্রাম নোটিফিকেশন যুক্ত করুন' }}</span>
            <span v-if="userTelegramChatId" class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </button>
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
          <div v-if="isLoading" class="h-9 w-28 bg-slate-200 animate-pulse rounded-lg my-1"></div>
          <div v-else class="text-2xl sm:text-3xl font-black text-slate-900">৳{{ totalRevenue.toLocaleString() }}</div>
          <span class="text-[11px] text-emerald-600 font-semibold mt-1 block">ক্যাশ অন ডেলিভারি ভ্যালু</span>
        </div>

        <!-- Total Orders -->
        <div class="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-sm">
          <div class="flex items-center justify-between text-slate-400 mb-2">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-500">মোট অর্ডার</span>
            <ShoppingBag class="w-5 h-5 text-indigo-600" />
          </div>
          <div v-if="isLoading" class="h-9 w-16 bg-slate-200 animate-pulse rounded-lg my-1"></div>
          <div v-else class="text-2xl sm:text-3xl font-black text-slate-900">{{ filteredOrdersByStore.length }}</div>
          <span class="text-[11px] text-slate-500 font-semibold mt-1 block">সর্বমোট প্রাপ্ত অর্ডার</span>
        </div>

        <!-- Pending Orders -->
        <div class="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-sm">
          <div class="flex items-center justify-between text-slate-400 mb-2">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-500">পেন্ডিং অর্ডার (কল প্রয়োজন)</span>
            <Clock class="w-5 h-5 text-amber-500" />
          </div>
          <div v-if="isLoading" class="h-9 w-16 bg-slate-200 animate-pulse rounded-lg my-1"></div>
          <div v-else class="text-2xl sm:text-3xl font-black text-amber-600">{{ pendingCount }}</div>
          <span class="text-[11px] text-amber-600 font-semibold mt-1 block">ভেরিফাই করে কনফার্ম করুন</span>
        </div>

        <!-- Stores Count -->
        <div class="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-sm">
          <div class="flex items-center justify-between text-slate-400 mb-2">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-500">আপনার সক্রিয় দোকান</span>
            <Store class="w-5 h-5 text-teal-600" />
          </div>
          <div v-if="isLoading" class="h-9 w-16 bg-slate-200 animate-pulse rounded-lg my-1"></div>
          <div v-else class="text-2xl sm:text-3xl font-black text-slate-900">{{ userStores.length }}</div>
          <span class="text-[11px] text-teal-600 font-semibold mt-1 block">একাধিক ওয়েবসাইট ম্যানেজ করুন</span>
        </div>
      </div>

      <!-- Multi-Store Shelf & Live Stock Management -->
      <div class="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-4">
        <div>
          <h2 class="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
            <Boxes class="w-4 h-4 text-emerald-600" />
            <span>আপনার পরিচালিত দোকানসমূহ <span v-if="!isLoading">({{ userStores.length }} টি স্টোর)</span></span>
          </h2>
          <p class="text-xs text-slate-400 mt-0.5">নিচে দোকানের লাইভ স্টক পরিবর্তন করুন অথবা ভিজিট করুন</p>
        </div>

        <!-- Skeleton loading state for stores -->
        <div v-if="isLoading" class="space-y-3">
          <div v-for="i in 3" :key="i" class="h-16 bg-slate-100 animate-pulse rounded-xl"></div>
        </div>

        <!-- Stores Row List -->
        <div v-else class="divide-y divide-slate-100 border border-slate-200/80 rounded-2xl overflow-hidden bg-white">
          <div v-if="userStores.length === 0" class="p-8 text-center text-slate-400 text-sm">
            কোনো সক্রিয় দোকান পাওয়া যায়নি।
          </div>
          <div 
            v-for="st in userStores" 
            :key="st.id" 
            class="p-3 sm:p-4 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <!-- Store Details -->
            <div class="flex items-center gap-3 min-w-0">
              <div class="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black shrink-0">
                <Store class="w-4 h-4" />
              </div>
              <div class="min-w-0">
                <div class="flex items-center gap-2">
                  <h3 class="font-bold text-slate-900 text-sm truncate">{{ st.product_title }}</h3>
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

              <!-- Meta Pixel Setup Button -->
              <button 
                @click="openPixelModal(st)"
                class="px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                :class="st.config?.pixel_id ? 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'"
                :title="st.config?.pixel_id ? `Pixel ID: ${st.config.pixel_id}` : 'মেটা পিক্সেল সেটআপ করুন'"
              >
                <Activity class="w-3.5 h-3.5" :class="st.config?.pixel_id ? 'text-indigo-600' : 'text-slate-400'" />
                <span>{{ st.config?.pixel_id ? 'পিক্সেল অন' : 'পিক্সেল' }}</span>
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

              <!-- Delete Store Button -->
              <button 
                @click="deleteStore(st)"
                class="p-1.5 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                title="দোকান মুছে ফেলুন"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Realtime Incoming Orders Table -->
      <div class="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div class="p-4 sm:p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 class="text-base font-bold text-slate-900 flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>লাইভ ক্যাশ অন ডেলিভারি অর্ডার তালিকা</span>
            </h2>
            <p class="text-xs text-slate-500 mt-0.5">
              {{ selectedStoreFilter === 'all' ? 'সকল দোকানের সম্মিলিত অর্ডার' : `ফিল্টার্ড স্টোর: /s/${selectedStoreFilter}` }}
            </p>
          </div>

          <!-- Filters: Store Selector Dropdown & Order Status Selector Dropdown -->
          <div class="flex flex-wrap sm:flex-nowrap items-center gap-2">
            <!-- Store Selection Dropdown -->
            <div class="relative w-full sm:w-auto">
              <select 
                v-model="selectedStoreFilter"
                class="w-full sm:w-auto px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 focus:outline-none focus:border-emerald-500 cursor-pointer shadow-xs transition-colors"
              >
                <option value="all">সকল দোকান</option>
                <option v-for="st in userStores" :key="st.id" :value="st.slug">
                  {{ st.product_title }}
                </option>
              </select>
            </div>

            <!-- Order Status Filter Dropdown -->
            <div class="relative w-full sm:w-auto">
              <select 
                v-model="activeStatusFilter"
                class="w-full sm:w-auto px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-200 bg-slate-900 text-white focus:outline-none cursor-pointer shadow-xs transition-colors"
              >
                <option v-for="flt in statusFilterOptions" :key="flt.value" :value="flt.value">
                  {{ flt.label }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <!-- Loading Skeleton for Orders -->
        <div v-if="isLoading" class="p-6 space-y-4">
          <div v-for="i in 4" :key="i" class="h-12 bg-slate-100 animate-pulse rounded-xl"></div>
        </div>

        <!-- Orders: Responsive Card View on Mobile, Table on Desktop -->
        <template v-else>
        <!-- Mobile Orders List (< md) -->
        <div class="md:hidden space-y-3 p-3 bg-slate-100/60 rounded-2xl">
          <div v-if="finalDisplayOrders.length === 0" class="py-10 text-center text-slate-400 font-semibold text-xs bg-white rounded-2xl border border-slate-200/80">
            কোনো অর্ডার খুঁজে পাওয়া যায়নি।
          </div>
          <div 
            v-for="order in finalDisplayOrders" 
            :key="'mob_' + order.id" 
            class="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3 transition-all"
          >
            <!-- Card Top: Order ID & Status -->
            <div class="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
              <span class="font-mono text-xs font-black text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">
                #{{ order.id }}
              </span>

              <!-- Status Select Dropdown on Mobile -->
              <select 
                :value="order.status"
                @change="changeStatus(order.id, $event.target.value)"
                class="px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-emerald-500 cursor-pointer shadow-2xs"
                :class="{
                  'text-amber-700 bg-amber-50/50 border-amber-200': order.status === 'pending',
                  'text-emerald-700 bg-emerald-50/50 border-emerald-200': order.status === 'confirmed',
                  'text-indigo-700 bg-indigo-50/50 border-indigo-200': order.status === 'under_courier',
                  'text-blue-700 bg-blue-50/50 border-blue-200': order.status === 'delivered',
                  'text-red-700 bg-red-50/50 border-red-200': order.status === 'cancelled'
                }"
              >
                <option value="pending">পেন্ডিং</option>
                <option value="confirmed">কনফার্মড</option>
                <option value="under_courier">কুরিয়ারে আছে</option>
                <option value="delivered">ডেলিভার্ড</option>
                <option value="cancelled">বাতিল</option>
              </select>
            </div>

            <!-- Customer Details -->
            <div class="flex items-start justify-between gap-2">
              <div>
                <h4 class="font-bold text-slate-900 text-sm leading-tight">{{ order.customer_name }}</h4>
                <a :href="`tel:${order.customer_phone}`" class="inline-flex items-center gap-1.5 text-emerald-700 text-xs font-mono font-bold mt-1 hover:underline">
                  <PhoneCall class="w-3.5 h-3.5 text-emerald-600" />
                  <span>{{ order.customer_phone }}</span>
                </a>
              </div>

              <!-- Dokan Badge -->
              <div class="text-right">
                <span class="text-[11px] text-slate-400 block font-medium">দোকান</span>
                <span class="text-xs font-bold text-slate-800 truncate max-w-[140px] block">{{ getStoreName(order.store_slug) }}</span>
              </div>
            </div>

            <!-- Price & Quantity Bar -->
            <div class="flex items-center justify-between text-xs bg-slate-50 px-3 py-2 rounded-xl border border-slate-200/70">
              <span class="text-slate-500">পরিমাণ: <strong class="text-slate-800">{{ order.quantity }}টি</strong></span>
              <span class="font-black text-slate-900 text-sm">৳{{ order.total_price }}</span>
            </div>

            <!-- Courier Tracking Tag if available -->
            <div v-if="order.courier_data" class="flex items-center justify-between bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 text-xs">
              <span class="text-amber-800 font-bold flex items-center gap-1.5">
                <Truck class="w-3.5 h-3.5 text-amber-600" />
                <span>{{ order.courier_data.courier_slug === 'pathao' ? 'Pathao' : order.courier_data.courier_slug === 'redx' ? 'RedX' : 'Steadfast' }}</span>
              </span>
              <span class="font-mono font-bold text-amber-900">{{ order.courier_data.tracking_code }}</span>
            </div>

            <!-- Mobile Footer Actions -->
            <div class="flex items-center justify-between pt-2 border-t border-slate-100 gap-2">
              <div class="flex items-center gap-2">
                <!-- 1-Click Courier Button -->
                <button 
                  v-if="!order.courier_data && order.status !== 'cancelled'"
                  @click="openDispatchModal(order)"
                  class="px-2.5 py-1.5 text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                >
                  <Truck class="w-3.5 h-3.5 text-amber-600" />
                  <span>কুরিয়ার পাঠান</span>
                </button>

                <!-- Details Button -->
                <button 
                  @click="viewOrderDetails(order)"
                  class="px-2.5 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/60 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                >
                  <Eye class="w-3.5 h-3.5" />
                  <span>বিস্তারিত</span>
                </button>
              </div>

              <!-- Cancel Button -->
              <button 
                v-if="order.status !== 'cancelled'"
                @click="changeStatus(order.id, 'cancelled')"
                class="text-xs font-medium text-slate-400 hover:text-red-600 p-1 transition-colors"
                title="অর্ডার বাতিল"
              >
                <Trash2 class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        <!-- Orders Table (Desktop >= md) -->
        <div class="hidden md:block overflow-x-auto">
          <table class="w-full text-left text-xs sm:text-sm">
            <thead class="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-200/70 text-[11px] uppercase tracking-wider">
              <tr>
                <th class="py-3 px-4">অর্ডার আইডি</th>
                <th class="py-3 px-4">কাস্টমার</th>
                <th class="py-3 px-4">ফোন নম্বর</th>
                <th class="py-3 px-4">দোকান</th>
                <th class="py-3 px-4">পরিমাণ ও বিল</th>
                <th class="py-3 px-4">স্ট্যাটাস</th>
                <th class="py-3 px-4 text-center">কুরিয়ার</th>
                <th class="py-3 px-4 text-center">বিস্তারিত</th>
                <th class="py-3 px-4 text-right">ডিলিট</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 font-medium text-slate-700">
              <tr v-if="finalDisplayOrders.length === 0">
                <td colspan="9" class="py-12 text-center text-slate-400 font-semibold">
                  কোনো অর্ডার খুঁজে পাওয়া যায়নি।
                </td>
              </tr>
              <tr v-for="order in finalDisplayOrders" :key="order.id" class="hover:bg-slate-50/60 transition-colors">
                <!-- Order ID -->
                <td class="py-3.5 px-4 font-mono font-bold text-slate-600 text-xs">
                  <span class="bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-md text-slate-800 transition-colors">
                    #{{ order.id }}
                  </span>
                </td>

                <!-- Name -->
                <td class="py-3.5 px-4 font-bold text-slate-900">
                  {{ order.customer_name }}
                </td>

                <!-- Number -->
                <td class="py-3.5 px-4 font-mono font-semibold">
                  <a :href="`tel:${order.customer_phone}`" class="inline-flex items-center gap-1.5 text-emerald-700 hover:underline">
                    <PhoneCall class="w-3.5 h-3.5 text-emerald-600" />
                    <span>{{ order.customer_phone }}</span>
                  </a>
                </td>

                <!-- Dokan -->
                <td class="py-3.5 px-4">
                  <div class="font-bold text-slate-900 truncate max-w-[160px]">{{ getStoreName(order.store_slug) }}</div>
                  <span class="text-[11px] text-slate-400 font-mono">/s/{{ order.store_slug }}</span>
                </td>

                <!-- Poriman -->
                <td class="py-3.5 px-4">
                  <span class="font-black text-slate-900">৳{{ order.total_price }}</span>
                  <span class="text-xs text-slate-400 ml-1">({{ order.quantity }} টি)</span>
                </td>

                <!-- Status Select Dropdown -->
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
                    <option value="pending">পেন্ডিং</option>
                    <option value="confirmed">কনফার্মড</option>
                    <option value="under_courier">কুরিয়ারে আছে</option>
                    <option value="delivered">ডেলিভার্ড</option>
                    <option value="cancelled">বাতিল</option>
                  </select>
                </td>

                <!-- Courier Action Button in Row -->
                <td class="py-3.5 px-4 text-center">
                  <!-- Already Dispatched Badge -->
                  <div v-if="order.courier_data" class="inline-flex flex-col items-center gap-0.5">
                    <span class="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                      <Truck class="w-3 h-3 text-amber-600" />
                      <span>{{ order.courier_data.courier_slug === 'pathao' ? 'Pathao' : order.courier_data.courier_slug === 'redx' ? 'RedX' : 'Steadfast' }}</span>
                    </span>
                    <span class="font-mono text-[10px] font-bold text-slate-500">{{ order.courier_data.tracking_code }}</span>
                  </div>

                  <!-- 1-Click Dispatch Button in Row -->
                  <button 
                    v-else-if="order.status !== 'cancelled'"
                    @click="openDispatchModal(order)"
                    class="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-2xs"
                    title="কুরিয়ারে পাঠান"
                  >
                    <Truck class="w-3.5 h-3.5 text-amber-600" />
                    <span>কুরিয়ারে পাঠান</span>
                  </button>
                  <span v-else class="text-xs text-slate-300">-</span>
                </td>

                <!-- Details Button -->
                <td class="py-3.5 px-4 text-center">
                  <button 
                    @click="viewOrderDetails(order)"
                    class="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold inline-flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Eye class="w-3.5 h-3.5" />
                    <span>বিস্তারিত</span>
                  </button>
                </td>

                <!-- Delete Button -->
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
        </template>
      </div>

    </main>

    <!-- Custom Modal: Edit Stock -->
    <div v-if="stockModal.isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div class="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-200">
        <div>
          <h3 class="text-base font-bold text-slate-900">স্টক আপডেট করুন</h3>
          <p class="text-xs text-slate-500 mt-1 truncate font-medium">দোকান: {{ stockModal.store?.product_title }}</p>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1.5">নতুন স্টক সংখ্যা</label>
          <input
            v-model.number="stockModal.value"
            type="number"
            min="0"
            class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            placeholder="0"
            @keyup.enter="confirmStockUpdate"
          />
        </div>
        <div class="flex items-center justify-end gap-2 pt-2">
          <button
            @click="stockModal.isOpen = false"
            class="px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            বাতিল
          </button>
          <button
            @click="confirmStockUpdate"
            :disabled="stockModal.isSubmitting"
            class="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-50"
          >
            {{ stockModal.isSubmitting ? 'আপডেট হচ্ছে...' : 'সংরক্ষণ করুন' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Custom Modal: Meta Pixel Setup -->
    <div v-if="pixelModal.isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div class="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-200">
        <div class="flex items-center justify-between">
          <div class="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Activity class="w-5 h-5" />
          </div>
          <button @click="pixelModal.isOpen = false" class="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X class="w-5 h-5" />
          </button>
        </div>
        
        <div>
          <h3 class="text-base font-black text-slate-900">মেটা (ফেসবুক) পিক্সেল সেটআপ</h3>
          <p class="text-xs text-slate-500 mt-1 leading-relaxed">
            দোকান: <span class="font-bold text-slate-800">{{ pixelModal.store?.product_title }}</span>
          </p>
        </div>

        <div class="space-y-3 text-xs">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Meta Pixel ID (পিক্সেল আইডি):</label>
            <input 
              type="text"
              v-model="pixelModal.value"
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-mono font-bold text-slate-900 focus:outline-none focus:border-indigo-500 bg-slate-50"
              placeholder="যেমন: 123456789012345"
            />
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">
              Conversions API (CAPI) Access Token:
              <span class="text-slate-400 font-normal">(অপশনাল)</span>
            </label>
            <input 
              type="password"
              v-model="pixelModal.accessToken"
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-mono text-slate-900 focus:outline-none focus:border-indigo-500 bg-slate-50"
              placeholder="EAA..."
            />
            <p class="text-[10px] text-slate-400 leading-normal mt-1">
              🔑 টোকেন দিলে অ্যাডমিন যখন কোনো অর্ডারকে <strong>"কনফার্মড"</strong> করবেন, সাথে সাথে সার্ভার থেকে মেটায় অফিসিয়াল <strong>Purchase</strong> ইভেন্ট চলে যাবে।
            </p>
          </div>

          <p class="text-[11px] text-slate-500 leading-normal pt-1 bg-amber-50 p-2.5 rounded-xl border border-amber-200/60">
            💡 <strong>স্মার্ট COD ট্র্যাকিং:</strong> কাস্টমার অর্ডার সাবমিট করলে সুরক্ষিত <strong>Lead</strong> ইভেন্ট ফায়ার হয়, এবং ফোনে কনফার্ম করার পর CAPI দিয়ে <strong>Purchase</strong> ইভেন্ট যায়।
          </p>
        </div>

        <div class="flex items-center justify-end gap-2 pt-2">
          <button
            @click="pixelModal.isOpen = false"
            class="px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            বাতিল
          </button>
          <button
            @click="confirmPixelUpdate"
            :disabled="pixelModal.isSubmitting"
            class="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-50"
          >
            {{ pixelModal.isSubmitting ? 'সেভ হচ্ছে...' : 'পিক্সেল সেভ করুন' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Custom Modal: Telegram Account-Wide 1-Click Setup -->
    <div v-if="telegramModal.isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div class="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-200">
        <div class="flex items-center justify-between">
          <div class="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
            <Send class="w-5 h-5" />
          </div>
          <button @click="telegramModal.isOpen = false" class="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X class="w-5 h-5" />
          </button>
        </div>
        
        <div>
          <h3 class="text-base font-black text-slate-900">টেলিগ্রাম অর্ডার নোটিফিকেশন</h3>
          <p class="text-xs text-slate-500 mt-1 leading-relaxed">
            মার্চেন্ট অ্যাকাউন্ট: <span class="font-bold text-slate-800">{{ currentUser?.displayName || 'মার্চেন্ট' }}</span>
          </p>
        </div>

        <!-- Telegram Account-Wide Connect Box -->
        <div class="space-y-3.5 text-xs">
          <!-- Active Status Banner if already connected -->
          <div v-if="userTelegramChatId" class="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-900">
            <div class="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
              <CheckCircle2 class="w-5 h-5" />
            </div>
            <div>
              <span class="font-bold text-xs block">টেলিগ্রাম সক্রিয় আছে!</span>
              <span class="text-[11px] text-emerald-700 font-mono">Chat ID: {{ userTelegramChatId }}</span>
              <p class="text-[10px] text-slate-500 mt-0.5">আপনার সকল স্টোরের অর্ডার এই টেলিগ্রামে আসবে।</p>
            </div>
          </div>

          <!-- Step-by-step easy guide -->
          <div class="p-4 bg-sky-50/70 border border-sky-100 rounded-2xl space-y-3">
            <div class="flex items-center gap-2">
              <span class="w-5 h-5 rounded-full bg-sky-600 text-white flex items-center justify-center text-[10px] font-bold">1</span>
              <span class="font-bold text-slate-900 text-xs">টেলিগ্রাম বটে Start দিন:</span>
            </div>
            <p class="text-slate-600 text-[11px] leading-relaxed pl-7">
              নিচের বাটনে চাপ দিলে আমাদের বট <strong>@{{ telegramBotUsername || 'dokanai_bot' }}</strong> ওপেন হবে। <b>START</b> বাটন চাপলে বট আপনাকে একটি চ্যাট আইডি দেবে।
            </p>
            <div class="pl-7">
              <a 
                :href="`https://t.me/${telegramBotUsername || 'dokanai_bot'}`"
                target="_blank"
                class="inline-flex items-center gap-1.5 px-3.5 py-2 bg-sky-500 hover:bg-sky-600 active:scale-95 text-white font-bold rounded-xl text-xs shadow-sm transition-all"
              >
                <Send class="w-3.5 h-3.5" />
                <span>টেলিগ্রাম বটের লিংক খুলুন</span>
              </a>
            </div>

            <div class="flex items-center gap-2 pt-2 border-t border-sky-200/50">
              <span class="w-5 h-5 rounded-full bg-sky-600 text-white flex items-center justify-center text-[10px] font-bold">2</span>
              <span class="font-bold text-slate-900 text-xs">চ্যাট আইডি পেস্ট করুন:</span>
            </div>
            <div class="pl-7 space-y-1.5">
              <p class="text-slate-500 text-[11px]">বট থেকে পাওয়া আইডিটি এখানে দিয়ে সেভ করুন:</p>
              <input 
                type="text"
                v-model="telegramModal.chatId"
                class="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-sky-500 bg-white"
                placeholder="যেমন: 589218492"
              />
            </div>
          </div>
        </div>

        <div class="flex items-center justify-between pt-2 border-t border-slate-100">
          <button
            v-if="userTelegramChatId"
            @click="disconnectTelegram"
            class="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer"
          >
            ডিসকানেক্ট করুন
          </button>
          <div v-else></div>

          <div class="flex items-center gap-2">
            <button
              @click="telegramModal.isOpen = false"
              class="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              বন্ধ করুন
            </button>
            <button
              @click="confirmTelegramUpdate"
              :disabled="telegramModal.isSubmitting"
              class="px-4 py-1.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 active:scale-95 rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-50"
            >
              {{ telegramModal.isSubmitting ? 'সেভ হচ্ছে...' : 'সেভ করুন' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Custom Modal: Courier Settings & API Setup -->
    <div v-if="courierModal.isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div class="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-200">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <div class="flex items-center gap-2.5">
            <div class="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Truck class="w-5 h-5" />
            </div>
            <div>
              <h3 class="text-base font-black text-slate-900">কুরিয়ার সার্ভিস ইন্টিগ্রেশন</h3>
              <span class="text-[11px] text-emerald-600 font-bold block">অটোমেটেড পার্সেল বুকিং</span>
            </div>
          </div>
          <button @click="courierModal.isOpen = false" class="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X class="w-5 h-5" />
          </button>
        </div>

        <p class="text-xs text-slate-500 leading-relaxed">
          আপনার পছন্দের বাংলাদেশি কুরিয়ার সিলেক্ট করুন। অর্ডার আসলে ১-ক্লিকে সরাসরি কুরিয়ার সার্ভারে পার্সেল রিকোয়েস্ট চলে যাবে।
        </p>

        <!-- Courier Selector Tabs -->
        <div class="grid grid-cols-3 gap-2">
          <button 
            type="button"
            @click="courierModal.selected = 'steadfast'"
            class="p-2.5 rounded-2xl border-2 text-center transition-all cursor-pointer"
            :class="courierModal.selected === 'steadfast' ? 'border-amber-500 bg-amber-50/50 shadow-xs' : 'border-slate-200 hover:border-slate-300'"
          >
            <span class="text-lg block">🚚</span>
            <span class="text-xs font-bold block text-slate-800">Steadfast</span>
            <span class="text-[10px] text-emerald-600 font-bold">সক্রিয়</span>
          </button>
          <button 
            type="button"
            @click="courierModal.selected = 'pathao'"
            class="p-2.5 rounded-2xl border-2 text-center transition-all cursor-pointer"
            :class="courierModal.selected === 'pathao' ? 'border-red-500 bg-red-50/50 shadow-xs' : 'border-slate-200 hover:border-slate-300'"
          >
            <span class="text-lg block">🏍️</span>
            <span class="text-xs font-bold block text-slate-800">Pathao</span>
            <span class="text-[10px] text-slate-400">কানেক্টেড</span>
          </button>
          <button 
            type="button"
            @click="courierModal.selected = 'redx'"
            class="p-2.5 rounded-2xl border-2 text-center transition-all cursor-pointer"
            :class="courierModal.selected === 'redx' ? 'border-rose-500 bg-rose-50/50 shadow-xs' : 'border-slate-200 hover:border-slate-300'"
          >
            <span class="text-lg block">📦</span>
            <span class="text-xs font-bold block text-slate-800">RedX</span>
            <span class="text-[10px] text-slate-400">কানেক্টেড</span>
          </button>
        </div>

        <!-- Fake API Configuration Inputs -->
        <div class="space-y-3 pt-1 text-xs">
          <div>
            <label class="block font-bold text-slate-700 mb-1">
              {{ courierModal.selected === 'pathao' ? 'Pathao Client ID:' : courierModal.selected === 'redx' ? 'RedX App Key:' : 'Steadfast API Key:' }}
            </label>
            <input 
              type="text"
              v-model="courierModal.apiKey"
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono text-slate-800 focus:outline-none focus:border-amber-500 bg-white"
              :placeholder="courierModal.selected === 'pathao' ? 'যেমন: client_id_...' : 'যেমন: st_api_...'"
            />
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">
              {{ courierModal.selected === 'pathao' ? 'Client Secret / Bearer Token:' : courierModal.selected === 'redx' ? 'RedX Access Secret:' : 'Secret Key:' }}
            </label>
            <input 
              type="password"
              v-model="courierModal.secretKey"
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono text-slate-800 focus:outline-none focus:border-amber-500 bg-white"
              placeholder="আপনার কুরিয়ার প্যানেল থেকে কপি করে পেস্ট করুন"
            />
          </div>
          <p class="text-[11px] text-slate-500 leading-tight">
            💡 আপনার কুরিয়ার অ্যাকাউন্ট ড্যাশবোর্ড থেকে API Key ও Secret দিয়ে সেভ করুন।
          </p>
        </div>

        <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            @click="courierModal.isOpen = false"
            class="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            বন্ধ করুন
          </button>
          <button
            @click="saveCourierSettings"
            class="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 active:scale-95 rounded-xl transition-all shadow-sm cursor-pointer"
          >
            সংরক্ষণ করুন
          </button>
        </div>
      </div>
    </div>

    <!-- Custom Modal: Dispatch Order to Courier -->
    <div v-if="dispatchModal.isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div class="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-200">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-black">
              <Truck class="w-4 h-4" />
            </div>
            <div>
              <h3 class="text-sm font-black text-slate-900">কুরিয়ার পার্সেল বুকিং</h3>
              <span class="text-[10px] text-slate-400 font-mono">{{ dispatchModal.order?.id }}</span>
            </div>
          </div>
          <button @click="dispatchModal.isOpen = false" class="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X class="w-4 h-4" />
          </button>
        </div>

        <div class="p-3 bg-slate-50 rounded-2xl border border-slate-200/70 text-xs space-y-1 text-slate-600">
          <div>গ্রাহক: <strong class="text-slate-900">{{ dispatchModal.order?.customer_name }}</strong></div>
          <div>ফোন: <span class="font-mono font-bold text-slate-900">{{ dispatchModal.order?.customer_phone }}</span></div>
          <div>ঠিকানা: <span class="text-slate-700">{{ dispatchModal.order?.customer_address }}</span></div>
          <div class="pt-1 flex justify-between font-bold text-slate-900 border-t border-slate-200/80">
            <span>ক্যাশ কালেকশন (COD):</span>
            <span class="text-emerald-700">৳{{ dispatchModal.order?.total_price }}</span>
          </div>
        </div>

        <!-- Choose Courier -->
        <div class="space-y-1.5 text-xs">
          <label class="block font-bold text-slate-700">কুরিয়ার সিলেক্ট করুন:</label>
          <div class="grid grid-cols-3 gap-2">
            <button 
              type="button" 
              @click="dispatchModal.courier = 'steadfast'"
              class="p-2 rounded-xl border text-center font-bold transition-all cursor-pointer"
              :class="dispatchModal.courier === 'steadfast' ? 'border-amber-500 bg-amber-50 text-amber-900' : 'border-slate-200 text-slate-700'"
            >
              Steadfast
            </button>
            <button 
              type="button" 
              @click="dispatchModal.courier = 'pathao'"
              class="p-2 rounded-xl border text-center font-bold transition-all cursor-pointer"
              :class="dispatchModal.courier === 'pathao' ? 'border-red-500 bg-red-50 text-red-900' : 'border-slate-200 text-slate-700'"
            >
              Pathao
            </button>
            <button 
              type="button" 
              @click="dispatchModal.courier = 'redx'"
              class="p-2 rounded-xl border text-center font-bold transition-all cursor-pointer"
              :class="dispatchModal.courier === 'redx' ? 'border-rose-500 bg-rose-50 text-rose-900' : 'border-slate-200 text-slate-700'"
            >
              RedX
            </button>
          </div>
        </div>

        <!-- If API credentials not configured, block and prompt to setup -->
        <div v-if="!hasCourierCredentials" class="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-2.5 text-xs text-amber-900">
          <div class="flex items-center gap-2 font-bold text-amber-950">
            <Truck class="w-4 h-4 text-amber-600" />
            <span>কুরিয়ার API কানেক্ট করা নেই</span>
          </div>
          <p class="leading-relaxed text-[11px] text-amber-800">
            পার্সেল বুকিং করতে প্রথমে আপনার কুরিয়ার সার্ভিসের API Key ও Secret দিয়ে ইন্টিগ্রেশন সম্পন্ন করুন।
          </p>
          <button
            type="button"
            @click="dispatchModal.isOpen = false; courierModal.isOpen = true"
            class="w-full py-2 px-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer text-center"
          >
            ⚙️ কুরিয়ার API সেটআপ করুন
          </button>
        </div>

        <button
          v-else
          @click="confirmDispatch"
          :disabled="dispatchModal.isLoading"
          class="w-full py-2.5 px-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-75 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer"
        >
          <Loader2 v-if="dispatchModal.isLoading" class="w-4 h-4 animate-spin text-white" />
          <span v-else>🚀 বুকিং কনফার্ম করুন</span>
        </button>
      </div>
    </div>

    <!-- Custom Modal: Confirm Delete Store -->
    <div v-if="deleteModal.isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div class="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-200">
        <div class="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
          <Trash2 class="w-5 h-5" />
        </div>
        <div>
          <h3 class="text-base font-bold text-slate-900">দোকান ডিলিট করবেন?</h3>
          <p class="text-xs text-slate-500 mt-1 leading-relaxed">
            আপনি কি নিশ্চিতভাবে <span class="font-bold text-slate-800">"{{ deleteModal.store?.product_title }}"</span> দোকানটি ডিলিট করতে চান? এই একশনটি ফিরিয়ে আনা যাবে না।
          </p>
        </div>
        <div class="flex items-center justify-end gap-2 pt-2">
          <button
            @click="deleteModal.isOpen = false"
            class="px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            না, রাখুন
          </button>
          <button
            @click="confirmDeleteStore"
            :disabled="deleteModal.isSubmitting"
            class="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 active:scale-95 rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-50"
          >
            {{ deleteModal.isSubmitting ? 'ডিলিট হচ্ছে...' : 'হ্যাঁ, ডিলিট করুন' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Custom Modal: Order Full Details -->
    <div v-if="orderModal.isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div class="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-in fade-in zoom-in-95 duration-200">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 class="text-base font-black text-slate-900">অর্ডার বিস্তারিত বিবরণ</h3>
            <span class="text-xs text-slate-400 font-mono">{{ formatTime(orderModal.order?.created_at) }}</span>
          </div>
          <button 
            @click="orderModal.isOpen = false"
            class="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <div v-if="orderModal.order" class="space-y-3.5 text-xs sm:text-sm">
          <!-- Customer Info -->
          <div class="p-3 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-1.5">
            <div class="text-[11px] font-bold uppercase tracking-wider text-slate-400">গ্রাহক তথ্য</div>
            <div class="font-bold text-slate-900 text-sm sm:text-base">{{ orderModal.order.customer_name }}</div>
            <div class="flex items-center gap-2 pt-0.5">
              <a :href="`tel:${orderModal.order.customer_phone}`" class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg font-mono font-bold hover:bg-emerald-100 transition-colors">
                <PhoneCall class="w-3.5 h-3.5" />
                <span>{{ orderModal.order.customer_phone }}</span>
              </a>
              <button 
                type="button"
                @click="copyPhoneNumber(orderModal.order.customer_phone)"
                class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 active:scale-95 transition-all shadow-2xs cursor-pointer"
                title="নম্বর কপি করুন"
              >
                <Copy class="w-3.5 h-3.5 text-slate-500" />
                <span>কপি</span>
              </button>
            </div>
          </div>

          <!-- Delivery Address -->
          <div class="p-3 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-1.5">
            <div class="text-[11px] font-bold uppercase tracking-wider text-slate-400">ডেলিভারি ঠিকানা ও জোন</div>
            <div class="text-slate-800 font-medium leading-relaxed">
              📍 {{ orderModal.order.customer_address }}
            </div>
            <div class="pt-1">
              <span class="text-[11px] px-2.5 py-0.5 rounded-full font-bold" :class="orderModal.order.delivery_zone === 'outside_dhaka' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'">
                {{ orderModal.order.delivery_zone === 'outside_dhaka' ? 'ঢাকার বাইরে' : 'ঢাকার ভিতরে' }}
              </span>
            </div>
          </div>

          <!-- Product & Order Specs -->
          <div class="p-3 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-2">
            <div class="text-[11px] font-bold uppercase tracking-wider text-slate-400">অর্ডার সারসংক্ষেপ</div>
            <div class="flex justify-between items-center text-xs">
              <span class="text-slate-500">দোকান:</span>
              <NuxtLink :to="`/s/${orderModal.order.store_slug}`" target="_blank" class="font-bold text-emerald-600 hover:underline">
                {{ getStoreName(orderModal.order.store_slug) }} (/s/{{ orderModal.order.store_slug }})
              </NuxtLink>
            </div>
            <div v-if="orderModal.order.selected_variant" class="flex justify-between items-center text-xs">
              <span class="text-slate-500">সিলেক্টেড ভ্যারিয়েন্ট:</span>
              <span class="font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">{{ orderModal.order.selected_variant }}</span>
            </div>
            <div class="flex justify-between items-center text-xs">
              <span class="text-slate-500">পণ্যের পরিমাণ:</span>
              <span class="font-bold text-slate-800">{{ orderModal.order.quantity }} টি</span>
            </div>
            <div class="flex justify-between items-center text-sm pt-2 border-t border-slate-200 font-black">
              <span class="text-slate-900">সর্বমোট ক্যাশ অন ডেলিভারি বিল:</span>
              <span class="text-emerald-700 text-base">৳{{ orderModal.order.total_price }}</span>
            </div>
          </div>

          <!-- Courier Tracking Info Banner if Dispatched -->
          <div v-if="orderModal.order.courier_data" class="p-3 bg-amber-50 rounded-2xl border border-amber-200 space-y-1">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <Truck class="w-4 h-4 text-amber-600" />
                <span>{{ orderModal.order.courier_data.courier_name }}</span>
              </span>
              <span class="font-mono text-xs font-black text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded-md">
                {{ orderModal.order.courier_data.tracking_code }}
              </span>
            </div>
            <p class="text-[11px] text-amber-700">পার্সেলটি পিকআপের অপেক্ষায় কুরিয়ার সিস্টেমে নিবন্ধিত হয়েছে।</p>
          </div>

          <!-- Dispatch to Courier Button if not dispatched yet -->
          <div v-else-if="orderModal.order.status !== 'cancelled'" class="pt-1">
            <button
              @click="openDispatchModal(orderModal.order)"
              class="w-full py-2.5 px-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <Truck class="w-4 h-4" />
              <span>🚀 কুরিয়ারে পাঠান (Steadfast / Pathao 1-Click Dispatch)</span>
            </button>
          </div>

          <!-- Status Editor in Modal -->
          <div class="flex items-center justify-between pt-1">
            <span class="text-xs font-bold text-slate-600">অর্ডার স্ট্যাটাস পরিবর্তন:</span>
            <select 
              :value="orderModal.order.status"
              @change="changeStatus(orderModal.order.id, $event.target.value); orderModal.order.status = $event.target.value"
              class="px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-emerald-500"
            >
              <option value="pending">পেন্ডিং</option>
              <option value="confirmed">কনফার্মড</option>
              <option value="under_courier">কুরিয়ারে আছে</option>
              <option value="delivered">ডেলিভার্ড</option>
              <option value="cancelled">বাতিল</option>
            </select>
          </div>
        </div>

        <div class="pt-2">
          <button
            @click="orderModal.isOpen = false"
            class="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { RefreshCw, Plus, Banknote, ShoppingBag, Clock, Store, Boxes, Copy, ExternalLink, PhoneCall, Trash2, Eye, X, Activity, Send, Truck, Loader2 } from 'lucide-vue-next'
import { useAuth } from '~/composables/useAuth'
import { useAuthModal } from '~/composables/useAuthModal'
import { useAppToast } from '~/composables/useAppToast'

const { currentUser, initAuth } = useAuth()
const { openLogin } = useAuthModal()
const router = useRouter()
const toast = useAppToast()

const isLoading = ref(true)
const isRefreshing = ref(false)
const activeStatusFilter = ref('all')
const selectedStoreFilter = ref('all')

const stores = ref([])
const orders = ref([])

// Custom Modals State
const stockModal = reactive({
  isOpen: false,
  store: null,
  value: 0,
  isSubmitting: false
})

const deleteModal = reactive({
  isOpen: false,
  store: null,
  isSubmitting: false
})

const orderModal = reactive({
  isOpen: false,
  order: null
})

const pixelModal = reactive({
  isOpen: false,
  store: null,
  value: '',
  accessToken: '',
  isSubmitting: false
})

const telegramModal = reactive({
  isOpen: false,
  store: null,
  chatId: '',
  isSubmitting: false
})

const courierModal = reactive({
  isOpen: false,
  selected: 'steadfast',
  apiKey: '',
  secretKey: ''
})

const hasCourierCredentials = computed(() => {
  return !!(courierModal.apiKey && courierModal.secretKey)
})

const dispatchModal = reactive({
  isOpen: false,
  order: null,
  courier: 'steadfast',
  isLoading: false
})

const saveCourierSettings = () => {
  if (!courierModal.apiKey || !courierModal.secretKey) {
    toast.error('API Key ও Secret Key উভয়ই প্রদান করুন')
    return
  }
  if (import.meta.client) {
    localStorage.setItem('dokan_courier_settings', JSON.stringify({
      selected: courierModal.selected,
      apiKey: courierModal.apiKey,
      secretKey: courierModal.secretKey
    }))
  }
  courierModal.isOpen = false
  toast.success('কুরিয়ার API সেটিংস সফলভাবে সংরক্ষিত হয়েছে!')
}

const openDispatchModal = (order) => {
  dispatchModal.order = order
  dispatchModal.courier = courierModal.selected || 'steadfast'
  dispatchModal.isOpen = true
}

const confirmDispatch = async () => {
  if (!dispatchModal.order) return
  dispatchModal.isLoading = true
  try {
    const res = await $fetch('/api/courier/dispatch', {
      method: 'POST',
      body: {
        order_id: dispatchModal.order.id,
        courier: dispatchModal.courier
      }
    })

    if (res?.success) {
      toast.success(res.message || 'কুরিয়ারে পার্সেল বুকিং সফল হয়েছে!')
      dispatchModal.isOpen = false
      if (orderModal.order && orderModal.order.id === dispatchModal.order.id) {
        orderModal.order.status = 'under_courier'
        orderModal.order.courier_data = {
          courier_name: res.courier_name,
          tracking_code: res.tracking_code
        }
      }
      await refreshData()
    }
  } catch (err) {
    toast.error('কুরিয়ারে বুকিং করতে সমস্যা হয়েছে।')
  } finally {
    dispatchModal.isLoading = false
  }
}

const userTelegramChatId = ref(null)

const runtimeConfig = useRuntimeConfig()
const telegramBotUsername = computed(() => runtimeConfig.public?.telegramBotUsername || '')

const viewOrderDetails = (order) => {
  orderModal.order = order
  orderModal.isOpen = true
}

onMounted(async () => {
  await initAuth()
  // Strict Login Check: If not logged in, show login alert dialog immediately (mandatory)
  if (!currentUser.value) {
    openLogin('/dashboard', false)
    isLoading.value = false
    return
  }

  // Load saved courier settings if any
  if (import.meta.client) {
    try {
      const savedCourier = JSON.parse(localStorage.getItem('dokan_courier_settings') || '{}')
      if (savedCourier.apiKey && savedCourier.secretKey) {
        courierModal.selected = savedCourier.selected || 'steadfast'
        courierModal.apiKey = savedCourier.apiKey
        courierModal.secretKey = savedCourier.secretKey
      }
    } catch (e) {}
  }

  await refreshData()
  isLoading.value = false
  const interval = setInterval(refreshData, 15000)
  onUnmounted(() => clearInterval(interval))
})

const refreshData = async () => {
  isRefreshing.value = true
  try {
    const promises = [
      $fetch('/api/stores'),
      $fetch('/api/orders')
    ]

    const uid = currentUser.value?.id
    if (uid) {
      promises.push($fetch(`/api/user/settings?user_id=${uid}`))
    }

    const [storesRes, ordersRes, userSettingsRes] = await Promise.all(promises)
    let loadedStores = storesRes?.stores || []
    
    if (userSettingsRes?.telegram_chat_id) {
      userTelegramChatId.value = userSettingsRes.telegram_chat_id
    }

    stores.value = loadedStores
    orders.value = ordersRes?.orders || []
  } catch (err) {
    console.error('Failed to load dashboard data:', err)
  } finally {
    isRefreshing.value = false
    isLoading.value = false
  }
}

// User stores list (supports managing multiple stores)
const userStores = computed(() => {
  if (!currentUser.value) return []
  const myStores = stores.value.filter(s => s.user_id === currentUser.value?.id)
  return myStores
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

const getStoreName = (slug) => {
  const match = stores.value.find(s => s.slug === slug)
  return match?.product_title || slug
}

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
    toast.success('স্টক সফলভাবে আপডেট করা হয়েছে!')
  } catch (e) {
    toast.error('স্টক আপডেট করা সম্ভব হয়নি।')
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
  { value: 'all', label: 'সকল অর্ডার' },
  { value: 'pending', label: 'পেন্ডিং' },
  { value: 'confirmed', label: 'কনফার্মড' },
  { value: 'under_courier', label: 'কুরিয়ারে আছে' },
  { value: 'delivered', label: 'ডেলিভার্ড' },
  { value: 'cancelled', label: 'বাতিল' }
]

const openStockPrompt = (st) => {
  stockModal.store = st
  stockModal.value = getStoreStock(st)
  stockModal.isOpen = true
}

const openPixelModal = (st) => {
  pixelModal.store = st
  pixelModal.value = st.config?.pixel_id || ''
  pixelModal.accessToken = st.config?.meta_access_token || ''
  pixelModal.isOpen = true
}

let telegramPollingTimer = null

const openAccountTelegramModal = () => {
  telegramModal.chatId = userTelegramChatId.value || ''
  telegramModal.isOpen = true
}

const openTelegramModal = (st) => {
  openAccountTelegramModal()
}

const confirmTelegramUpdate = async () => {
  const cleanChatId = telegramModal.chatId.trim()
  if (!currentUser.value?.id) {
    toast.error('অনুগ্রহ করে প্রথমে লগইন করুন')
    return
  }
  telegramModal.isSubmitting = true
  const uid = currentUser.value.id

  try {
    await $fetch('/api/user/settings', {
      method: 'PATCH',
      body: {
        user_id: uid,
        telegram_chat_id: cleanChatId || null
      }
    })

    userTelegramChatId.value = cleanChatId || null
    telegramModal.isOpen = false
    if (cleanChatId) {
      toast.success('টেলিগ্রাম চ্যাট আইডি সফলভাবে সেভ করা হয়েছে!')
    } else {
      toast.success('টেলিগ্রাম এলার্ট বন্ধ করা হয়েছে।')
    }
  } catch (e) {
    toast.error('টেলিগ্রাম সেটিংস আপডেট করা সম্ভব হয়নি।')
  } finally {
    telegramModal.isSubmitting = false
  }
}

const disconnectTelegram = async () => {
  telegramModal.chatId = ''
  await confirmTelegramUpdate()
}

const confirmPixelUpdate = async () => {
  if (!pixelModal.store) return
  const cleanId = pixelModal.value.trim()
  const cleanToken = pixelModal.accessToken.trim()
  pixelModal.isSubmitting = true
  try {
    await $fetch('/api/stores', {
      method: 'PATCH',
      body: { 
        slug: pixelModal.store.slug, 
        pixel_id: cleanId || null,
        meta_access_token: cleanToken || null
      }
    })
    
    // Update local state reactively
    const match = stores.value.find(s => s.slug === pixelModal.store.slug)
    if (match) {
      if (!match.config) match.config = {}
      match.config.pixel_id = cleanId || null
      match.config.meta_access_token = cleanToken || null
    }
    
    pixelModal.isOpen = false
    if (cleanId) {
      toast.success('মেটা পিক্সেল ও কনভার্সন API সফলভাবে সেভ করা হয়েছে!')
    } else {
      toast.success('মেটা পিক্সেল নিষ্ক্রিয় করা হয়েছে।')
    }
  } catch (e) {
    toast.error('পিক্সেল আপডেট করা সম্ভব হয়নি।')
  } finally {
    pixelModal.isSubmitting = false
  }
}

const confirmStockUpdate = async () => {
  if (!stockModal.store) return
  const num = parseInt(stockModal.value, 10)
  if (isNaN(num) || num < 0) {
    toast.warning('দয়া করে সঠিক স্টক সংখ্যা প্রদান করুন।')
    return
  }
  stockModal.isSubmitting = true
  try {
    await quickAdjustStock(stockModal.store.slug, num)
    stockModal.isOpen = false
  } finally {
    stockModal.isSubmitting = false
  }
}

const deleteStore = (st) => {
  deleteModal.store = st
  deleteModal.isOpen = true
}

const confirmDeleteStore = async () => {
  if (!deleteModal.store) return
  deleteModal.isSubmitting = true
  const st = deleteModal.store

  try {
    await $fetch('/api/stores', {
      method: 'DELETE',
      body: { slug: st.slug }
    })
    
    // Persist deleted state locally in browser as well
    if (import.meta.client) {
      try {
        const deletedList = JSON.parse(localStorage.getItem('dokan_deleted_stores') || '[]')
        if (!deletedList.includes(st.slug)) {
          deletedList.push(st.slug)
          localStorage.setItem('dokan_deleted_stores', JSON.stringify(deletedList))
        }
      } catch (e) {}
    }

    stores.value = stores.value.filter(s => s.slug !== st.slug)
    if (selectedStoreFilter.value === st.slug) {
      selectedStoreFilter.value = 'all'
    }
    deleteModal.isOpen = false
    toast.success(`"${st.product_title}" দোকানটি ডিলিট করা হয়েছে।`)
  } catch (err) {
    toast.error('দোকান ডিলিট করতে সমস্যা হয়েছে।')
  } finally {
    deleteModal.isSubmitting = false
  }
}

const copyStoreLink = (slug) => {
  const url = `${window.location.origin}/s/${slug}`
  navigator.clipboard.writeText(url)
  toast.success(`স্টোর লিংক কপি হয়েছে:\n${url}`)
}

const copyPhoneNumber = (phone) => {
  if (!phone) return
  navigator.clipboard.writeText(phone)
  toast.success(`ফোন নম্বর কপি হয়েছে: ${phone}`)
}

const changeStatus = async (orderId, newStatus) => {
  try {
    await $fetch('/api/orders', {
      method: 'PATCH',
      body: { order_id: orderId, status: newStatus }
    })
    await refreshData()
    toast.success('অর্ডার স্ট্যাটাস সফলভাবে আপডেট করা হয়েছে!')
  } catch (e) {
    toast.error('স্ট্যাটাস পরিবর্তন করা সম্ভব হয়নি।')
  }
}
</script>

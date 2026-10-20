<template>
  <div class="min-h-screen bg-slate-50 flex flex-col justify-between selection:bg-emerald-100">
    <!-- Clean Minimal Header -->
    <header class="bg-white border-b border-slate-200/80 sticky top-0 z-30">
      <div class="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        <NuxtLink :to="order?.store_slug ? `/s/${order.store_slug}` : '/'" class="flex items-center gap-2 group">
          <div class="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xs group-hover:scale-105 transition-transform">
            🛍️
          </div>
          <span class="font-bold text-slate-900 text-sm tracking-tight">{{ storeName || 'DokanAI স্টোর' }}</span>
        </NuxtLink>

        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          অর্ডার গৃহীত হয়েছে
        </span>
      </div>
    </header>

    <!-- Main Content Body -->
    <main class="max-w-xl w-full mx-auto px-4 py-8 sm:py-12 flex-1">
      <!-- Loading State -->
      <div v-if="isLoading" class="p-8 text-center space-y-3">
        <Loader2 class="w-8 h-8 animate-spin text-emerald-600 mx-auto" />
        <p class="text-xs font-semibold text-slate-500">অর্ডার লোড হচ্ছে...</p>
      </div>

      <!-- Order Details Card -->
      <div v-else class="space-y-6 animate-in fade-in zoom-in-95 duration-300">
        <!-- Success Confirmation Card -->
        <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm text-center space-y-4">
          <div class="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 class="w-9 h-9" />
          </div>

          <div>
            <span class="text-xs font-bold text-emerald-600 uppercase tracking-widest block mb-1">অর্ডার নিশ্চিতকরণ</span>
            <h1 class="text-2xl sm:text-3xl font-black text-slate-900 font-serif-bn">আপনার অর্ডার সফলভাবে গ্রহণ করা হয়েছে!</h1>
            <p class="text-xs sm:text-sm text-slate-500 mt-2 max-w-sm mx-auto leading-relaxed">
              ধন্যবাদ <strong>{{ order?.customer_name }}</strong>! আমাদের একজন প্রতিনিধি খুব শীঘ্রই আপনার মোবাইল নম্বরে ফোন করে অর্ডার ভেরিফাই করবেন।
            </p>
          </div>

          <!-- Highlighted Order ID Badge -->
          <div class="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-2 max-w-sm mx-auto">
            <div class="text-left">
              <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">ট্র্যাকিং অর্ডার আইডি</span>
              <span class="font-mono font-black text-slate-900 text-sm sm:text-base">{{ order?.id }}</span>
            </div>
            <button 
              @click="copyOrderId"
              class="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-2xs"
            >
              <Copy class="w-3.5 h-3.5 text-slate-500" />
              <span>{{ copied ? 'কপি হয়েছে!' : 'কপি' }}</span>
            </button>
          </div>
        </div>

        <!-- Order Summary Details -->
        <div class="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <h2 class="text-sm font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Receipt class="w-4 h-4 text-emerald-600" />
            <span>অর্ডারের বিস্তারিত তথ্য</span>
          </h2>

          <div class="space-y-2.5 text-xs sm:text-sm">
            <div v-if="order?.selected_variant" class="flex justify-between items-center py-1">
              <span class="text-slate-500">সিলেক্টেড ভ্যারিয়েন্ট:</span>
              <span class="font-bold text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded-lg">{{ order.selected_variant }}</span>
            </div>

            <div class="flex justify-between items-center py-1">
              <span class="text-slate-500">পণ্যের পরিমাণ:</span>
              <span class="font-bold text-slate-800">{{ order?.quantity || 1 }} টি</span>
            </div>

            <div class="flex justify-between items-center py-1">
              <span class="text-slate-500">ডেলিভারি এলাকা:</span>
              <span class="font-bold text-slate-800">{{ order?.delivery_zone === 'outside_dhaka' ? 'ঢাকার বাইরে (৳১৩০)' : 'ঢাকার ভিতরে (৳৭০)' }}</span>
            </div>

            <div class="flex justify-between items-center py-1">
              <span class="text-slate-500">পেমেন্ট মেথড:</span>
              <span class="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">ক্যাশ অন ডেলিভারি (COD)</span>
            </div>

            <div class="pt-2 border-t border-slate-100 flex justify-between items-center text-sm sm:text-base font-black">
              <span class="text-slate-900">সর্বমোট প্রদেয় বিল:</span>
              <span class="text-emerald-600 font-serif-bn text-lg">৳{{ order?.total_price }}</span>
            </div>
          </div>

          <!-- Courier Live Tracking Banner if Dispatched -->
          <div v-if="order?.courier_data" class="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <Truck class="w-4 h-4 text-amber-600" />
                <span>{{ order.courier_data.courier_name }} দ্বারা প্রেরিত</span>
              </span>
              <span class="font-mono text-xs font-black text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded-md">
                {{ order.courier_data.tracking_code }}
              </span>
            </div>
            <p class="text-[11px] text-amber-700 leading-relaxed">
              আপনার পার্সেলটি কুরিয়ারে বুকিং করা হয়েছে। খুব শীঘ্রই ডেলিভারিম্যান আপনার সাথে যোগাযোগ করবেন।
            </p>
          </div>

          <!-- Customer & Delivery Address Card -->
          <div class="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5 text-xs text-slate-600">
            <div class="font-bold text-slate-800 flex items-center gap-1.5">
              <Truck class="w-3.5 h-3.5 text-slate-400" />
              <span>ডেলিভারি ঠিকানা:</span>
            </div>
            <p class="leading-relaxed pl-5 font-medium text-slate-700">{{ order?.customer_address }}</p>
            <div class="pl-5 pt-1 text-[11px] text-slate-400">
              ফোন: <span class="font-mono text-slate-700 font-bold">{{ order?.customer_phone }}</span>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row gap-3">
          <NuxtLink 
            v-if="order?.store_slug"
            :to="`/s/${order.store_slug}`"
            class="flex-1 py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl text-xs sm:text-sm text-center shadow-md active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <ShoppingBag class="w-4 h-4" />
            <span>দোকানে ফিরে যান</span>
          </NuxtLink>

          <NuxtLink 
            to="/"
            class="py-3 px-4 bg-white hover:bg-slate-100 text-slate-700 font-bold rounded-2xl text-xs sm:text-sm text-center border border-slate-200 active:scale-98 transition-all cursor-pointer"
          >
            হোম পেজ
          </NuxtLink>
        </div>
      </div>
    </main>

    <!-- Clean Footer -->
    <footer class="py-4 text-center text-xs text-slate-400 border-t border-slate-200/60 bg-white">
      <div class="max-w-2xl mx-auto px-4">
        <span>Powered by <strong>DokanAI</strong> — বাংলাদেশের স্মার্ট ই-কমার্স বিল্ডার</span>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { CheckCircle2, Copy, Receipt, Truck, ShoppingBag, Loader2 } from 'lucide-vue-next'
import confetti from 'canvas-confetti'
import { useAppToast } from '~/composables/useAppToast'

const route = useRoute()
const toast = useAppToast()

const orderId = route.params.id
const order = ref(null)
const storeName = ref('')
const isLoading = ref(true)
const copied = ref(false)

onMounted(async () => {
  try {
    const res = await $fetch(`/api/orders?id=${orderId}`)
    if (res?.order) {
      order.value = res.order
      
      // Fetch store name
      if (order.value.store_slug) {
        try {
          const storeRes = await $fetch(`/api/stores?slug=${order.value.store_slug}`)
          if (storeRes?.store?.product_title) {
            storeName.value = storeRes.store.product_title
          }
        } catch (e) {}
      }

      // Trigger Celebration Confetti
      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 }
        })
      } catch (e) {}
    }
  } catch (err) {
    console.error('Failed to load order:', err)
  } finally {
    isLoading.value = false
  }
})

const copyOrderId = () => {
  if (!order.value?.id) return
  navigator.clipboard.writeText(order.value.id)
  copied.value = true
  toast.success('অর্ডার আইডি কপি করা হয়েছে!')
  setTimeout(() => {
    copied.value = false
  }, 2000)
}
</script>

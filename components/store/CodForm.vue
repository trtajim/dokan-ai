<template>
  <div id="order-form-section" class="bg-white rounded-3xl p-6 sm:p-8 border-2 shadow-xl" :class="borderAccentClass">
    <div class="text-center mb-6">
      <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2" :class="badgeClass">
        <ShieldCheck class="w-4 h-4" />
        <span>১০০% ক্যাশ অন ডেলিভারি</span>
      </div>
      <h3 class="text-2xl font-black text-slate-900">অর্ডার ফর্মটি পূরণ করুন</h3>
      <p class="text-xs sm:text-sm text-slate-500 mt-1">পণ্য হাতে পেয়ে চেক করে মূল্য পরিশোধ করবেন</p>
    </div>

    <!-- Success Screen -->
    <div v-if="orderSubmitted" class="py-10 text-center space-y-4 animate-in fade-in zoom-in-95 duration-300">
      <div class="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle2 class="w-10 h-10" />
      </div>
      <h4 class="text-2xl font-black text-slate-900">আপনার অর্ডার সফল হয়েছে!</h4>
      <p class="text-sm text-slate-600 max-w-md mx-auto">
        ধন্যবাদ <strong>{{ form.customer_name }}</strong>। আমাদের প্রতিনিধি খুব শীঘ্রই আপনার নম্বরে ({{ form.customer_phone }}) ফোন করে অর্ডার নিশ্চিত করবেন।
      </p>
      <div class="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 max-w-sm mx-auto text-left text-xs space-y-1.5">
        <div v-if="selectedVariantName" class="flex justify-between"><span>সিলেক্টেড ভ্যারিয়েন্ট:</span> <strong class="text-slate-800">{{ selectedVariantName }}</strong></div>
        <div class="flex justify-between"><span>মোট বিল:</span> <strong class="text-emerald-700 font-bold">৳{{ totalBill }}</strong></div>
        <div class="flex justify-between"><span>পেমেন্ট মাধ্যম:</span> <span>ক্যাশ অন ডেলিভারি</span></div>
        <div class="flex justify-between"><span>ডেলিভারি ঠিকানা:</span> <span class="truncate max-w-[180px]">{{ form.customer_address }}</span></div>
      </div>
      <button 
        @click="orderSubmitted = false" 
        class="mt-4 text-xs font-semibold text-slate-500 hover:text-slate-800 underline"
      >
        আরেকটি অর্ডার করুন
      </button>
    </div>

    <!-- The Active Checkout Form -->
    <form v-else @submit.prevent="submitOrder" class="space-y-4 text-xs sm:text-sm">
      
      <!-- VARIANT SELECTOR (E.g. 1kg vs 2kg or M vs L vs XL) -->
      <div v-if="availableVariants.length > 0" class="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
        <label class="block font-bold text-slate-800">পণ্য নির্বাচন করুন (সাইজ/ওজন/প্যাক): <span class="text-red-500">*</span></label>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <button 
            v-for="(v, vIdx) in availableVariants" 
            :key="vIdx"
            type="button"
            @click="selectedVariant = v"
            class="p-2.5 rounded-xl border-2 text-center transition-all flex flex-col items-center justify-center gap-0.5"
            :class="selectedVariant?.name === v.name ? borderActiveDeliveryClass : 'border-slate-200 bg-white hover:border-slate-300'"
          >
            <span class="font-bold text-xs truncate max-w-full">{{ v.name }}</span>
            <span class="text-[11px] font-black text-slate-900">৳{{ v.price || store.price }}</span>
          </button>
        </div>
      </div>

      <!-- Customer Name -->
      <div>
        <label class="block font-bold text-slate-800 mb-1.5">আপনার নাম: <span class="text-red-500">*</span></label>
        <input 
          v-model="form.customer_name" 
          type="text" 
          required 
          placeholder="আপনার সম্পূর্ণ নাম লিখুন" 
          class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 transition-all"
        />
      </div>

      <!-- Phone Number -->
      <div>
        <label class="block font-bold text-slate-800 mb-1.5">মোবাইল নম্বর: <span class="text-red-500">*</span></label>
        <input 
          v-model="form.customer_phone" 
          type="tel" 
          required 
          placeholder="যেমন: 01712345678" 
          maxlength="11"
          class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 transition-all font-mono"
        />
        <span v-if="phoneError" class="text-[11px] text-red-500 font-medium block mt-1">
          ১১ ডিজিটের সঠিক বাংলাদেশি মোবাইল নম্বর দিন
        </span>
      </div>

      <!-- Delivery Address -->
      <div>
        <label class="block font-bold text-slate-800 mb-1.5">সম্পূর্ণ ঠিকানা: <span class="text-red-500">*</span></label>
        <textarea 
          v-model="form.customer_address" 
          rows="2" 
          required 
          placeholder="বাসা নং, রোড নং, এলাকা এবং জেলা" 
          class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 transition-all resize-none"
        ></textarea>
      </div>

      <!-- Quantity Selector -->
      <div class="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
        <span class="font-bold text-slate-800">অর্ডার পরিমাণ:</span>
        <div class="flex items-center gap-3">
          <button 
            type="button" 
            @click="decrementQty"
            class="w-8 h-8 rounded-lg bg-white border border-slate-300 text-slate-700 font-bold flex items-center justify-center hover:bg-slate-100 active:scale-95"
          >
            -
          </button>
          <span class="font-extrabold text-base w-4 text-center">{{ form.quantity }}</span>
          <button 
            type="button" 
            @click="form.quantity++"
            class="w-8 h-8 rounded-lg bg-white border border-slate-300 text-slate-700 font-bold flex items-center justify-center hover:bg-slate-100 active:scale-95"
          >
            +
          </button>
        </div>
      </div>

      <!-- Delivery Zone Selection -->
      <div>
        <label class="block font-bold text-slate-800 mb-2">ডেলিভারি এরিয়া নির্বাচন করুন:</label>
        <div class="grid grid-cols-2 gap-3">
          <label 
            class="flex items-center justify-between p-3.5 rounded-xl border-2 cursor-pointer transition-all"
            :class="form.delivery_zone === 'inside_dhaka' ? borderActiveDeliveryClass : 'border-slate-200 bg-slate-50/50'"
          >
            <div class="flex items-center gap-2">
              <input type="radio" value="inside_dhaka" v-model="form.delivery_zone" class="accent-slate-900" />
              <span class="font-bold text-slate-800">ঢাকার ভিতরে</span>
            </div>
            <span class="font-extrabold text-slate-900">৳{{ feeInside }}</span>
          </label>

          <label 
            class="flex items-center justify-between p-3.5 rounded-xl border-2 cursor-pointer transition-all"
            :class="form.delivery_zone === 'outside_dhaka' ? borderActiveDeliveryClass : 'border-slate-200 bg-slate-50/50'"
          >
            <div class="flex items-center gap-2">
              <input type="radio" value="outside_dhaka" v-model="form.delivery_zone" class="accent-slate-900" />
              <span class="font-bold text-slate-800">ঢাকার বাইরে</span>
            </div>
            <span class="font-extrabold text-slate-900">৳{{ feeOutside }}</span>
          </label>
        </div>
      </div>

      <!-- Price Breakdown Summary -->
      <div class="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-2 mt-4">
        <div class="flex justify-between text-slate-600">
          <span>প্রোডাক্ট মূল্য:</span>
          <span>৳{{ unitItemPrice }} × {{ form.quantity }} = <strong>৳{{ unitItemPrice * form.quantity }}</strong></span>
        </div>
        <div class="flex justify-between text-slate-600">
          <span>ডেলিভারি চার্জ:</span>
          <span>৳{{ deliveryFee }}</span>
        </div>
        <div class="flex justify-between text-slate-900 font-black text-base pt-2 border-t border-slate-200">
          <span>সর্বমোট বিল:</span>
          <span class="text-lg" :class="totalPriceTextClass">৳{{ totalBill }}</span>
        </div>
      </div>

      <!-- Submit Button -->
      <button 
        type="submit" 
        :disabled="submitting"
        class="w-full py-4 text-white font-black text-base sm:text-lg rounded-2xl shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        :class="primaryButtonClass"
      >
        <Loader2 v-if="submitting" class="w-5 h-5 animate-spin" />
        <ShoppingBag v-else class="w-5 h-5" />
        <span>{{ submitting ? 'অর্ডার প্রসেস হচ্ছে...' : 'অর্ডার কনফার্ম করুন (ক্যাশ অন ডেলিভারি)' }}</span>
      </button>

      <p class="text-center text-[11px] text-slate-400">
        🔒 আপনার তথ্য সম্পূর্ণ সুরক্ষিত এবং অর্ডার কনফার্ম করতে কোনো অগ্রিম পেমেন্ট প্রয়োজন নেই।
      </p>
    </form>
  </div>
</template>

<script setup>
import { reactive, ref, computed, watch } from 'vue'
import { ShieldCheck, ShoppingBag, CheckCircle2, Loader2 } from 'lucide-vue-next'
import confetti from 'canvas-confetti'

const props = defineProps({
  store: {
    type: Object,
    required: true
  }
})

const submitting = ref(false)
const orderSubmitted = ref(false)
const phoneError = ref(false)

const availableVariants = computed(() => {
  return props.store.variants || props.store.config?.variants || []
})

const selectedVariant = ref(null)

watch(availableVariants, (vars) => {
  if (vars && vars.length > 0 && !selectedVariant.value) {
    selectedVariant.value = vars[0]
  }
}, { immediate: true })

const selectedVariantName = computed(() => selectedVariant.value?.name || '')

const unitItemPrice = computed(() => {
  if (selectedVariant.value && typeof selectedVariant.value.price === 'number') {
    return selectedVariant.value.price
  }
  return props.store.price || 0
})

const form = reactive({
  customer_name: '',
  customer_phone: '',
  customer_address: '',
  delivery_zone: 'inside_dhaka',
  quantity: 1
})

const feeInside = computed(() => {
  return Number(props.store.config?.delivery_fee_inside || props.store.delivery_fee_inside) || 70
})

const feeOutside = computed(() => {
  return Number(props.store.config?.delivery_fee_outside || props.store.delivery_fee_outside) || 130
})

const deliveryFee = computed(() => form.delivery_zone === 'outside_dhaka' ? feeOutside.value : feeInside.value)
const totalBill = computed(() => (unitItemPrice.value * form.quantity) + deliveryFee.value)

const decrementQty = () => {
  if (form.quantity > 1) form.quantity--
}

const borderAccentClass = computed(() => {
  const c = props.store.theme_color
  if (c === 'indigo') return 'border-indigo-100'
  if (c === 'rose') return 'border-rose-100'
  if (c === 'amber') return 'border-amber-100'
  return 'border-emerald-100'
})

const badgeClass = computed(() => {
  const c = props.store.theme_color
  if (c === 'indigo') return 'bg-indigo-50 text-indigo-700'
  if (c === 'rose') return 'bg-rose-50 text-rose-700'
  if (c === 'amber') return 'bg-amber-50 text-amber-700'
  return 'bg-emerald-50 text-emerald-700'
})

const borderActiveDeliveryClass = computed(() => {
  const c = props.store.theme_color
  if (c === 'indigo') return 'border-indigo-600 bg-indigo-50/60 text-indigo-900 font-bold'
  if (c === 'rose') return 'border-rose-600 bg-rose-50/60 text-rose-900 font-bold'
  if (c === 'amber') return 'border-amber-600 bg-amber-50/60 text-amber-900 font-bold'
  return 'border-emerald-600 bg-emerald-50/60 text-emerald-900 font-bold'
})

const totalPriceTextClass = computed(() => {
  const c = props.store.theme_color
  if (c === 'indigo') return 'text-indigo-600'
  if (c === 'rose') return 'text-rose-600'
  if (c === 'amber') return 'text-amber-600'
  return 'text-emerald-600'
})

const primaryButtonClass = computed(() => {
  const c = props.store.theme_color
  if (c === 'indigo') return 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/30'
  if (c === 'rose') return 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/30'
  if (c === 'amber') return 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/30'
  return 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30'
})

const submitOrder = async () => {
  phoneError.value = false
  const cleanPhone = form.customer_phone.replace(/\D/g, '')
  if (cleanPhone.length < 11) {
    phoneError.value = true
    return
  }

  submitting.value = true

  try {
    const res = await $fetch('/api/orders', {
      method: 'POST',
      body: {
        store_slug: props.store.slug,
        customer_name: form.customer_name,
        customer_phone: form.customer_phone,
        customer_address: form.customer_address,
        delivery_zone: form.delivery_zone,
        quantity: form.quantity,
        unit_price: unitItemPrice.value,
        selected_variant: selectedVariantName.value
      }
    })

    if (res && res.success) {
      orderSubmitted.value = true
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        })
      } catch (e) {}
    }
  } catch (err) {
    console.error('Order submission failed:', err)
    alert('অর্ডার সাবমিট করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।')
  } finally {
    submitting.value = false
  }
}
</script>

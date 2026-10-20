<template>
  <div v-if="pending" class="min-h-screen flex items-center justify-center bg-slate-50">
    <div class="text-center space-y-3">
      <div class="w-10 h-10 border-4 border-slate-300 border-t-emerald-600 rounded-full animate-spin mx-auto"></div>
      <p class="text-sm font-bold text-slate-600">দোকান লোড হচ্ছে...</p>
    </div>
  </div>

  <div v-else-if="!store" class="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 text-center">
    <h2 class="text-2xl font-black text-slate-800 mb-2">দোকানটি খুঁজে পাওয়া যায়নি</h2>
    <p class="text-sm text-slate-500 mb-6">লিংকটি সঠিক কিনা যাচাই করুন অথবা হোমপেজে যান।</p>
    <NuxtLink to="/" class="px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-sm">
      হোমে ফিরে যান
    </NuxtLink>
  </div>

  <div v-else class="min-h-screen bg-slate-50/60 pb-28 sm:pb-16 font-sans">
    
    <!-- Top Floating Urgency Bar -->
    <div class="bg-gradient-to-r from-red-600 via-amber-600 to-red-600 text-white text-xs sm:text-sm font-black py-2.5 px-4 text-center sticky top-0 z-30 shadow-md flex items-center justify-center gap-2">
      <Flame class="w-4 h-4 animate-bounce" />
      <span>{{ store.config?.urgency_text || '🔥 অফারটি সীমিত সময়ের জন্য! ক্যাশ অন ডেলিভারিতে অর্ডার করুন!' }}</span>
    </div>

    <!-- Store Navigation -->
    <header class="bg-white border-b border-slate-200/80 py-3.5 px-4 sm:px-8">
      <div class="max-w-5xl mx-auto flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg flex items-center justify-center text-white font-black" :class="primaryBgClass">
            <ShoppingBag class="w-4 h-4" />
          </div>
          <span class="font-black text-slate-900 tracking-tight text-base sm:text-lg">
            {{ store.product_title }}
          </span>
        </div>

        <div class="flex items-center gap-2">
          <button 
            @click="isEditingStore = true"
            class="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <Edit3 class="w-3.5 h-3.5 text-slate-500" />
            <span>এডিট স্টোর</span>
          </button>

          <button @click="scrollToForm" class="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black text-white shadow-md active:scale-95 transition-all" :class="primaryBgClass">
            <span>অর্ডার করুন</span>
            <ArrowDown class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>

    <!-- Main Container -->
    <main class="max-w-4xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10 space-y-12">
      
      <!-- HERO & PRODUCT PRESENTATION -->
      <section class="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-sm">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          
          <!-- Product Gallery (Multi-Image Support) -->
          <div class="space-y-3">
            <div class="aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/60 relative group flex items-center justify-center">
              <img 
                :src="activeHeroImage || store.image_url" 
                :alt="store.product_title" 
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              />
              <div class="absolute top-3 left-3 px-3 py-1 bg-red-600 text-white text-xs font-black rounded-lg shadow-lg">
                স্পেশাল ডিসকাউন্ট
              </div>
            </div>

            <!-- Thumbnail Carousel if multiple images exist -->
            <div v-if="productImages.length > 1" class="flex items-center gap-2 overflow-x-auto py-1">
              <button 
                v-for="(img, idx) in productImages" 
                :key="idx"
                @click="activeHeroImage = img"
                class="w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-transform"
                :class="activeHeroImage === img ? 'border-slate-900 scale-105' : 'border-slate-200 opacity-70 hover:opacity-100'"
              >
                <img :src="img" class="w-full h-full object-cover" />
              </button>
            </div>
          </div>

          <!-- Product Main Copy -->
          <div class="space-y-4">
            <h1 class="text-2xl sm:text-3xl font-black text-slate-900 leading-snug">
              {{ store.config?.headline }}
            </h1>

            <p class="text-sm sm:text-base text-slate-600 leading-relaxed">
              {{ store.config?.subheadline }}
            </p>

            <!-- Price Container -->
            <div class="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-baseline gap-3">
              <div class="text-3xl sm:text-4xl font-black" :class="primaryTextClass">
                ৳{{ store.price }}
              </div>
              <div v-if="store.regular_price" class="text-base sm:text-lg text-slate-400 line-through font-bold">
                ৳{{ store.regular_price }}
              </div>
              <div class="ml-auto text-[11px] font-bold px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full">
                ক্যাশ অন ডেলিভারি
              </div>
            </div>

            <!-- Trust Badges Checkmarks -->
            <div class="space-y-2 pt-2">
              <div 
                v-for="(badge, bIdx) in store.config?.trust_badges" 
                :key="bIdx" 
                class="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-700"
              >
                <div class="w-4 h-4 rounded-full flex items-center justify-center text-white" :class="primaryBgClass">
                  <Check class="w-3 h-3" />
                </div>
                <span>{{ badge }}</span>
              </div>
            </div>

            <!-- Hero Action CTA -->
            <div class="pt-4">
              <button 
                @click="scrollToForm" 
                class="w-full py-4 text-white font-black text-base rounded-2xl shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
                :class="primaryBgClass"
              >
                <ShoppingBag class="w-5 h-5" />
                <span>এখনই অর্ডার করুন (ক্যাশ অন ডেলিভারি)</span>
              </button>
            </div>
          </div>

        </div>
      </section>

      <!-- FEATURES & BENEFITS GRID -->
      <section v-if="store.config?.features?.length" class="space-y-6">
        <div class="text-center max-w-lg mx-auto">
          <h2 class="text-xl sm:text-2xl font-black text-slate-900">কেন এই পণ্যটি আপনার জন্য সেরা?</h2>
          <p class="text-xs sm:text-sm text-slate-500 mt-1">বিশেষ গুণাবলী যা আপনাকে দেবে সর্বোচ্চ সন্তুষ্টি</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div 
            v-for="(feat, fIdx) in store.config.features" 
            :key="fIdx"
            class="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-start gap-4 hover:border-slate-300 transition-colors"
          >
            <div class="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 mt-0.5" :class="primaryBgClass">
              <Sparkles class="w-5 h-5" />
            </div>
            <div>
              <h3 class="text-base font-bold text-slate-900 mb-1">{{ feat.title }}</h3>
              <p class="text-xs sm:text-sm text-slate-600 leading-relaxed">{{ feat.desc }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- TESTIMONIALS & SOCIAL PROOF -->
      <section v-if="store.config?.testimonials?.length" class="space-y-6">
        <div class="text-center max-w-lg mx-auto">
          <h2 class="text-xl sm:text-2xl font-black text-slate-900">সম্মানিত ক্রেতাদের মতামত</h2>
          <p class="text-xs sm:text-sm text-slate-500 mt-1">যারা ইতিমধ্যে ব্যবহার করে সন্তুষ্ট</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div 
            v-for="(testi, tIdx) in store.config.testimonials" 
            :key="tIdx"
            class="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-3"
          >
            <div class="flex items-center gap-1 text-amber-400">
              <Star v-for="i in 5" :key="i" class="w-4 h-4 fill-amber-400 text-amber-400" />
            </div>
            <p class="text-xs sm:text-sm text-slate-700 italic leading-relaxed">
              "{{ testi.comment }}"
            </p>
            <div class="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <strong class="text-slate-900 font-bold">{{ testi.name }}</strong>
              <span class="text-slate-400">{{ testi.location }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- FAQS ACCORDION -->
      <section v-if="store.config?.faqs?.length" class="space-y-4">
        <div class="text-center max-w-lg mx-auto mb-6">
          <h2 class="text-xl sm:text-2xl font-black text-slate-900">সাধারণ কিছু প্রশ্নের উত্তর</h2>
          <p class="text-xs sm:text-sm text-slate-500 mt-1">অর্ডার করার পূর্বে জেনে নিন</p>
        </div>

        <div class="space-y-3">
          <div 
            v-for="(faq, qIdx) in store.config.faqs" 
            :key="qIdx"
            class="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-sm"
          >
            <h3 class="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <HelpCircle class="w-4 h-4" :class="primaryTextClass" />
              <span>{{ faq.q }}</span>
            </h3>
            <p class="text-xs sm:text-sm text-slate-600 mt-2 pl-6 leading-relaxed">
              {{ faq.a }}
            </p>
          </div>
        </div>
      </section>

      <!-- THE ROCK-SOLID COD ORDER FORM -->
      <StoreCodForm :store="store" />

    </main>

    <!-- IN-PAGE AI SALES BOT -->
    <StoreAiSalesBot :store="store" />

    <!-- STICKY MOBILE BOTTOM BAR -->
    <div class="sm:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 z-40 flex items-center justify-between shadow-2xl">
      <div>
        <div class="text-[11px] text-slate-400 font-semibold">অফার মূল্য:</div>
        <div class="text-xl font-black" :class="primaryTextClass">৳{{ store.price }}</div>
      </div>
      <button 
        @click="scrollToForm" 
        class="px-6 py-3 text-white font-black text-sm rounded-xl shadow-lg active:scale-95 transition-all flex items-center gap-2"
        :class="primaryBgClass"
      >
        <ShoppingBag class="w-4 h-4" />
        <span>এখনই অর্ডার করুন</span>
      </button>
    </div>

    <!-- FULL LIVE STORE EDITOR MODAL -->
    <div v-if="isEditingStore" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-200">
        <div class="flex items-center justify-between border-b pb-3">
          <div>
            <h3 class="text-lg font-black text-slate-900">দোকানের তথ্য এডিট করুন</h3>
            <p class="text-xs text-slate-500">প্রোডাক্টের নাম, মূল্য, কপি এবং ডেলিভারি চার্জ সরাসরি পরিবর্তন করুন</p>
          </div>
          <button @click="isEditingStore = false" class="p-1 rounded-lg text-slate-400 hover:text-slate-600">
            <X class="w-5 h-5" />
          </button>
        </div>

        <div class="space-y-4 text-xs sm:text-sm">
          <div>
            <label class="block font-bold text-slate-700 mb-1">প্রোডাক্ট টাইটেল:</label>
            <input v-model="editForm.product_title" type="text" class="w-full px-3 py-2 bg-slate-50 border rounded-xl" />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-slate-700 mb-1">অফার মূল্য (৳):</label>
              <input v-model.number="editForm.price" type="number" class="w-full px-3 py-2 bg-slate-50 border rounded-xl font-bold text-emerald-600" />
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">পূর্বের মূল্য (৳):</label>
              <input v-model.number="editForm.regular_price" type="number" class="w-full px-3 py-2 bg-slate-50 border rounded-xl line-through text-slate-400" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-slate-700 mb-1">ডেলিভারি ফি (ঢাকার ভিতরে):</label>
              <input v-model.number="editForm.delivery_fee_inside" type="number" class="w-full px-3 py-2 bg-slate-50 border rounded-xl font-bold" />
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">ডেলিভারি ফি (ঢাকার বাইরে):</label>
              <input v-model.number="editForm.delivery_fee_outside" type="number" class="w-full px-3 py-2 bg-slate-50 border rounded-xl font-bold" />
            </div>
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">হেডলাইন (বাংলা কপি):</label>
            <input v-model="editForm.headline" type="text" class="w-full px-3 py-2 bg-slate-50 border rounded-xl font-bold" />
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">সাব-হেডলাইন:</label>
            <textarea v-model="editForm.subheadline" rows="2" class="w-full px-3 py-2 bg-slate-50 border rounded-xl"></textarea>
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">থিম কালার:</label>
            <select v-model="editForm.theme_color" class="w-full px-3 py-2 bg-slate-50 border rounded-xl font-bold">
              <option value="emerald">Emerald (সবুজ)</option>
              <option value="indigo">Indigo (নীল)</option>
              <option value="rose">Rose (গোলাপি)</option>
              <option value="amber">Amber (কমলা)</option>
            </select>
          </div>
        </div>

        <div class="flex items-center justify-end gap-3 pt-4 border-t">
          <button @click="isEditingStore = false" class="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl">বাতিল</button>
          <button @click="saveStoreEdits" :disabled="isSaving" class="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md">
            {{ isSaving ? 'সেভ হচ্ছে...' : 'পরিবর্তন সংরক্ষণ করুন' }}
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { Flame, ShoppingBag, ArrowDown, Check, Sparkles, Star, HelpCircle, Edit3, X } from 'lucide-vue-next'

const route = useRoute()
const slug = route.params.slug

const { data, pending, refresh } = await useFetch(`/api/stores?slug=${slug}`)

const store = computed(() => data.value?.store)

const isEditingStore = ref(false)
const isSaving = ref(false)
const activeHeroImage = ref('')

const editForm = reactive({
  product_title: '',
  price: 0,
  regular_price: 0,
  delivery_fee_inside: 70,
  delivery_fee_outside: 130,
  headline: '',
  subheadline: '',
  theme_color: 'emerald'
})

watch(store, (st) => {
  if (st) {
    editForm.product_title = st.product_title
    editForm.price = st.price
    editForm.regular_price = st.regular_price || 0
    editForm.delivery_fee_inside = st.config?.delivery_fee_inside || st.delivery_fee_inside || 70
    editForm.delivery_fee_outside = st.config?.delivery_fee_outside || st.delivery_fee_outside || 130
    editForm.headline = st.config?.headline || ''
    editForm.subheadline = st.config?.subheadline || ''
    editForm.theme_color = st.theme_color || 'emerald'
    activeHeroImage.value = (st.config?.images && st.config.images[0]) || st.image_url
  }
}, { immediate: true })

const productImages = computed(() => {
  if (store.value?.config?.images && Array.isArray(store.value.config.images) && store.value.config.images.length > 0) {
    return store.value.config.images
  }
  return [store.value?.image_url].filter(Boolean)
})

const primaryBgClass = computed(() => {
  const c = store.value?.theme_color
  if (c === 'indigo') return 'bg-indigo-600 hover:bg-indigo-700'
  if (c === 'rose') return 'bg-rose-600 hover:bg-rose-700'
  if (c === 'amber') return 'bg-amber-600 hover:bg-amber-700'
  return 'bg-emerald-600 hover:bg-emerald-700'
})

const primaryTextClass = computed(() => {
  const c = store.value?.theme_color
  if (c === 'indigo') return 'text-indigo-600'
  if (c === 'rose') return 'text-rose-600'
  if (c === 'amber') return 'text-amber-600'
  return 'text-emerald-600'
})

const scrollToForm = () => {
  const el = document.getElementById('order-form-section')
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' })
  }
}

const saveStoreEdits = async () => {
  isSaving.value = true
  try {
    const updatedConfig = {
      ...store.value.config,
      headline: editForm.headline,
      subheadline: editForm.subheadline,
      delivery_fee_inside: editForm.delivery_fee_inside,
      delivery_fee_outside: editForm.delivery_fee_outside
    }

    await $fetch('/api/stores', {
      method: 'PUT',
      body: {
        slug: store.value.slug,
        product_title: editForm.product_title,
        price: editForm.price,
        regular_price: editForm.regular_price,
        theme_color: editForm.theme_color,
        image_url: store.value.image_url,
        config: updatedConfig
      }
    })

    await refresh()
    isEditingStore.value = false
    alert('দোকানের তথ্য সফলভাবে আপডেট হয়েছে!')
  } catch (err) {
    alert('আপডেট করতে সমস্যা হয়েছে।')
  } finally {
    isSaving.value = false
  }
}

useHead({
  title: computed(() => store.value ? store.value.product_title : 'Dokan Store'),
  meta: [
    { name: 'description', content: computed(() => store.value?.config?.subheadline || 'অর্ডার করুন ক্যাশ অন ডেলিভারিতে') }
  ]
})
</script>

<template>
  <div v-if="pending && !store" class="min-h-screen flex items-center justify-center bg-slate-50">
    <div class="text-center space-y-3">
      <div class="w-10 h-10 border-4 border-slate-300 border-t-emerald-600 rounded-full animate-spin mx-auto"></div>
      <p class="text-xs sm:text-sm font-bold text-slate-600">দোকান প্রস্তুত হচ্ছে...</p>
    </div>
  </div>

  <div v-else-if="!store" class="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 text-center">
    <div class="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
      <ShoppingBag class="w-8 h-8" />
    </div>
    <h2 class="text-xl sm:text-2xl font-black text-slate-900 mb-1">দোকানটি খুঁজে পাওয়া যায়নি</h2>
    <p class="text-xs sm:text-sm text-slate-500 mb-6">লিংকটি সঠিক কিনা যাচাই করুন অথবা হোমপেজে যান।</p>
    <NuxtLink to="/" class="px-5 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-xs sm:text-sm shadow-md">
      হোমে ফিরে যান
    </NuxtLink>
  </div>

  <div v-else class="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 text-slate-900 pb-28 sm:pb-20 font-sans selection:bg-emerald-500 selection:text-white">
    
    <!-- TOP NOTIFICATION BANNER (Urgency & Real Stock Counter) -->
    <div 
      v-if="showUrgencyBar"
      class="text-white text-xs font-black py-2.5 px-3 text-center sticky top-0 z-40 shadow-sm flex items-center justify-center gap-2 transition-colors"
      :class="currentStock <= 0 ? 'bg-red-600' : 'bg-gradient-to-r from-red-600 via-amber-600 to-red-600'"
    >
      <Flame class="w-4 h-4 animate-bounce shrink-0" />
      <span v-if="currentStock > 0" class="tracking-wide">
        অফারটি সীমিত সময়ের জন্য! আর মাত্র <strong class="underline decoration-white/60">{{ currentStock }} টি</strong> স্টক বাকি আছে!
      </span>
      <span v-else>
        ⚠️ দুঃখিত! আজকের মতো এই প্রডাক্টের সব স্টক শেষ হয়ে গেছে।
      </span>
    </div>

    <!-- STORE HEADER NAVIGATION BAR -->
    <header class="bg-white/95 backdrop-blur-md border-b border-slate-200/80 py-3 px-3.5 sm:px-8 sticky z-30 shadow-xs" :class="showUrgencyBar ? 'top-9' : 'top-0'">
      <div class="max-w-5xl mx-auto flex items-center justify-between">
        
        <!-- Store Identity -->
        <div class="flex items-center gap-2.5 min-w-0">
          <div class="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-white font-black shadow-md shrink-0" :class="primaryBgClass">
            <ShoppingBag class="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div class="min-w-0">
            <span class="font-black text-slate-900 tracking-tight text-sm sm:text-base block truncate leading-tight">
              {{ store.product_title }}
            </span>
            <div v-if="showVerifiedBadge" class="flex items-center gap-1 text-[10px] font-bold text-emerald-600">
              <CheckCircle2 class="w-3 h-3 text-emerald-600 shrink-0" />
              <span>১০০% ভেরিফাইড বিক্রেতা</span>
            </div>
          </div>
        </div>

        <!-- Action Items (AI edit visible only to owner) -->
        <div class="flex items-center gap-2 shrink-0">
          <button 
            v-if="isStoreOwner"
            @click="isEditingStore = true"
            class="px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-black bg-slate-900 text-white hover:bg-slate-800 flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
          >
            <Sparkles class="w-3.5 h-3.5 text-emerald-400" />
            <span>AI এডিট</span>
          </button>

          <button 
            v-if="currentStock > 0"
            @click="scrollToForm" 
            class="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-black text-white shadow-md active:scale-95 transition-all flex items-center gap-1" 
            :class="primaryBgClass"
          >
            <span>অর্ডার করুন</span>
            <ArrowDown class="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </header>

    <!-- MAIN PRODUCT LANDING CONTAINER -->
    <main class="max-w-4xl mx-auto px-3 sm:px-6 pt-4 sm:pt-8 space-y-8 sm:space-y-12">
      
      <!-- HERO CARD: PRODUCT PRESENTATION & TRUST BADGES -->
      <section class="bg-white rounded-3xl p-4 sm:p-8 border border-slate-200/90 shadow-xl shadow-slate-200/40 relative overflow-hidden">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10 items-center">
          
          <!-- Image Gallery with Thumbnails & Zoom Hover -->
          <div class="space-y-3">
            <div class="aspect-square rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-100 border border-slate-200/80 relative group flex items-center justify-center shadow-inner">
              <img 
                :src="activeHeroImage || store.config?.hero_image || store.image_url" 
                :alt="store.product_title" 
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              />
              <div class="absolute top-2.5 left-2.5 px-3 py-1 bg-gradient-to-r from-red-600 to-amber-600 text-white text-[11px] sm:text-xs font-black rounded-xl shadow-md">
                স্পেশাল অফার
              </div>
            </div>

            <!-- Thumbnail Carousel if multi-image -->
            <div v-if="productImages.length > 1" class="flex items-center gap-2 overflow-x-auto py-1 no-scrollbar">
              <button 
                v-for="(img, idx) in productImages" 
                :key="idx"
                @click="activeHeroImage = img"
                class="w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl overflow-hidden border-2 shrink-0 transition-transform"
                :class="activeHeroImage === img ? 'border-slate-900 scale-105 shadow-md' : 'border-slate-200 opacity-70 hover:opacity-100'"
              >
                <img :src="img" class="w-full h-full object-cover" />
              </button>
            </div>
          </div>

          <!-- Product Sales Copy -->
          <div class="space-y-3.5 sm:space-y-5">
            <div class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] sm:text-xs font-bold uppercase tracking-wider">
              <Sparkles class="w-3 h-3 text-emerald-600" />
              <span>প্রিমিয়াম কোয়ালিটি গ্যারান্টিড</span>
            </div>

            <h1 class="text-xl sm:text-3xl lg:text-4xl font-black text-slate-900 leading-[1.25] tracking-tight">
              {{ store.config?.headline }}
            </h1>

            <p class="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              {{ store.config?.subheadline }}
            </p>

            <!-- Pricing & Live Stock Pill -->
            <div class="p-3.5 sm:p-4 bg-slate-50/90 rounded-2xl border border-slate-200/80 space-y-2">
              <div class="flex items-baseline gap-2.5 sm:gap-3">
                <div class="text-2xl sm:text-4xl font-black" :class="primaryTextClass">
                  ৳{{ store.price }}
                </div>
                <div v-if="store.regular_price" class="text-sm sm:text-lg text-slate-400 line-through font-bold">
                  ৳{{ store.regular_price }}
                </div>
                <div class="ml-auto text-[10px] sm:text-xs font-bold px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full flex items-center gap-1">
                  <ShieldCheck class="w-3.5 h-3.5 text-emerald-700" />
                  <span>ক্যাশ অন ডেলিভারি</span>
                </div>
              </div>

              <!-- Live Stock Counter -->
              <div class="flex items-center justify-between text-[11px] sm:text-xs pt-2 border-t border-slate-200/60 font-semibold">
                <span class="text-slate-500">বর্তমান স্টক পরিস্থিতি:</span>
                <span 
                  class="px-2.5 py-0.5 rounded-full font-bold text-[10px] sm:text-[11px]"
                  :class="currentStock > 5 ? 'bg-emerald-100 text-emerald-800' : currentStock > 0 ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'"
                >
                  {{ currentStock > 0 ? `${currentStock} টি এভেইলেবল আছে` : 'স্টক শেষ (Out of Stock)' }}
                </span>
              </div>
            </div>

            <!-- Trust Badges List -->
            <div class="space-y-2 pt-1">
              <div 
                v-for="(badge, bIdx) in store.config?.trust_badges" 
                :key="bIdx" 
                class="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-700"
              >
                <div class="w-4 h-4 rounded-full flex items-center justify-center text-white shrink-0" :class="primaryBgClass">
                  <Check class="w-3 h-3" />
                </div>
                <span>{{ badge }}</span>
              </div>
            </div>

            <!-- Big CTA Button -->
            <div class="pt-2">
              <button 
                v-if="currentStock > 0"
                @click="scrollToForm" 
                class="w-full py-3.5 sm:py-4 text-white font-black text-sm sm:text-base rounded-2xl shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
                :class="primaryBgClass"
              >
                <ShoppingBag class="w-5 h-5" />
                <span>এখনই অর্ডার করুন (ক্যাশ অন ডেলিভারি)</span>
              </button>
              <div v-else class="w-full py-3.5 sm:py-4 bg-slate-200 text-slate-500 font-black text-center rounded-2xl cursor-not-allowed text-sm">
                পণ্যটির স্টক সাময়িকভাবে শেষ
              </div>
            </div>
          </div>

        </div>
      </section>

      <!-- PROMOTIONAL VIDEO REEL SECTION (If provided) -->
      <section v-if="videoEmbedUrl" class="bg-white rounded-3xl p-5 sm:p-8 border border-slate-200/90 shadow-sm space-y-4">
        <div class="text-center max-w-md mx-auto">
          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-bold uppercase tracking-wider mb-1">
            <Video class="w-3.5 h-3.5" />
            <span>প্রোডাক্ট লাইভ ভিডিও ডেমো</span>
          </div>
          <h2 class="text-lg sm:text-2xl font-black text-slate-900">ভিডিওতে সরাসরি প্রোডাক্টটি দেখুন</h2>
        </div>

        <div class="max-w-xs sm:max-w-sm mx-auto aspect-[9/16] rounded-2xl overflow-hidden shadow-xl border border-slate-200 bg-black">
          <iframe 
            :src="videoEmbedUrl" 
            class="w-full h-full"
            frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen
          ></iframe>
        </div>
      </section>

      <!-- FEATURES & BENEFITS GRID -->
      <section v-if="store.config?.features?.length" class="space-y-4 sm:space-y-6">
        <div class="text-center max-w-lg mx-auto">
          <h2 class="text-lg sm:text-2xl font-black text-slate-900">কেন এই পণ্যটি আপনার জন্য সেরা?</h2>
          <p class="text-xs sm:text-sm text-slate-500 mt-0.5">বিশেষ গুণাবলী যা আপনাকে দেবে সর্বোচ্চ সন্তুষ্টি</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
          <div v-if="store.config?.secondary_image && productImages.length > 1" class="rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm md:col-span-1 hidden md:block">
            <img :src="store.config.secondary_image" class="w-full h-full object-cover" />
          </div>

          <div class="space-y-3" :class="store.config?.secondary_image && productImages.length > 1 ? 'md:col-span-2' : 'md:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-3 space-y-0'">
            <div 
              v-for="(feat, fIdx) in store.config.features" 
              :key="fIdx"
              class="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-start gap-3.5 hover:border-slate-300 transition-colors"
            >
              <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-white shrink-0 mt-0.5 shadow-sm" :class="primaryBgClass">
                <Sparkles class="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <h3 class="text-sm sm:text-base font-bold text-slate-900 mb-0.5 sm:mb-1">{{ feat.title }}</h3>
                <p class="text-xs sm:text-sm text-slate-600 leading-relaxed">{{ feat.desc }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- TESTIMONIALS & SOCIAL PROOF -->
      <section v-if="showTestimonials && store.config?.testimonials?.length" class="space-y-4 sm:space-y-6">
        <div class="text-center max-w-lg mx-auto">
          <h2 class="text-lg sm:text-2xl font-black text-slate-900">সম্মানিত ক্রেতাদের মতামত</h2>
          <p class="text-xs sm:text-sm text-slate-500 mt-0.5">যারা ইতিমধ্যে ব্যবহার করে সন্তুষ্ট</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div 
            v-for="(testi, tIdx) in store.config.testimonials" 
            :key="tIdx"
            class="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-2.5"
          >
            <div class="flex items-center gap-1 text-amber-400">
              <Star v-for="i in 5" :key="i" class="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-amber-400 text-amber-400" />
            </div>
            <p class="text-xs sm:text-sm text-slate-700 italic leading-relaxed">
              "{{ testi.comment }}"
            </p>
            <div class="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <strong class="text-slate-900 font-bold">{{ testi.name }}</strong>
              <span class="text-slate-400 text-[11px]">{{ testi.location }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- FAQS ACCORDION -->
      <section v-if="showFaqs && store.config?.faqs?.length" class="space-y-3 sm:space-y-4">
        <div class="text-center max-w-lg mx-auto mb-4">
          <h2 class="text-lg sm:text-2xl font-black text-slate-900">সাধারণ কিছু প্রশ্নের উত্তর</h2>
          <p class="text-xs sm:text-sm text-slate-500 mt-0.5">অর্ডার করার পূর্বে জেনে নিন</p>
        </div>

        <div class="space-y-2.5">
          <div 
            v-for="(faq, qIdx) in store.config.faqs" 
            :key="qIdx"
            class="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-sm"
          >
            <h3 class="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
              <HelpCircle class="w-4 h-4 shrink-0" :class="primaryTextClass" />
              <span>{{ faq.q }}</span>
            </h3>
            <p class="text-xs sm:text-sm text-slate-600 mt-1.5 pl-6 leading-relaxed">
              {{ faq.a }}
            </p>
          </div>
        </div>
      </section>

      <!-- THE ROCK-SOLID COD ORDER FORM -->
      <div v-if="currentStock > 0">
        <StoreCodForm :store="store" />
      </div>
      <div v-else class="p-6 sm:p-8 bg-white border border-red-200 rounded-3xl text-center space-y-2">
        <h3 class="text-base sm:text-lg font-black text-red-600">বর্তমানে এই পণ্যটির স্টক খালি</h3>
        <p class="text-xs text-slate-500">দোকানদার নতুন স্টক যোগ করলে পুনরায় অর্ডার করা যাবে।</p>
      </div>

    </main>

    <!-- IN-PAGE CUSTOMER AI SALES BOT -->
    <StoreAiSalesBot :store="store" />

    <!-- STICKY MOBILE BOTTOM BAR -->
    <div v-if="currentStock > 0" class="sm:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 p-2.5 z-40 flex items-center justify-between shadow-2xl">
      <div class="pl-1">
        <div class="text-[10px] text-slate-400 font-bold leading-none">অফার মূল্য:</div>
        <div class="text-lg font-black leading-tight" :class="primaryTextClass">৳{{ store.price }}</div>
      </div>
      <button 
        @click="scrollToForm" 
        class="px-5 py-2.5 text-white font-black text-xs rounded-xl shadow-lg active:scale-95 transition-all flex items-center gap-1.5"
        :class="primaryBgClass"
      >
        <ShoppingBag class="w-3.5 h-3.5" />
        <span>এখনই অর্ডার করুন</span>
      </button>
    </div>

    <!-- CONVERSATIONAL AI STORE EDITOR SIDEBAR / DRAWER -->
    <!-- Backdrop overlay -->
    <Transition name="fade">
      <div 
        v-if="isEditingStore" 
        @click="isEditingStore = false" 
        class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 transition-opacity"
      ></div>
    </Transition>

    <!-- Side Drawer Panel (slides in from right) -->
    <Transition name="slide-right">
      <aside 
        v-if="isEditingStore" 
        class="fixed top-0 right-0 bottom-0 w-full sm:w-[420px] md:w-[460px] bg-white z-50 shadow-2xl flex flex-col border-l border-slate-200"
      >
        <!-- Editor Drawer Header -->
        <div class="p-3.5 sm:p-4 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white shrink-0">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold shadow-xs">
              <Sparkles class="w-4 h-4" />
            </div>
            <div>
              <h3 class="text-xs sm:text-sm font-black">AI লাইভ স্টোর এডিটর</h3>
              <p class="text-[9px] sm:text-[10px] text-slate-300">যেকোনো সেকশন সরাতে, লুকোতে বা পরিবর্তন করতে বলুন</p>
            </div>
          </div>
          <button @click="isEditingStore = false" class="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer">
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Chat / Instruction History Area -->
        <div ref="editorScroll" class="flex-1 p-3 sm:p-4 overflow-y-auto space-y-3 bg-slate-50/50 text-xs">
          <div class="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl leading-relaxed shadow-xs">
            👋 <strong>আমি DokanAI এডিটর!</strong><br />
            দোকানের যেকোনো সেকশন বাদ দিতে বা পরিবর্তন করতে বলুন। যেমন:
            <ul class="list-disc pl-4 mt-1.5 space-y-0.5 text-emerald-800 text-[11px]">
              <li>"উপরের লাল অফার বারটা বাদ দাও"</li>
              <li>"১০০% ভেরিফাইড বিক্রেতা লেখাটি লুকিয়ে ফেলো"</li>
              <li>"রিভিউ বা টেস্টিমোনিয়াল সেকশন মুছে দাও"</li>
              <li>"দাম ১০০০ থেকে কমিয়ে ৯৫০ টাকা করো"</li>
            </ul>
          </div>

          <div v-for="(log, lIdx) in editLogs" :key="lIdx" class="space-y-1.5">
            <div class="bg-slate-900 text-white p-2.5 sm:p-3 rounded-2xl rounded-br-none ml-auto max-w-[85%] text-xs shadow-xs">
              {{ log.prompt }}
            </div>
            <div class="bg-white border border-slate-200 p-3 rounded-2xl rounded-bl-none mr-auto max-w-[90%] text-xs text-slate-800 space-y-2 shadow-xs">
              <div class="flex items-start gap-2">
                <CheckCircle2 class="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span class="font-medium leading-relaxed">{{ log.response }}</span>
              </div>
              <!-- Proactive suggestions / Follow-up chips -->
              <div v-if="log.suggestions && log.suggestions.length" class="pt-1.5 border-t border-slate-100 flex flex-wrap gap-1.5">
                <span class="text-[10px] text-slate-400 font-bold block w-full">পরামর্শ অনুযায়ী পরবর্তী একশন:</span>
                <button
                  v-for="(sug, sIdx) in log.suggestions"
                  :key="sIdx"
                  @click="applySuggestion(sug)"
                  type="button"
                  class="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/80 rounded-lg text-[10px] font-semibold transition-colors text-left cursor-pointer"
                >
                  ⚡ {{ sug }}
                </button>
              </div>
            </div>
          </div>

          <div v-if="isAiEditing" class="flex items-center gap-2 bg-white border border-slate-200 p-2.5 rounded-2xl w-fit shadow-xs">
            <Loader2 class="w-4 h-4 animate-spin text-emerald-600" />
            <span class="text-xs font-bold text-slate-700">AI আপডেট করছে...</span>
          </div>
        </div>

        <!-- Editor Prompt Input Bar -->
        <div class="p-3 border-t border-slate-100 bg-white shrink-0">
          <form @submit.prevent="submitAiEdit" class="flex items-center gap-2">
            <input 
              v-model="aiInstruction" 
              type="text" 
              placeholder="কী পরিবর্তন করতে চান বলুন..." 
              class="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-emerald-500 font-medium"
              :disabled="isAiEditing"
            />
            <button 
              type="submit" 
              :disabled="!aiInstruction.trim() || isAiEditing"
              class="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95 shrink-0 cursor-pointer"
            >
              <span>আপডেট</span>
              <Send class="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

      </aside>
    </Transition>

  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted } from 'vue'
import { Flame, ShoppingBag, ArrowDown, Check, Sparkles, Star, HelpCircle, X, Video, ShieldCheck, CheckCircle2, Loader2, Send } from 'lucide-vue-next'
import { useAuth } from '~/composables/useAuth'

const { currentUser, initAuth } = useAuth()
const route = useRoute()
const slug = route.params.slug

onMounted(() => {
  initAuth()
})

const { data, pending, refresh } = await useFetch(`/api/stores?slug=${slug}`)

const store = computed(() => data.value?.store)

// Owner Check: Only the creator or the demo judge can see the "AI Edit" button
const isStoreOwner = computed(() => {
  if (!currentUser.value) return false
  if (currentUser.value.isGuest) return true
  const storeUserId = store.value?.user_id || store.value?.config?.user_id
  return storeUserId === currentUser.value.id || currentUser.value.id === 'demo_judge_account_id'
})

const showUrgencyBar = computed(() => {
  return store.value?.config?.show_urgency_bar !== false
})

const showVerifiedBadge = computed(() => {
  return store.value?.config?.show_verified_badge !== false
})

const showTestimonials = computed(() => {
  return store.value?.config?.show_testimonials !== false
})

const showFaqs = computed(() => {
  return store.value?.config?.show_faqs !== false
})

const currentStock = computed(() => {
  if (typeof store.value?.stock === 'number') return store.value.stock
  if (typeof store.value?.config?.stock === 'number') return store.value.config.stock
  return 15
})

const isEditingStore = ref(false)
const isAiEditing = ref(false)
const aiInstruction = ref('')
const editLogs = ref([])
const activeHeroImage = ref('')
const editorScroll = ref(null)

const productImages = computed(() => {
  if (store.value?.config?.images && Array.isArray(store.value.config.images) && store.value.config.images.length > 0) {
    return store.value.config.images
  }
  return [store.value?.image_url].filter(Boolean)
})

const videoEmbedUrl = computed(() => {
  const url = store.value?.config?.video_reel_url || store.value?.video_reel_url
  if (!url || typeof url !== 'string' || !url.trim()) return null
  const cleanUrl = url.trim()

  // Match YouTube Shorts, watch URL, or youtu.be
  const ytMatch = cleanUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/))([\w-]{11})/)
  if (ytMatch && ytMatch[1]) {
    return `https://www.youtube.com/embed/${ytMatch[1]}`
  }

  // Match Facebook Reel / Video
  if (cleanUrl.includes('facebook.com') || cleanUrl.includes('fb.watch')) {
    return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(cleanUrl)}&show_text=0`
  }

  // Direct video URL or embeddable URL
  return cleanUrl
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

const submitAiEdit = async () => {
  const instruction = aiInstruction.value.trim()
  if (!instruction) return

  aiInstruction.value = ''
  isAiEditing.value = true

  try {
    const res = await $fetch('/api/ai/edit-store', {
      method: 'POST',
      body: {
        slug: store.value.slug,
        instruction
      }
    })

    if (res && res.success) {
      if (res.store && data.value) {
        data.value.store = { ...data.value.store, ...res.store }
      }
      editLogs.value.push({
        prompt: instruction,
        response: res.reply,
        suggestions: res.suggestions || []
      })

      // If store properties actually changed (not just consultative chat/clarification),
      // perform a clean background refresh to re-sync any server dependencies
      if (res.hasChanged) {
        refresh()
      }

      await nextTick()
      if (editorScroll.value) {
        editorScroll.value.scrollTop = editorScroll.value.scrollHeight
      }
    }
  } catch (err) {
    alert('AI এডিট করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।')
  } finally {
    isAiEditing.value = false
  }
}

const applySuggestion = (sug) => {
  aiInstruction.value = sug
  submitAiEdit()
}

useHead({
  title: computed(() => store.value ? store.value.product_title : 'Dokan Store'),
  meta: [
    { name: 'description', content: computed(() => store.value?.config?.subheadline || 'অর্ডার করুন ক্যাশ অন ডেলিভারিতে') }
  ]
})
</script>

<style scoped>
.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-right-enter-from,
.slide-right-leave-to {
  transform: translateX(100%);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

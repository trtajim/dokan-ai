<template>
  <div v-if="pending && !store" class="min-h-screen flex items-center justify-center bg-[#fbf9f3]">
    <div class="text-center space-y-3">
      <div class="w-10 h-10 border-4 border-[#e6e0cf] border-t-amber-600 rounded-full animate-spin mx-auto"></div>
      <p class="text-xs sm:text-sm font-bold text-slate-600">দোকান প্রস্তুত হচ্ছে...</p>
    </div>
  </div>

  <div v-else-if="!store" class="min-h-screen flex flex-col items-center justify-center bg-[#fbf9f3] p-4 text-center font-sans-bn">
    <div class="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-3 text-amber-800">
      <ShoppingBag class="w-8 h-8" />
    </div>
    <h2 class="text-xl sm:text-2xl font-black text-slate-900 mb-1 font-serif-bn">দোকানটি খুঁজে পাওয়া যায়নি</h2>
    <p class="text-xs sm:text-sm text-slate-500 mb-6">লিংকটি সঠিক কিনা যাচাই করুন অথবা হোমপেজে যান।</p>
    <NuxtLink to="/" class="px-5 py-2.5 bg-[#12372a] text-[#fff6e0] rounded-xl font-bold text-xs sm:text-sm shadow-md">
      হোমে ফিরে যান
    </NuxtLink>
  </div>

  <div v-else class="min-h-screen bg-[#fbf9f3] text-[#16251d] pb-24 sm:pb-12 font-sans-bn selection:bg-amber-500 selection:text-white">
    
    <!-- TOP STRIP (Urgency / Stock Notice) -->
    <div 
      v-if="showUrgencyBar"
      class="bg-[#e8a020] text-[#16251d] text-xs sm:text-sm font-semibold py-2 px-3 text-center sticky top-0 z-40 shadow-xs flex items-center justify-center gap-1.5 transition-all"
    >
      <span v-if="currentStock > 0" class="tracking-normal flex items-center gap-1.5 flex-wrap justify-center">
        <span>অফারটি সীমিত সময়ের জন্য! আর মাত্র</span>
        <span class="bg-[#12372a] text-[#fff6e0] rounded-full px-2.5 py-0.5 text-xs font-bold inline-block">{{ currentStock }} টি</span>
        <span>স্টক বাকি আছে</span>
      </span>
      <span v-else class="font-bold text-red-950">
        ⚠️ আজকের মতো এই পণ্যের স্টক শেষ হয়ে গেছে
      </span>
    </div>

    <!-- STORE HEADER NAVIGATION BAR -->
    <header class="bg-[#12372a] text-[#fff6e0] py-3.5 px-4 sm:px-8 sticky z-30 shadow-md" :class="showUrgencyBar ? 'top-[36px]' : 'top-0'">
      <div class="max-w-5xl mx-auto flex items-center justify-between">
        
        <!-- Store Brand / Identity -->
        <div class="flex items-center gap-2.5 min-w-0">
          <div class="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-amber-300 bg-emerald-950/60 border border-emerald-800/40 shrink-0">
            <ShoppingBag class="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div class="min-w-0">
            <span class="font-serif-bn font-extrabold text-[#fff6e0] tracking-tight text-base sm:text-xl block truncate leading-tight">
              {{ store.product_title }}
            </span>
            <div v-if="showVerifiedBadge" class="text-[11px] font-medium text-emerald-200/90 truncate">
              {{ store.config?.seller_tagline || '১০০% খাঁটি ও গুণগত মান সম্পন্ন' }}
            </div>
          </div>
        </div>

        <!-- Action Items (Merchant Controls / Customer Quick Action) -->
        <div class="flex items-center gap-2 shrink-0">
          <template v-if="isStoreOwner">
            <NuxtLink 
              to="/dashboard"
              class="w-9 h-9 rounded-xl bg-emerald-900/60 hover:bg-emerald-900 text-emerald-200 flex items-center justify-center transition-all border border-emerald-700/50"
              title="মার্চেন্ট ড্যাশবোর্ড"
            >
              <LayoutDashboard class="w-4 h-4 text-emerald-400" />
            </NuxtLink>

            <button 
              @click="isEditingStore = true"
              class="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#e8a020] hover:bg-[#c97a0c] text-[#16251d] flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer font-sans-bn"
            >
              <Sparkles class="w-3.5 h-3.5" />
              <span>AI এডিট</span>
            </button>
          </template>

          <!-- Customer Order Button: hidden when isStoreOwner is true -->
          <button 
            v-else-if="currentStock > 0"
            @click="scrollToForm" 
            class="px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold border border-amber-200/40 text-[#fff6e0] hover:bg-white/10 active:scale-95 transition-all flex items-center gap-1 cursor-pointer" 
          >
            <span>অর্ডার করুন</span>
            <ArrowDown class="w-3.5 h-3.5 text-amber-300" />
          </button>
        </div>

      </div>
    </header>

    <!-- HERO SECTION -->
    <div class="bg-[#12372a] text-[#fff6e0] pt-6 sm:pt-10 pb-16 sm:pb-24 relative">
      <div class="max-w-5xl mx-auto px-4 sm:px-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          
          <!-- Image Gallery with Thumbnails -->
          <div v-if="productImages.length > 0" class="bg-[#fff6e0] p-3 sm:p-4 rounded-3xl shadow-2xl border border-amber-200/20">
            <div class="aspect-square rounded-2xl overflow-hidden bg-white relative flex items-center justify-center">
              <img 
                :src="activeHeroImage || store.config?.hero_image || store.image_url || productImages[0]" 
                :alt="store.product_title" 
                class="w-full h-full object-cover transition-transform duration-500 hover:scale-105" 
              />
            </div>

            <!-- Thumbnail Carousel if multi-image -->
            <div v-if="productImages.length > 1" class="flex items-center gap-2.5 mt-3 overflow-x-auto no-scrollbar py-1">
              <button 
                v-for="(img, idx) in productImages" 
                :key="idx"
                @click="activeHeroImage = img"
                class="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer bg-white"
                :class="activeHeroImage === img ? 'border-amber-500 scale-105 shadow-md opacity-100' : 'border-transparent opacity-70 hover:opacity-100'"
              >
                <img :src="img" class="w-full h-full object-cover" />
              </button>
            </div>
          </div>

          <!-- Product Sales Copy & Quick Buy Card -->
          <div class="space-y-4">
            <div class="inline-block bg-amber-500/20 text-amber-300 border border-amber-400/40 rounded-full px-3.5 py-1 text-xs sm:text-sm font-medium">
              {{ store.config?.badge_text || store.product_title }}
            </div>

            <h1 class="font-serif-bn font-extrabold text-2xl sm:text-4xl lg:text-[42px] leading-[1.3] text-[#fff6e0]">
              {{ store.config?.headline }}
            </h1>

            <p class="text-emerald-100/90 text-sm sm:text-base leading-relaxed font-normal">
              {{ store.config?.subheadline }}
            </p>

            <!-- Quick Buy Card (Reference style) -->
            <div class="bg-[#fff6e0] text-[#16251d] rounded-2xl p-4 sm:p-5 shadow-lg border border-amber-200/40 space-y-3.5">
              
              <!-- Price display with save calculation -->
              <div class="flex items-baseline gap-3 flex-wrap">
                <span class="font-serif-bn font-extrabold text-3xl sm:text-4xl text-[#12372a]">
                  ৳{{ currentDisplayPrice }}
                </span>
                <s v-if="store.regular_price && store.regular_price > currentDisplayPrice" class="text-slate-400 text-lg sm:text-xl font-serif-bn">
                  ৳{{ store.regular_price }}
                </s>
                <span 
                  v-if="store.regular_price && store.regular_price > currentDisplayPrice" 
                  class="ml-auto bg-[#12372a] text-[#fff6e0] rounded-lg px-2.5 py-0.5 text-xs font-bold font-serif-bn"
                >
                  ৳{{ store.regular_price - currentDisplayPrice }} ছাড়
                </span>
              </div>

              <!-- Available Variant Chips if exists -->
              <div v-if="(store.variants?.length || store.config?.variants?.length)" class="grid grid-cols-2 gap-2 pt-1">
                <button
                  v-for="(v, vIdx) in (store.variants?.length ? store.variants : (store.config?.variants || []))"
                  :key="vIdx"
                  @click="selectVariant(v)"
                  class="text-left bg-white border-2 rounded-xl p-2.5 hover:border-amber-500 transition-all cursor-pointer"
                  :class="selectedVariant?.name === v.name ? 'border-amber-500 bg-[#fff9ea] ring-2 ring-amber-500/20' : 'border-[#e6e0cf]'"
                >
                  <span class="block text-xs text-slate-500">{{ v.name }}</span>
                  <b class="text-sm font-serif-bn text-slate-900">৳{{ v.price }}</b>
                </button>
              </div>

              <!-- Stock Bar -->
              <div class="flex items-center justify-between text-xs text-slate-600 gap-3 pt-1">
                <span>স্টক: <b>{{ currentStock }} টি বাকি</b></span>
                <div class="h-2 rounded-full bg-[#e6e0cf] flex-1 overflow-hidden">
                  <div 
                    class="h-full bg-amber-500 rounded-full transition-all duration-500"
                    :style="{ width: `${Math.min(100, Math.max(15, (currentStock / 25) * 100))}%` }"
                  ></div>
                </div>
              </div>

              <!-- Primary CTA -->
              <button 
                v-if="currentStock > 0"
                @click="scrollToForm" 
                class="w-full py-3.5 sm:py-4 bg-[#c97a0c] hover:bg-[#b06a08] text-white font-bold text-base sm:text-lg rounded-xl shadow-md active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer font-sans-bn"
              >
                <ShoppingBag class="w-5 h-5" />
                <span>{{ store.config?.cta_button_text || 'এখনই অর্ডার করুন' }}</span>
              </button>
              <div v-else class="w-full py-3.5 bg-slate-200 text-slate-500 font-bold text-center rounded-xl cursor-not-allowed text-sm">
                পণ্যটির স্টক সাময়িকভাবে শেষ
              </div>

              <p class="text-xs text-slate-500 text-center flex items-center justify-center gap-1">
                <ShieldCheck class="w-4 h-4 text-emerald-700" />
                <span>ক্যাশ অন ডেলিভারি। পণ্য হাতে পেয়ে টাকা দিন।</span>
              </p>
            </div>

          </div>

        </div>
      </div>
    </div>

    <!-- MAIN BODY CONTENT SECTIONS -->
    <main class="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-14 space-y-12 sm:space-y-16">
      
      <!-- PROMOTIONAL VIDEO REEL SECTION (If provided) -->
      <section v-if="videoEmbedUrl" class="text-center space-y-3">
        <div class="max-w-md mx-auto">
          <h2 class="font-serif-bn font-extrabold text-2xl sm:text-3xl text-[#16251d]">ভিডিওতে সরাসরি দেখুন</h2>
          <p class="text-slate-500 text-xs sm:text-sm">পণ্যটি কেমন, নিজের চোখেই দেখে নিন</p>
        </div>

        <div class="w-full max-w-[320px] mx-auto aspect-[9/16] rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-black">
          <iframe 
            :src="videoEmbedUrl" 
            class="w-full h-full"
            frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen
          ></iframe>
        </div>
      </section>

      <!-- WHY THIS PRODUCT / FEATURES SECTION -->
      <section v-if="store.config?.features?.length" class="space-y-6">
        <div class="text-center sm:text-left">
          <h2 class="font-serif-bn font-extrabold text-2xl sm:text-3xl text-[#16251d]">কেন এই পণ্যটি আপনার জন্য সেরা?</h2>
          <p class="text-slate-500 text-xs sm:text-sm mt-1">যে কারণে ক্রেতারা বারবার ফিরে আসেন</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-11 gap-6 items-center">
          <!-- Optional Secondary/Feature Image -->
          <div v-if="store.config?.secondary_image || (productImages.length > 1)" class="md:col-span-5 rounded-3xl overflow-hidden shadow-md border border-[#e6e0cf] bg-white aspect-[4/3] md:aspect-auto md:h-full max-h-[380px]">
            <img 
              :src="store.config?.secondary_image || productImages[1] || productImages[0]" 
              :alt="store.product_title" 
              class="w-full h-full object-cover"
            />
          </div>

          <!-- Features List with circular checkmarks -->
          <div :class="(store.config?.secondary_image || productImages.length > 1) ? 'md:col-span-6' : 'md:col-span-11'">
            <ul class="divide-y divide-[#e6e0cf] border-t border-b border-[#e6e0cf]">
              <li 
                v-for="(feat, fIdx) in store.config.features" 
                :key="fIdx"
                class="py-4 flex items-start gap-3.5"
              >
                <div class="w-8 h-8 rounded-full bg-[#12372a] text-amber-300 flex items-center justify-center shrink-0 mt-0.5 font-bold shadow-2xs">
                  <Check class="w-4 h-4" />
                </div>
                <div>
                  <h3 class="font-bold text-base sm:text-lg text-[#16251d] leading-snug">{{ feat.title }}</h3>
                  <p class="text-slate-600 text-xs sm:text-sm mt-0.5 leading-relaxed">{{ feat.desc }}</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <!-- TESTIMONIALS / SOCIAL PROOF (Dark Forest Green Card Style from reference) -->
      <section v-if="showTestimonials && store.config?.testimonials?.length" class="bg-[#12372a] text-[#fff6e0] rounded-3xl p-6 sm:p-10 shadow-xl space-y-6">
        <div>
          <h2 class="font-serif-bn font-extrabold text-2xl sm:text-3xl text-[#fff6e0]">সম্মানিত ক্রেতাদের মতামত</h2>
          <p class="text-emerald-200/80 text-xs sm:text-sm mt-1">যারা ইতিমধ্যে ব্যবহার করে সন্তুষ্ট</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <figure 
            v-for="(testi, tIdx) in store.config.testimonials" 
            :key="tIdx"
            class="bg-[#1f5a42] rounded-2xl p-5 shadow-xs border border-emerald-700/40 flex flex-col justify-between"
          >
            <div>
              <div class="flex items-center gap-1 text-amber-300 mb-2">
                <Star v-for="i in 5" :key="i" class="w-4 h-4 fill-amber-300 text-amber-300" />
              </div>
              <p class="font-serif-bn font-semibold text-base sm:text-lg text-[#fff6e0] leading-snug mb-3">
                “{{ testi.comment }}”
              </p>
            </div>
            <div class="pt-2 border-t border-emerald-600/50 flex items-center justify-between text-xs text-emerald-200">
              <strong class="font-bold text-[#fff6e0]">{{ testi.name }}</strong>
              <span class="text-emerald-300/80 text-[11px]">{{ testi.location }}</span>
            </div>
          </figure>
        </div>
      </section>

      <!-- FAQ ACCORDION -->
      <section v-if="showFaqs && store.config?.faqs?.length" class="max-w-2xl mx-auto space-y-6">
        <div class="text-center">
          <h2 class="font-serif-bn font-extrabold text-2xl sm:text-3xl text-[#16251d]">সাধারণ কিছু প্রশ্নের উত্তর</h2>
          <p class="text-slate-500 text-xs sm:text-sm mt-1">অর্ডার করার পূর্বে জেনে নিন</p>
        </div>

        <div class="divide-y divide-[#e6e0cf] border-t border-b border-[#e6e0cf]">
          <div 
            v-for="(faq, qIdx) in store.config.faqs" 
            :key="qIdx"
            class="py-2"
          >
            <button 
              type="button"
              @click="toggleFaq(qIdx)"
              class="w-full text-left py-3 flex items-center justify-between gap-4 cursor-pointer select-none font-bold text-sm sm:text-base text-[#16251d]"
            >
              <span>{{ faq.q }}</span>
              <span class="text-amber-700 text-2xl font-light shrink-0 leading-none">
                {{ openFaqIdx === qIdx ? '–' : '+' }}
              </span>
            </button>
            <div 
              v-show="openFaqIdx === qIdx"
              class="pb-3 text-xs sm:text-sm text-slate-600 leading-relaxed font-normal"
            >
              {{ faq.a }}
            </div>
          </div>
        </div>
      </section>

      <!-- COD CHECKOUT FORM -->
      <div v-if="currentStock > 0" class="max-w-2xl mx-auto bg-[#fff6e0] rounded-3xl p-2 sm:p-4 shadow-sm border border-amber-200/60">
        <StoreCodForm :store="store" v-model:selectedVariant="selectedVariant" />
      </div>
      <div v-else class="max-w-2xl mx-auto p-6 sm:p-8 bg-white border border-red-200 rounded-3xl text-center space-y-2">
        <h3 class="text-base sm:text-lg font-bold text-red-600 font-serif-bn">বর্তমানে এই পণ্যটির স্টক খালি</h3>
        <p class="text-xs text-slate-500">দোকানদার নতুন স্টক যোগ করলে পুনরায় অর্ডার করা যাবে।</p>
      </div>

    </main>

    <!-- FOOTER -->
    <footer class="bg-[#16251d] text-[#b9cfc0] text-center py-8 px-4 text-xs sm:text-sm mt-12">
      <div class="max-w-md mx-auto space-y-2">
        <p class="font-serif-bn text-base text-[#fff6e0] font-bold">{{ store.product_title }}</p>
        <p class="text-xs text-slate-400">ক্যাশ অন ডেলিভারি সার্ভিস। পণ্য হাতে পেয়ে মূল্য পরিশোধ করুন।</p>
        <p class="text-[11px] text-slate-500 pt-2">
          Powered by <NuxtLink to="/" class="underline hover:text-slate-300 transition-colors">DokanAI</NuxtLink> — Developed by <a href="https://tajimz.xyz" target="_blank" rel="noopener noreferrer" class="underline hover:text-slate-300 transition-colors">Tajim</a>
        </p>
      </div>
    </footer>

    <!-- STICKY MOBILE BOTTOM BAR (Customer only) -->
    <div 
      v-if="!isStoreOwner && currentStock > 0" 
      class="sm:hidden fixed inset-x-0 bottom-0 z-40 bg-[#12372a] px-4 py-2.5 flex items-center justify-between shadow-2xl border-t border-emerald-800/40"
    >
      <div class="leading-tight text-[#fff6e0]">
        <small class="block text-[11px] text-emerald-200">মূল্য (COD)</small>
        <b class="font-serif-bn text-xl text-amber-300">৳{{ store.price }}</b>
      </div>
      <button 
        @click="scrollToForm" 
        class="bg-[#c97a0c] hover:bg-[#b06a08] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer font-sans-bn"
      >
        <ShoppingBag class="w-4 h-4" />
        <span>অর্ডার করুন</span>
      </button>
    </div>

    <!-- IN-PAGE CUSTOMER AI SALES BOT -->
    <StoreAiSalesBot :store="store" />

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
        class="fixed inset-y-0 right-0 w-full sm:w-[420px] md:w-[460px] h-screen h-[100dvh] max-h-screen bg-white z-50 shadow-2xl flex flex-col border-l border-slate-200 overflow-hidden font-sans-bn"
      >
        <!-- Editor Drawer Header -->
        <div class="p-3.5 sm:p-4 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white shrink-0">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-xs">
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

        <!-- Chat / Instruction History Area (Scrollable container strictly pinned) -->
        <div ref="editorScroll" class="flex-1 min-h-0 p-3 sm:p-4 overflow-y-auto space-y-3 bg-[#fbf9f3] text-xs overscroll-contain">
          <div class="p-3 bg-amber-50 border border-amber-200 text-amber-950 rounded-2xl leading-relaxed shadow-xs">
            👋 <strong>আমি DokanAI এডিটর!</strong><br />
            দোকানের যেকোনো সেকশন বাদ দিতে বা পরিবর্তন করতে বলুন। যেমন:
            <ul class="list-disc pl-4 mt-1.5 space-y-0.5 text-amber-900 text-[11px]">
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
            <div v-if="log.response" class="bg-white border border-slate-200 p-3 rounded-2xl rounded-bl-none mr-auto max-w-[90%] text-xs text-slate-800 space-y-2 shadow-xs">
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
                  class="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/80 rounded-lg text-[10px] font-semibold transition-colors text-left cursor-pointer"
                >
                  ⚡ {{ sug }}
                </button>
              </div>
            </div>
          </div>

          <div v-if="isAiEditing" class="flex items-center gap-2 bg-white border border-slate-200 p-2.5 rounded-2xl w-fit shadow-xs">
            <Loader2 class="w-4 h-4 animate-spin text-amber-600" />
            <span class="text-xs font-bold text-slate-700">AI আপডেট করছে...</span>
          </div>
        </div>

        <!-- Editor Prompt Input Bar (Pinned at bottom, accounting for mobile safe area) -->
        <div class="p-3 pb-6 sm:pb-3 border-t border-slate-100 bg-white shrink-0 shadow-lg z-20">
          <form @submit.prevent="submitAiEdit" class="flex items-center gap-2">
            <input 
              v-model="aiInstruction" 
              type="text" 
              placeholder="কী পরিবর্তন করতে চান বলুন..." 
              class="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-amber-500 font-medium"
              :disabled="isAiEditing"
            />
            <button 
              type="submit" 
              :disabled="!aiInstruction.trim() || isAiEditing"
              class="px-3.5 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95 shrink-0 cursor-pointer"
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
import { Flame, ShoppingBag, ArrowDown, Check, Sparkles, Star, HelpCircle, X, Video, ShieldCheck, CheckCircle2, Loader2, Send, LayoutDashboard, ChevronDown } from 'lucide-vue-next'
import { useAuth } from '~/composables/useAuth'
import { useMetaPixel } from '~/composables/useMetaPixel'

const { currentUser, initAuth } = useAuth()
const route = useRoute()
const slug = route.params.slug

onMounted(() => {
  initAuth()
  if (import.meta.client) {
    const savedLogs = sessionStorage.getItem(`dokan_edit_logs_${slug}`)
    if (savedLogs) {
      try {
        editLogs.value = JSON.parse(savedLogs)
      } catch (e) {}
    }
  }
})

const { data, pending, refresh } = await useFetch(`/api/stores?slug=${slug}`)

const store = computed(() => data.value?.store)

// Owner Check: Only the creator or the demo judge can see the "AI Edit" button
const isStoreOwner = computed(() => {
  if (!currentUser.value) return false
  if (currentUser.value.isGuest) return true
  const storeUserId = store.value?.user_id || store.value?.config?.user_id
  return storeUserId === currentUser.value.id
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

const openFaqIdx = ref(0)
const toggleFaq = (idx) => {
  openFaqIdx.value = openFaqIdx.value === idx ? null : idx
}

const showFaqs = computed(() => {
  return store.value?.config?.show_faqs !== false
})

const currentStock = computed(() => {
  if (typeof store.value?.stock === 'number') return store.value.stock
  if (typeof store.value?.config?.stock === 'number') return store.value.config.stock
  return 15
})

const availableVariants = computed(() => {
  return store.value?.variants || store.value?.config?.variants || []
})

const selectedVariant = ref(null)

watch(availableVariants, (vars) => {
  if (vars && vars.length > 0 && !selectedVariant.value) {
    selectedVariant.value = vars[0]
  }
}, { immediate: true })

const currentDisplayPrice = computed(() => {
  if (selectedVariant.value && typeof selectedVariant.value.price === 'number') {
    return selectedVariant.value.price
  }
  return store.value?.price || 0
})

const selectVariant = (v) => {
  selectedVariant.value = v
}

const isEditingStore = ref(false)
const isAiEditing = ref(false)
const aiInstruction = ref('')
const editLogs = ref([])
const activeHeroImage = ref('')
const editorScroll = ref(null)
const toast = useAppToast()

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

const pixelId = computed(() => store.value?.config?.pixel_id)
const { trackViewContent, trackInitiateCheckout } = useMetaPixel(pixelId)

watch(store, (st) => {
  if (st && pixelId.value) {
    trackViewContent({
      content_name: st.product_title,
      value: st.price,
      currency: 'BDT'
    })
  }
}, { immediate: true })

const scrollToForm = () => {
  if (pixelId.value && store.value) {
    trackInitiateCheckout({
      content_name: store.value.product_title,
      value: store.value.price,
      currency: 'BDT'
    })
  }
  const el = document.getElementById('order-form-section')
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' })
  }
}

const submitAiEdit = async () => {
  const instruction = aiInstruction.value.trim()
  if (!instruction) return

  aiInstruction.value = ''
  
  // Optimistically append the user message immediately before waiting for response
  const activeLogIndex = editLogs.value.length
  editLogs.value.push({
    prompt: instruction,
    response: '',
    suggestions: []
  })

  await nextTick()
  if (editorScroll.value) {
    editorScroll.value.scrollTop = editorScroll.value.scrollHeight
  }

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
      
      // Update the active log item with the response
      if (editLogs.value[activeLogIndex]) {
        editLogs.value[activeLogIndex].response = res.reply
        editLogs.value[activeLogIndex].suggestions = res.suggestions || []
      }

      // Persist in tab session so refresh doesn't wipe chat history
      if (import.meta.client) {
        sessionStorage.setItem(`dokan_edit_logs_${slug}`, JSON.stringify(editLogs.value))
      }

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
    if (editLogs.value[activeLogIndex]) {
      editLogs.value[activeLogIndex].response = 'AI এডিট করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।'
    }
    toast.error('AI এডিট করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।')
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

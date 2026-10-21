<template>
  <div class="bg-[#faf9f5] min-h-screen font-sans-bn selection:bg-emerald-500 selection:text-white">
    <Navbar />

    <!-- Hero Section with Clear Upfront Value Proposition -->
    <section class="relative overflow-hidden pt-8 pb-16 lg:pt-14 lg:pb-24">
      <div class="absolute inset-0 -z-10 bg-[radial-gradient(50rem_50rem_at_top,theme(colors.emerald.100),transparent)] opacity-70"></div>
      
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <!-- Header Text -->
        <div class="text-center max-w-3xl mx-auto">
          <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-6 shadow-xs">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>Single product বিক্রি করার সবচেয়ে সহজ উপায়</span>
          </div>

          <h1 class="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.18] font-serif-bn">
            Product-এর নাম দিন, <br />
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700">
              AI বানিয়ে দেবে আপনার অনলাইন স্টোর
            </span>
          </h1>

          <p class="mt-5 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
            শুধু product-এর নাম আর দাম দিন। AI অনলাইন স্টোর বানিয়ে দেবে, কাস্টম সেলস AI এজেন্ট সহ। Facebook এ ad চালানোর জন্য একদম ready।
          </p>
        </div>

        <!-- Core Merchant Superpowers (Clean 5-Item Grid with Punchy, Concise Copy) -->
        <div class="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 max-w-5xl mx-auto text-left">
          
          <!-- Benefit 1: Telegram Alerts -->
          <div class="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-emerald-300 transition-all flex flex-col justify-between">
            <div>
              <div class="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-2.5">
                <Send class="w-4 h-4" />
              </div>
              <h3 class="font-bold text-slate-900 text-xs sm:text-sm">টেলিগ্রাম অ্যালার্ট</h3>
              <p class="text-[11px] text-slate-500 mt-1 leading-snug">অর্ডার হওয়া মাত্র ফোনে শব্দ সহ নাম, ফোন ও ঠিকানা নোটিফিকেশন।</p>
            </div>
          </div>

          <!-- Benefit 2: Courier Automation -->
          <div class="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-emerald-300 transition-all flex flex-col justify-between">
            <div>
              <div class="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-2.5">
                <Truck class="w-4 h-4" />
              </div>
              <h3 class="font-bold text-slate-900 text-xs sm:text-sm">কুরিয়ার বুকিং</h3>
              <p class="text-[11px] text-slate-500 mt-1 leading-snug">Steadfast, Pathao ও RedX এ সরাসরি ১-ক্লিকে পার্সেল বুকিং।</p>
            </div>
          </div>

          <!-- Benefit 3: Meta Pixel Tracking -->
          <div class="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-emerald-300 transition-all flex flex-col justify-between">
            <div>
              <div class="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2.5">
                <Target class="w-4 h-4" />
              </div>
              <h3 class="font-bold text-slate-900 text-xs sm:text-sm">মেটা পিক্সেল</h3>
              <p class="text-[11px] text-slate-500 mt-1 leading-snug">ViewContent, Checkout ও Purchase স্বয়ংক্রিয় ট্র্যাকিং।</p>
            </div>
          </div>

          <!-- Benefit 4: Real-time Stock Management -->
          <div class="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-emerald-300 transition-all flex flex-col justify-between">
            <div>
              <div class="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-2.5">
                <Boxes class="w-4 h-4" />
              </div>
              <h3 class="font-bold text-slate-900 text-xs sm:text-sm">স্টক ম্যানেজমেন্ট</h3>
              <p class="text-[11px] text-slate-500 mt-1 leading-snug">অটো স্টক ডিডাকশন ও পেজে লাইভ কাউন্টার আর্জেন্সি।</p>
            </div>
          </div>

          <!-- Benefit 5: 24/7 AI Sales Agent -->
          <div class="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-emerald-300 transition-all flex flex-col justify-between sm:col-span-2 lg:col-span-1">
            <div>
              <div class="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2.5">
                <Bot class="w-4 h-4" />
              </div>
              <h3 class="font-bold text-slate-900 text-xs sm:text-sm">AI সেলস বট</h3>
              <p class="text-[11px] text-slate-500 mt-1 leading-snug">২৪/৭ কাস্টমারের প্রশ্নের উত্তর দিয়ে সরাসরি অর্ডার করায়।</p>
            </div>
          </div>

        </div>

        <!-- High-Impact Primary Call to Action -->
        <div class="mt-9 text-center">
          <div class="inline-flex flex-col sm:flex-row items-center gap-3.5">
            <NuxtLink 
              to="/create" 
              class="w-full sm:w-auto px-9 py-4 text-base sm:text-lg font-black text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 rounded-2xl shadow-xl shadow-emerald-600/30 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <Rocket class="w-5 h-5" />
              <span>ফ্রিতে অনলাইন স্টোর বানান</span>
              <ArrowRight class="w-5 h-5" />
            </NuxtLink>

            <NuxtLink 
              to="/s/demo-store" 
              target="_blank" 
              class="w-full sm:w-auto px-7 py-4 text-sm sm:text-base font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-2xl shadow-xs transition-all flex items-center justify-center gap-2"
            >
              <ExternalLink class="w-4 h-4 text-slate-500" />
              <span>Demo স্টোর দেখুন</span>
            </NuxtLink>
          </div>

          <p class="mt-3 text-xs text-slate-500 font-medium">
            ⚡ Credit card লাগবে না, hosting খরচ নেই। ৩০ সেকেন্ডে live
          </p>
        </div>

        <!-- Trust Stats Bar -->
        <div class="mt-12 pt-8 border-t border-slate-200/70 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto text-center">
          <div class="p-2">
            <div class="text-xl sm:text-2xl font-black text-slate-900">৳০ খরচ</div>
            <div class="text-xs text-slate-500 mt-0.5 font-medium">কোনো হোস্টিং ফি নেই</div>
          </div>
          <div class="p-2">
            <div class="text-xl sm:text-2xl font-black text-emerald-600">৩০ সেকেন্ড</div>
            <div class="text-xs text-slate-500 mt-0.5 font-medium">ইনস্ট্যান্ট লাইভ লিংক</div>
          </div>
          <div class="p-2">
            <div class="text-xl sm:text-2xl font-black text-slate-900">১০০% COD</div>
            <div class="text-xs text-slate-500 mt-0.5 font-medium">দ্রুত ক্যাশ অন ডেলিভারি</div>
          </div>
          <div class="p-2">
            <div class="text-xl sm:text-2xl font-black text-emerald-600">২৪/৭ AI চ্যাট</div>
            <div class="text-xs text-slate-500 mt-0.5 font-medium">কাস্টমার সেলস কনভার্সন</div>
          </div>
        </div>

      </div>
    </section>

    <!-- Detailed Workflow / How It Works -->
    <section class="py-16 bg-white border-y border-slate-200/70">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center max-w-xl mx-auto mb-12">
          <h2 class="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-1.5">সহজ ৩টি ধাপ</h2>
          <p class="text-2xl sm:text-3xl font-extrabold text-slate-900 font-serif-bn">কীভাবে কাজ করে DokanAI?</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <!-- Step 1 -->
          <div class="p-6 rounded-3xl bg-[#faf9f5] border border-slate-200/80 hover:shadow-md transition-shadow">
            <div class="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-base mb-4">
              ১
            </div>
            <h3 class="text-base font-bold text-slate-900 mb-1.5">পণ্য ও দাম বলুন</h3>
            <p class="text-xs sm:text-sm text-slate-600 leading-relaxed">
              অনবোর্ডিং চ্যাটে আপনার পণ্যের নাম, দাম ও কয়েকটি ছবি শেয়ার করুন। কোনো টেকনিক্যাল সেটিংসের ঝামেলা নেই।
            </p>
          </div>

          <!-- Step 2 -->
          <div class="p-6 rounded-3xl bg-[#faf9f5] border border-slate-200/80 hover:shadow-md transition-shadow">
            <div class="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-black text-base mb-4">
              ২
            </div>
            <h3 class="text-base font-bold text-slate-900 mb-1.5">AI স্বয়ংক্রিয় পেজ তৈরি করবে</h3>
            <p class="text-xs sm:text-sm text-slate-600 leading-relaxed">
              পণ্য অনুযায়ী মানানসই কালার থিম, আকর্ষণীয় বাংলা হেডলাইন, ট্রাস্ট ব্যাজ এবং COD ফর্ম সহ পেজ তৈরি হবে।
            </p>
          </div>

          <!-- Step 3 -->
          <div class="p-6 rounded-3xl bg-[#faf9f5] border border-slate-200/80 hover:shadow-md transition-shadow">
            <div class="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center font-black text-base mb-4">
              ৩
            </div>
            <h3 class="text-base font-bold text-slate-900 mb-1.5">বিজ্ঞাপন চালান ও অর্ডার নিন</h3>
            <p class="text-xs sm:text-sm text-slate-600 leading-relaxed">
              পেজের লিংক নিয়ে ফেসবুক বিজ্ঞাপনে সেট করুন। অর্ডার এলে সরাসরি টেলিগ্রাম ও ড্যাশবোর্ডে কাস্টমারের ডাটা পাবেন।
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Bottom Action Banner -->
    <section class="py-16 max-w-5xl mx-auto px-4 sm:px-6">
      <div class="rounded-3xl bg-gradient-to-tr from-slate-900 via-slate-800 to-emerald-950 p-8 sm:p-12 text-center text-white shadow-2xl relative overflow-hidden">
        <div class="absolute -right-20 -bottom-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <h2 class="text-2xl sm:text-4xl font-black mb-3 font-serif-bn">আজই আপনার প্রথম COD স্টোর লাইভ করুন</h2>
        <p class="text-slate-300 max-w-lg mx-auto text-xs sm:text-base mb-7 font-normal">
          কোনো ওয়ার্ডপ্রেস সেটআপ বা মাসিক ফি ছাড়া। আপনার ব্যবসার প্রতিটি প্রোডাক্টের জন্য তৈরি করুন আলাদা হাই-কনভার্টিং ল্যান্ডিং পেজ।
        </p>
        <NuxtLink to="/create" class="inline-flex items-center gap-2 px-8 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer">
          <Rocket class="w-4 h-4" />
          <span>এখনই শুরু করুন (ফ্রি)</span>
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup>
import { Rocket, ArrowRight, ExternalLink, Zap, Send, Truck, Target, Sparkles, Boxes, Bot, CheckCircle2 } from 'lucide-vue-next'
</script>

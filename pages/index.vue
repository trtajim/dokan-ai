<template>
  <div>
    <Navbar />

    <!-- Hero Section -->
    <section class="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
      <div class="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.emerald.100),white)] opacity-60"></div>
      
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <!-- Live Pill -->
        <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-8 shadow-sm">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          <span>Bangladesh’s 1st Autonomous COD Store Generator</span>
        </div>

        <h1 class="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
          এক মিনিটে তৈরি করুন <br />
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
            হাই-কনভার্টিং COD ল্যান্ডিং পেজ
          </span>
        </h1>

        <p class="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
          কোনো কোডিং বা ওয়ার্ডপ্রেস ছাড়াই আপনার সিঙ্গেল প্রোডাক্টের বর্ণনা দিন। 
          AI তৈরি করবে স্বয়ংক্রিয় বাংলা ল্যান্ডিং পেজ, ক্যাশ অন ডেলিভারি ফর্ম এবং কাস্টমার ক্লোজিং সেলস চ্যাটবট।
        </p>

        <!-- CTA Buttons -->
        <div class="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <NuxtLink to="/create" class="w-full sm:w-auto px-8 py-4 text-base font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 rounded-2xl shadow-xl shadow-emerald-600/30 transition-all flex items-center justify-center gap-2.5">
            <Sparkles class="w-5 h-5" />
            <span>AI দিয়ে ফ্রি স্টোর তৈরি করুন</span>
            <ArrowRight class="w-5 h-5" />
          </NuxtLink>

          <NuxtLink to="/shop/t900-ultra-smartwatch" target="_blank" class="w-full sm:w-auto px-7 py-4 text-base font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2">
            <ExternalLink class="w-4 h-4 text-slate-500" />
            <span>লাইভ ডেমো স্টোর দেখুন</span>
          </NuxtLink>
        </div>

        <!-- Trust stats -->
        <div class="mt-14 pt-10 border-t border-slate-200/60 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-4xl mx-auto">
          <div>
            <div class="text-2xl sm:text-3xl font-black text-slate-900">৳0 খরচ</div>
            <div class="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">কোনো হোস্টিং ফি নেই</div>
          </div>
          <div>
            <div class="text-2xl sm:text-3xl font-black text-emerald-600">৩০ সেকেন্ড</div>
            <div class="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">ইনস্ট্যান্ট লাইভ লিংক</div>
          </div>
          <div>
            <div class="text-2xl sm:text-3xl font-black text-slate-900">COD Form</div>
            <div class="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">১১ ডিজিট ফোন ভেরিফাইড</div>
          </div>
          <div>
            <div class="text-2xl sm:text-3xl font-black text-emerald-600">AI Sales Bot</div>
            <div class="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">২৪/৭ কাস্টমার ডাউট সলভার</div>
          </div>
        </div>
      </div>
    </section>

    <!-- How It Works Section -->
    <section class="py-16 bg-white border-y border-slate-200/70">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center max-w-xl mx-auto mb-14">
          <h2 class="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-2">সহজ ৩টি ধাপ</h2>
          <p class="text-3xl font-extrabold text-slate-900">কীভাবে কাজ করে DokanAI?</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <!-- Step 1 -->
          <div class="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:shadow-lg transition-shadow">
            <div class="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-lg mb-4">
              ১
            </div>
            <h3 class="text-lg font-bold text-slate-900 mb-2">প্রোডাক্টের বিবরণ দিন</h3>
            <p class="text-sm text-slate-600 leading-relaxed">
              আপনার প্রোডাক্টের নাম, দাম এবং ৩টি মূল সুবিধা লিখুন। DokanAI অনবোর্ডিং এজেন্ট বাকি সব নিজে সাজিয়ে নিবে।
            </p>
          </div>

          <!-- Step 2 -->
          <div class="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:shadow-lg transition-shadow">
            <div class="w-12 h-12 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-black text-lg mb-4">
              ২
            </div>
            <h3 class="text-lg font-bold text-slate-900 mb-2">স্বয়ংক্রিয় স্টোর জেনারেট</h3>
            <p class="text-sm text-slate-600 leading-relaxed">
              হাইপার-কনভার্টিং বাংলা হেডলাইন, ট্রাস্ট ব্যাজ, এফএকিউ এবং ক্যাশ অন ডেলিভারি ফর্ম সহ সম্পূর্ণ পেজ তৈরি হবে নিমেষেই।
            </p>
          </div>

          <!-- Step 3 -->
          <div class="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:shadow-lg transition-shadow">
            <div class="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-lg mb-4">
              ৩
            </div>
            <h3 class="text-lg font-bold text-slate-900 mb-2">অর্ডার পান ড্যাশবোর্ডে</h3>
            <p class="text-sm text-slate-600 leading-relaxed">
              ফেসবুক অ্যাড বা বায়োতে লিংক শেয়ার করুন। গ্রাহক অর্ডার করলেই ড্যাশবোর্ডে রিয়েল-টাইম নোটিফিকেশন চলে আসবে।
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Bottom CTA banner -->
    <section class="py-16 max-w-5xl mx-auto px-4 sm:px-6">
      <div class="rounded-3xl bg-gradient-to-tr from-slate-900 via-slate-800 to-emerald-950 p-8 sm:p-12 text-center text-white shadow-2xl relative overflow-hidden">
        <div class="absolute -right-20 -bottom-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <h2 class="text-2xl sm:text-4xl font-black mb-4">আজই আপনার প্রথম COD স্টোর লাইভ করুন</h2>
        <p class="text-slate-300 max-w-lg mx-auto text-sm sm:text-base mb-8">
          কোন ক্রেডিট কার্ড বা ফি ছাড়াই শুরু করুন। আপনার ব্যবসার বিক্রি বাড়ান ডাবল গতিতে।
        </p>
        <NuxtLink to="/create" class="inline-flex items-center gap-2 px-8 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all">
          <Sparkles class="w-4 h-4" />
          <span>এখনই শুরু করুন</span>
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup>
import { Sparkles, ArrowRight, ExternalLink } from 'lucide-vue-next'
</script>

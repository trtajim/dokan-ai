<template>
  <div class="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md text-center">
      <NuxtLink to="/" class="inline-flex items-center gap-2.5">
        <div class="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center p-2 shadow-md">
          <NuxtLogo />
        </div>
        <span class="text-2xl font-black text-slate-900 tracking-tight">Dokan<span class="text-emerald-500">AI</span></span>
      </NuxtLink>
      <h2 class="mt-4 text-2xl font-black text-slate-900">মার্চেন্ট লগইন প্রয়োজন</h2>
      <p class="mt-1 text-xs sm:text-sm text-slate-500">দোকান তৈরি করতে বা একাধিক স্টোর ও অর্ডার ম্যানেজ করতে সাইন ইন করুন</p>
    </div>

    <div class="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
      <div class="bg-white py-8 px-6 shadow-xl shadow-slate-200/50 rounded-3xl border border-slate-200/80 space-y-6">
        
        <!-- 1-Click Guest Demo Entry for Judges & Testers -->
        <div class="p-5 bg-gradient-to-tr from-emerald-50 via-teal-50 to-emerald-50 border-2 border-emerald-300 rounded-2xl text-center space-y-2.5 shadow-sm">
          <div class="inline-flex items-center gap-1.5 text-xs font-black text-emerald-800 uppercase tracking-wider">
            <Zap class="w-4 h-4 text-emerald-600 fill-emerald-600" />
            <span>গেস্ট ডেমো লগইন</span>
          </div>
          <p class="text-xs text-slate-600 leading-relaxed font-medium">
            পাসওয়ার্ড ছাড়া সরাসরি এক ক্লিকে পরীক্ষামূলক মার্চেন্ট হিসেবে ড্যাশবোর্ড ও শপ ফিচার যাচাই করুন।
          </p>
          <button 
            type="button"
            @click="enterAsGuest"
            class="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-sm shadow-md shadow-emerald-600/30 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <span>গেস্ট ডেমো হিসেবে প্রবেশ করুন (Guest Demo)</span>
            <ArrowRight class="w-4 h-4" />
          </button>
        </div>

        <div class="relative flex items-center justify-center">
          <div class="border-t border-slate-200 w-full"></div>
          <span class="bg-white px-3 text-xs text-slate-400 font-bold uppercase tracking-wider">অথবা আপনার ইমেইল দিয়ে</span>
        </div>

        <!-- Custom Merchant Email & Password Form -->
        <form @submit.prevent="handleEmailLogin" class="space-y-4 text-xs sm:text-sm">
          <div>
            <label class="block font-bold text-slate-700 mb-1">ইমেইল ঠিকানা</label>
            <input 
              v-model="email" 
              type="email" 
              required 
              placeholder="seller@example.com" 
              class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 text-slate-800 font-semibold"
            />
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">পাসওয়ার্ড</label>
            <input 
              v-model="password" 
              type="password" 
              required 
              placeholder="••••••••" 
              class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 text-slate-800 font-semibold"
            />
          </div>

          <button 
            type="submit" 
            class="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-xl transition-all active:scale-95 shadow-md"
          >
            প্রবেশ করুন / অ্যাকাউন্ট খুলুন
          </button>
        </form>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Zap, ArrowRight } from 'lucide-vue-next'
import { useAuth } from '~/composables/useAuth'

const { loginAsGuest, loginWithEmail } = useAuth()
const router = useRouter()
const route = useRoute()

const email = ref('')
const password = ref('')

const enterAsGuest = () => {
  loginAsGuest()
  const redirect = (route.query.redirect as string) || '/dashboard'
  router.push(redirect)
}

const handleEmailLogin = async () => {
  if (!email.value) return
  await loginWithEmail(email.value, password.value)
  const redirect = (route.query.redirect as string) || '/dashboard'
  router.push(redirect)
}
</script>

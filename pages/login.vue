<template>
  <div class="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md text-center">
      <NuxtLink to="/" class="inline-flex items-center gap-2.5">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
          <Sparkles class="w-5 h-5" />
        </div>
        <span class="text-2xl font-black text-slate-900 tracking-tight">Dokan<span class="text-emerald-600">AI</span></span>
      </NuxtLink>
      <h2 class="mt-4 text-2xl font-black text-slate-900">মার্চেন্ট লগইন</h2>
      <p class="mt-1 text-xs sm:text-sm text-slate-500">আপনার সিঙ্গেল প্রোডাক্ট স্টোর ও সেলস ড্যাশবোর্ডে প্রবেশ করুন</p>
    </div>

    <div class="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
      <div class="bg-white py-8 px-6 shadow-xl shadow-slate-200/50 rounded-3xl border border-slate-200/80 space-y-6">
        
        <!-- Quick Guest Demo Entry -->
        <div class="p-4 bg-gradient-to-tr from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl text-center space-y-2">
          <div class="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 uppercase tracking-wider">
            <Zap class="w-3.5 h-3.5 text-emerald-600" />
            <span>১-ক্লিকে তাৎক্ষণিক ডেমো প্রবেশ</span>
          </div>
          <p class="text-xs text-slate-600">কোন রেজিস্ট্রেশন ছাড়া সরাসরি ডেমো অ্যাকাউন্ট দিয়ে সিস্টেমটি পরীক্ষা করুন।</p>
          <button 
            type="button"
            @click="enterAsGuest"
            class="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md shadow-emerald-600/20 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <span>গেস্ট হিসেবে প্রবেশ করুন (Guest Demo)</span>
            <ArrowRight class="w-4 h-4" />
          </button>
        </div>

        <div class="relative flex items-center justify-center">
          <div class="border-t border-slate-200 w-full"></div>
          <span class="bg-white px-3 text-xs text-slate-400 font-semibold uppercase">অথবা ইমেইল দিয়ে</span>
        </div>

        <!-- Email & Password Form -->
        <form @submit.prevent="handleEmailLogin" class="space-y-4 text-xs sm:text-sm">
          <div>
            <label class="block font-bold text-slate-700 mb-1">ইমেইল ঠিকানা</label>
            <input 
              v-model="email" 
              type="email" 
              required 
              placeholder="seller@example.com" 
              class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 text-slate-800"
            />
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">পাসওয়ার্ড</label>
            <input 
              v-model="password" 
              type="password" 
              required 
              placeholder="••••••••" 
              class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 text-slate-800"
            />
          </div>

          <button 
            type="submit" 
            class="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all active:scale-95"
          >
            প্রবেশ করুন / সাইন আপ
          </button>
        </form>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Sparkles, Zap, ArrowRight } from 'lucide-vue-next'
import { useAuth } from '~/composables/useAuth'

const { loginAsGuest, loginWithEmail } = useAuth()
const router = useRouter()

const email = ref('')
const password = ref('')

const enterAsGuest = () => {
  loginAsGuest()
  router.push('/dashboard')
}

const handleEmailLogin = async () => {
  if (!email.value) return
  await loginWithEmail(email.value, password.value)
  router.push('/dashboard')
}
</script>

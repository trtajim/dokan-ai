<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
    <div class="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-in zoom-in-95 duration-200">
      
      <!-- Modal Header -->
      <div class="flex items-center justify-between pb-2 border-b border-slate-100">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center p-1.5 shadow-xs">
            <NuxtLogo />
          </div>
          <div>
            <h3 class="text-base font-black text-slate-900 leading-tight">মার্চেন্ট লগইন</h3>
            <span class="text-[10px] text-emerald-600 font-bold block">DokanAI</span>
          </div>
        </div>

        <button 
          v-if="isDismissible"
          @click="closeLogin"
          class="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Guest Demo 1-Click Button -->
      <div class="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl text-center space-y-2">
        <div class="inline-flex items-center gap-1.5 text-xs font-black text-emerald-800">
          <Zap class="w-4 h-4 text-emerald-600 fill-emerald-600" />
          <span>গেস্ট হিসেবে সরাসরি প্রবেশ</span>
        </div>
        <p class="text-[11px] text-slate-600 leading-snug">
          কোনো পাসওয়ার্ড ছাড়াই ১-ক্লিকে মার্চেন্ট অ্যাকাউন্টে প্রবেশ করুন
        </p>
        <button
          type="button"
          @click="enterAsGuest"
          :disabled="isGuestLoading"
          class="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-75 text-white font-black rounded-xl text-xs shadow-md shadow-emerald-600/20 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Loader2 v-if="isGuestLoading" class="w-4 h-4 animate-spin text-white" />
          <span v-else>গেস্ট হিসেবে প্রবেশ করুন</span>
          <ArrowRight v-if="!isGuestLoading" class="w-3.5 h-3.5" />
        </button>
      </div>

      <div class="relative flex items-center justify-center">
        <div class="border-t border-slate-200 w-full"></div>
        <span class="bg-white px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider absolute">অথবা</span>
      </div>

      <!-- Real Email Form -->
      <form @submit.prevent="handleEmailLogin" class="space-y-3">
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">ইমেইল ঠিকানা</label>
          <input 
            v-model="email" 
            type="email" 
            required 
            placeholder="merchant@example.com"
            class="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" 
          />
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">পাসওয়ার্ড</label>
          <input 
            v-model="password" 
            type="password" 
            required 
            placeholder="••••••••"
            class="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" 
          />
        </div>

        <button 
          type="submit" 
          :disabled="isEmailLoading"
          class="w-full py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-75 text-white font-black rounded-xl text-xs transition-all active:scale-95 shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Loader2 v-if="isEmailLoading" class="w-4 h-4 animate-spin text-white" />
          <span>{{ isEmailLoading ? 'প্রবেশ করা হচ্ছে...' : 'লগইন / সাইনআপ' }}</span>
        </button>
      </form>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { X, Zap, ArrowRight, Loader2 } from 'lucide-vue-next'
import { useAuthModal } from '~/composables/useAuthModal'
import { useAuth } from '~/composables/useAuth'
import { useAppToast } from '~/composables/useAppToast'

const { isOpen, redirectPath, isDismissible, closeLogin } = useAuthModal()
const { loginAsGuest, loginWithEmail } = useAuth()
const toast = useAppToast()
const router = useRouter()

const email = ref('')
const password = ref('')
const isGuestLoading = ref(false)
const isEmailLoading = ref(false)

const enterAsGuest = async () => {
  if (isGuestLoading.value) return
  isGuestLoading.value = true
  try {
    await loginAsGuest()
    isOpen.value = false
    toast.success('সফলভাবে প্রবেশ করা হয়েছে!')
    if (redirectPath.value && redirectPath.value !== window.location.pathname) {
      router.push(redirectPath.value)
    }
  } finally {
    isGuestLoading.value = false
  }
}

const handleEmailLogin = async () => {
  if (!email.value || isEmailLoading.value) return
  isEmailLoading.value = true
  try {
    await loginWithEmail(email.value, password.value)
    isOpen.value = false
    toast.success('সফলভাবে প্রবেশ করা হয়েছে!')
    if (redirectPath.value && redirectPath.value !== window.location.pathname) {
      router.push(redirectPath.value)
    }
  } catch (e) {
    toast.error('লগইন করতে সমস্যা হয়েছে।')
  } finally {
    isEmailLoading.value = false
  }
}
</script>

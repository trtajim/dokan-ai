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
            <h3 class="text-base font-black text-slate-900 leading-tight">মার্চেন্ট অ্যাকাউন্ট</h3>
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

      <div class="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs text-slate-600 leading-relaxed">
        আপনার ইমেইল ও পাসওয়ার্ড দিয়ে সহজে <strong>লগইন বা সাইন-আপ</strong> করুন। অ্যাকাউন্ট না থাকলে স্বয়ংক্রিয়ভাবে নতুন অ্যাকাউন্ট তৈরি হয়ে যাবে।
      </div>

      <!-- Real Supabase Auth Form -->
      <form @submit.prevent="handleSubmit" class="space-y-3.5">
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">ইমেইল ঠিকানা</label>
          <input 
            v-model="email" 
            type="email" 
            required 
            placeholder="merchant@example.com"
            class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" 
          />
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর)</label>
          <input 
            v-model="password" 
            type="password" 
            minlength="6"
            required 
            placeholder="••••••••"
            class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" 
          />
        </div>

        <button 
          type="submit" 
          :disabled="isLoading"
          class="w-full py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-75 text-white font-black rounded-xl text-xs transition-all active:scale-95 shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Loader2 v-if="isLoading" class="w-4 h-4 animate-spin text-white" />
          <span>{{ isLoading ? 'যাচাই করা হচ্ছে...' : 'লগইন / অ্যাকাউন্ট খুলুন' }}</span>
        </button>
      </form>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { X, Loader2 } from 'lucide-vue-next'
import { useAuthModal } from '~/composables/useAuthModal'
import { useAuth } from '~/composables/useAuth'
import { useAppToast } from '~/composables/useAppToast'

const { isOpen, redirectPath, isDismissible, closeLogin } = useAuthModal()
const { loginOrSignUp } = useAuth()
const toast = useAppToast()
const router = useRouter()

const email = ref('')
const password = ref('')
const isLoading = ref(false)

const handleSubmit = async () => {
  if (!email.value || !password.value || isLoading.value) return
  isLoading.value = true
  try {
    await loginOrSignUp(email.value, password.value)
    isOpen.value = false
    toast.success('সফলভাবে প্রবেশ করা হয়েছে!')
    if (redirectPath.value && redirectPath.value !== window.location.pathname) {
      router.push(redirectPath.value)
    }
  } catch (e) {
    toast.error(e?.message || 'লগইন করতে সমস্যা হয়েছে।')
  } finally {
    isLoading.value = false
  }
}
</script>

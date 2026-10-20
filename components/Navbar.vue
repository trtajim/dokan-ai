<template>
  <nav class="border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-40">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      <NuxtLink to="/" class="flex items-center gap-2.5 group">
        <!-- Nuxt Emerald Mountain Logo Badge -->
        <div class="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center p-2 shadow-md group-hover:scale-105 transition-transform">
          <NuxtLogo />
        </div>
        <div>
          <span class="text-xl font-black tracking-tight text-slate-900">Dokan<span class="text-emerald-500">AI</span></span>
          <span class="text-[10px] block font-semibold text-emerald-600 tracking-wide uppercase -mt-1">দোকান এআই</span>
        </div>
      </NuxtLink>

      <div class="flex items-center gap-3">
        <!-- If logged in: Show user badge + Dashboard + Logout -->
        <template v-if="currentUser">
          <div class="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-xl text-xs font-semibold text-slate-700">
            <User class="w-3.5 h-3.5 text-emerald-600" />
            <span class="max-w-[130px] truncate">{{ currentUser.displayName }}</span>
            <button @click="handleLogout" class="text-slate-400 hover:text-red-600 ml-1" title="লগআউট">
              <LogOut class="w-3.5 h-3.5" />
            </button>
          </div>

          <NuxtLink to="/dashboard" class="px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:text-emerald-600 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1.5">
            <LayoutDashboard class="w-4 h-4" />
            <span>Dashboard</span>
          </NuxtLink>

          <NuxtLink to="/create" class="px-4 py-2 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 shadow-md shadow-emerald-600/20 rounded-xl transition-all flex items-center gap-2">
            <Plus class="w-4 h-4" />
            <span class="hidden sm:inline">নতুন দোকান বানান</span>
            <span class="sm:hidden">দোকান</span>
          </NuxtLink>
        </template>

        <!-- If NOT logged in: Direct to Login page -->
        <template v-else>
          <NuxtLink to="/login" class="px-3.5 py-2 text-xs sm:text-sm font-bold text-slate-700 hover:text-slate-950 rounded-lg">
            লগইন
          </NuxtLink>

          <NuxtLink to="/login" class="px-4 py-2 text-xs sm:text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all flex items-center gap-1.5 shadow-sm">
            <span>গেস্ট ডেমো প্রবেশ</span>
            <ArrowRight class="w-3.5 h-3.5 text-emerald-400" />
          </NuxtLink>
        </template>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { onMounted } from 'vue'
import { LayoutDashboard, Plus, User, LogOut, ArrowRight } from 'lucide-vue-next'
import { useAuth } from '~/composables/useAuth'

const { currentUser, initAuth, logout } = useAuth()
const router = useRouter()

onMounted(() => {
  initAuth()
})

const handleLogout = () => {
  logout()
  router.push('/login')
}
</script>

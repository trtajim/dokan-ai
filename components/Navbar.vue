<template>
  <nav class="border-b border-slate-200/80 bg-white/90 backdrop-blur-md sticky top-0 z-40">
    <div class="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
      
      <!-- Brand Logo -->
      <NuxtLink to="/" class="flex items-center gap-2 group shrink-0">
        <div class="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-900 flex items-center justify-center p-1.5 shadow-sm group-hover:scale-105 transition-transform">
          <NuxtLogo />
        </div>
        <div>
          <span class="text-lg sm:text-xl font-black tracking-tight text-slate-900">Dokan<span class="text-emerald-500">AI</span></span>
          <span class="text-[9px] block font-bold text-emerald-600 tracking-wide uppercase -mt-1">দোকান এআই</span>
        </div>
      </NuxtLink>

      <!-- Nav Items -->
      <div class="flex items-center gap-1.5 sm:gap-3">
        <!-- If logged in -->
        <template v-if="currentUser">
          <!-- Mobile user pill -->
          <div class="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded-lg text-xs font-semibold text-slate-700">
            <User class="w-3.5 h-3.5 text-emerald-600" />
            <span class="max-w-[100px] truncate">{{ currentUser.displayName }}</span>
            <button @click="handleLogout" class="text-slate-400 hover:text-red-600 ml-1" title="লগআউট">
              <LogOut class="w-3.5 h-3.5" />
            </button>
          </div>

          <NuxtLink to="/dashboard" class="px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-xs sm:text-sm font-bold text-slate-700 hover:text-emerald-600 hover:bg-slate-100 rounded-xl transition-colors flex items-center gap-1">
            <LayoutDashboard class="w-4 h-4 text-emerald-600" />
            <span>ড্যাশবোর্ড</span>
          </NuxtLink>

          <NuxtLink to="/create" class="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-black text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 shadow-md shadow-emerald-600/20 rounded-xl transition-all flex items-center gap-1.5">
            <Plus class="w-4 h-4" />
            <span>নতুন দোকান</span>
          </NuxtLink>
        </template>

        <!-- If NOT logged in -->
        <template v-else>
          <button @click="openLogin('/dashboard')" class="px-3 py-1.5 text-xs sm:text-sm font-bold text-slate-700 hover:text-slate-900 rounded-lg cursor-pointer">
            লগইন
          </button>

          <NuxtLink to="/create" class="px-3.5 py-1.5 sm:py-2 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all flex items-center gap-1 shadow-sm">
            <span>শুরু করুন</span>
            <ArrowRight class="w-3.5 h-3.5 text-white" />
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
import { useAuthModal } from '~/composables/useAuthModal'

const { currentUser, initAuth, logout } = useAuth()
const { openLogin } = useAuthModal()
const router = useRouter()
const route = useRoute()

onMounted(() => {
  initAuth()
})

const handleLogout = () => {
  logout()
  if (route.path === '/create' || route.path.startsWith('/dashboard')) {
    openLogin(route.path, false)
  } else {
    openLogin('/', true)
  }
}
</script>

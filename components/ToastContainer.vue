<template>
  <div class="fixed top-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
    <TransitionGroup
      enter-active-class="transform ease-out duration-300 transition"
      enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
      enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="pointer-events-auto flex items-start gap-3 p-3.5 rounded-2xl shadow-xl border backdrop-blur-md transition-all"
        :class="{
          'bg-slate-900/95 text-white border-slate-800': toast.type === 'info',
          'bg-emerald-950/95 text-emerald-100 border-emerald-800/80 shadow-emerald-950/20': toast.type === 'success',
          'bg-rose-950/95 text-rose-100 border-rose-800/80 shadow-rose-950/20': toast.type === 'error',
          'bg-amber-950/95 text-amber-100 border-amber-800/80 shadow-amber-950/20': toast.type === 'warning'
        }"
      >
        <div class="shrink-0 mt-0.5">
          <CheckCircle2 v-if="toast.type === 'success'" class="w-5 h-5 text-emerald-400" />
          <AlertCircle v-else-if="toast.type === 'error'" class="w-5 h-5 text-rose-400" />
          <AlertTriangle v-else-if="toast.type === 'warning'" class="w-5 h-5 text-amber-400" />
          <Info v-else class="w-5 h-5 text-sky-400" />
        </div>

        <div class="flex-1 text-xs sm:text-sm">
          <div v-if="toast.title" class="font-bold text-white mb-0.5">{{ toast.title }}</div>
          <div class="font-medium leading-relaxed opacity-95 whitespace-pre-line">{{ toast.message }}</div>
        </div>

        <button
          @click="dismiss(toast.id)"
          class="shrink-0 text-slate-400 hover:text-white transition-colors p-1 rounded-lg"
        >
          <X class="w-4 h-4" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-vue-next'
import { useAppToast } from '~/composables/useAppToast'

const { toasts, dismiss } = useAppToast()
</script>

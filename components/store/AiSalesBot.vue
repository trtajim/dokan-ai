<template>
  <div class="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50">
    <!-- Chat Trigger Bubble -->
    <button 
      v-if="!isOpen"
      @click="isOpen = true"
      class="flex items-center gap-2.5 px-4 py-3 rounded-full text-white shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 font-bold text-sm"
      :class="primaryBgClass"
    >
      <div class="relative">
        <Bot class="w-5 h-5" />
        <span class="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-300 rounded-full animate-ping"></span>
      </div>
      <span>প্রশ্ন করুন (AI Assistant)</span>
    </button>

    <!-- Chat Modal Window -->
    <div 
      v-else 
      class="w-[92vw] sm:w-[380px] h-[480px] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
    >
      <!-- Chat Header -->
      <div class="p-4 text-white flex items-center justify-between" :class="primaryBgClass">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <Bot class="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 class="text-sm font-black leading-tight">{{ store.product_title.slice(0, 24) }}</h4>
            <span class="text-[10px] text-white/80 font-medium">লাইভ সেলস সহকারী</span>
          </div>
        </div>
        <button @click="isOpen = false" class="text-white/80 hover:text-white p-1 rounded-lg">
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Quick Question Chips -->
      <div class="px-3 py-2 bg-slate-50 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <button 
          v-for="(chip, cIdx) in quickChips" 
          :key="cIdx"
          @click="askQuickChip(chip)"
          class="whitespace-nowrap px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white border border-slate-200 text-slate-700 hover:border-slate-400 transition-colors"
        >
          {{ chip }}
        </button>
      </div>

      <!-- Message History -->
      <div ref="chatScroll" class="flex-1 p-3.5 overflow-y-auto space-y-3">
        <div 
          v-for="(msg, mIdx) in messages" 
          :key="mIdx" 
          class="flex flex-col"
          :class="msg.role === 'user' ? 'items-end' : 'items-start'"
        >
          <div 
            class="max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed"
            :class="msg.role === 'user' 
              ? 'bg-slate-900 text-white rounded-br-none' 
              : 'bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200/50'"
          >
            {{ msg.text }}
          </div>
        </div>

        <div v-if="loading" class="flex items-center gap-1.5 bg-slate-100 rounded-2xl rounded-bl-none px-3.5 py-2.5 w-fit">
          <span class="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"></span>
          <span class="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.2s]"></span>
          <span class="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.4s]"></span>
        </div>
      </div>

      <!-- Input Form -->
      <form @submit.prevent="sendMessage" class="p-2.5 border-t border-slate-100 bg-white flex items-center gap-2">
        <input 
          v-model="inputQuery" 
          type="text" 
          placeholder="আপনার প্রশ্ন লিখুন..." 
          class="flex-1 px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900"
          :disabled="loading"
        />
        <button 
          type="submit" 
          :disabled="!inputQuery.trim() || loading"
          class="p-2 text-white rounded-xl font-bold transition-all disabled:opacity-50"
          :class="primaryBgClass"
        >
          <Send class="w-4 h-4" />
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import { Bot, X, Send } from 'lucide-vue-next'

const props = defineProps({
  store: {
    type: Object,
    required: true
  }
})

const isOpen = ref(false)
const loading = ref(false)
const inputQuery = ref('')
const chatScroll = ref(null)

const quickChips = [
  'দাম কত?',
  'ডেলিভারি চার্জ কত?',
  'পণ্য চেক করে টাকা দিতে পারব?',
  'অর্ডার করব কীভাবে?'
]

const messages = ref([
  {
    role: 'model',
    text: `আসসালামু আলাইকুম! ${props.store.product_title} সম্পর্কে আপনার কোনো প্রশ্ন আছে? আমি সাহায্য করতে পারি!`
  }
])

const primaryBgClass = computed(() => {
  const c = props.store.theme_color
  if (c === 'indigo') return 'bg-indigo-600 hover:bg-indigo-700'
  if (c === 'rose') return 'bg-rose-600 hover:bg-rose-700'
  if (c === 'amber') return 'bg-amber-600 hover:bg-amber-700'
  return 'bg-emerald-600 hover:bg-emerald-700'
})

const scrollToBottom = async () => {
  await nextTick()
  if (chatScroll.value) {
    chatScroll.value.scrollTop = chatScroll.value.scrollHeight
  }
}

const askQuickChip = (chip) => {
  inputQuery.value = chip
  sendMessage()
}

const sendMessage = async () => {
  const q = inputQuery.value.trim()
  if (!q) return

  messages.value.push({ role: 'user', text: q })
  inputQuery.value = ''
  scrollToBottom()

  loading.value = true

  try {
    const res = await $fetch('/api/ai/chat', {
      method: 'POST',
      body: {
        slug: props.store.slug,
        message: q,
        history: messages.value.slice(-6)
      }
    })

    if (res && res.reply) {
      messages.value.push({ role: 'model', text: res.reply })
    }
  } catch (err) {
    messages.value.push({
      role: 'model',
      text: 'অর্ডার করতে নিচে দেওয়া ফর্মে নাম, ফোন ও ঠিকানা লিখে অর্ডার করুন।'
    })
  } finally {
    loading.value = false
    scrollToBottom()
  }
}
</script>

<template>
  <div class="fixed bottom-4 sm:bottom-6 right-3 sm:right-6 z-40">
    <!-- Unopened State: Proactive Floating Greeting Bubble + Action Button -->
    <div v-if="!isOpen" class="flex flex-col items-end gap-2.5">
      <!-- Proactive Speech Bubble Notification -->
      <transition
        enter-active-class="transition duration-300 ease-out transform"
        enter-from-class="opacity-0 translate-y-3 scale-95"
        enter-to-class="opacity-100 translate-y-0 scale-100"
        leave-active-class="transition duration-200 ease-in transform"
        leave-from-class="opacity-100 translate-y-0 scale-100"
        leave-to-class="opacity-0 translate-y-2 scale-95"
      >
        <div 
          v-if="showGreetingBubble"
          class="relative bg-white/95 backdrop-blur-md text-slate-800 px-3.5 py-2.5 rounded-2xl shadow-xl border border-slate-200/90 max-w-[240px] sm:max-w-[270px] cursor-pointer hover:shadow-2xl transition-all group"
          @click="openChat"
        >
          <!-- Dismiss button -->
          <button 
            type="button"
            @click.stop="showGreetingBubble = false" 
            class="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-500 hover:text-slate-700 flex items-center justify-center transition-colors shadow-xs"
            title="বন্ধ করুন"
          >
            <X class="w-3 h-3" />
          </button>

          <!-- Speech bubble tail pointing to the trigger button -->
          <div class="absolute -bottom-1.5 right-6 w-3 h-3 bg-white rotate-45 border-r border-b border-slate-200"></div>

          <div class="flex items-start gap-2">
            <span class="text-base sm:text-lg animate-bounce leading-none select-none">👋</span>
            <div class="text-[11px] sm:text-xs leading-snug">
              <p class="font-bold text-slate-900 flex items-center gap-1.5">
                <span>হ্যালো! আমি Dokan AI</span>
                <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              </p>
              <p class="text-slate-600 mt-0.5">কীভাবে সাহায্য করতে পারি? কোনো ছাড় বা তথ্যের দরকার?</p>
            </div>
          </div>
        </div>
      </transition>

      <!-- Chat Trigger Floating Button -->
      <button 
        @click="openChat"
        class="relative flex items-center gap-2 px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-full text-white shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 font-bold text-xs sm:text-sm cursor-pointer"
        :class="primaryBgClass"
      >
        <!-- Ping indicator badge -->
        <span class="absolute -top-1 -right-1 flex h-3 w-3">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span class="relative inline-flex rounded-full h-3 w-3 bg-emerald-400 border-2 border-white"></span>
        </span>
        <Bot class="w-4 h-4 sm:w-5 sm:h-5" />
        <span>AI সহায়ক</span>
      </button>
    </div>

    <!-- Chat Modal Window (Mobile Fullscreen Sheet / Desktop floating) -->
    <div 
      v-else 
      class="fixed sm:static inset-x-2 bottom-2 top-16 sm:inset-auto sm:w-[380px] sm:h-[480px] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-50"
    >
      <!-- Chat Header -->
      <div class="p-3.5 sm:p-4 text-white flex items-center justify-between" :class="primaryBgClass">
        <div class="flex items-center gap-2.5">
          <div class="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/20 flex items-center justify-center">
            <Bot class="w-4 h-4 text-white" />
          </div>
          <div>
            <h4 class="text-xs sm:text-sm font-black leading-tight">{{ store.product_title.slice(0, 22) }}</h4>
            <span class="text-[10px] text-white/80 font-medium">লাইভ সেলস সহকারী</span>
          </div>
        </div>
        <button @click="isOpen = false" class="text-white/80 hover:text-white p-1 rounded-lg">
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Message History -->
      <div ref="chatScroll" class="flex-1 p-3 overflow-y-auto space-y-2.5">
        <div 
          v-for="(msg, mIdx) in messages" 
          :key="mIdx" 
          class="flex flex-col"
          :class="msg.role === 'user' ? 'items-end' : 'items-start'"
        >
          <div 
            class="max-w-[88%] rounded-2xl px-3.5 py-2 text-xs sm:text-sm leading-relaxed"
            :class="msg.role === 'user' 
              ? 'bg-slate-900 text-white rounded-br-none' 
              : 'bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200/50'"
          >
            <p class="whitespace-pre-line">{{ msg.text }}</p>

            <!-- Suggested Question Buttons inside Initial Bot Message (Facebook page style) -->
            <div 
              v-if="mIdx === 0 && messages.length === 1" 
              class="mt-3 pt-2.5 border-t border-slate-200/70 space-y-1.5"
            >
              <button 
                v-for="(chip, cIdx) in quickChips" 
                :key="cIdx"
                type="button"
                @click="askQuickChip(chip)"
                class="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50/50 active:scale-[0.98] transition-all flex items-center justify-between shadow-2xs group cursor-pointer"
              >
                <span>{{ chip }}</span>
                <span class="text-slate-400 group-hover:text-emerald-600 font-bold">›</span>
              </button>
            </div>

            <!-- 1-Click Order Form Shortcut inside AI Bot (Only on the last bot message) -->
            <button
              v-if="msg.role === 'model' && mIdx === messages.length - 1 && (mIdx > 0 || messages.length > 1)"
              @click="closeAndScrollToOrder"
              class="mt-2 w-full py-1.5 px-2.5 text-[11px] font-bold text-white rounded-xl shadow-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
              :class="primaryBgClass"
            >
              <ShoppingBag class="w-3.5 h-3.5" />
              <span>এখানে ক্লিক করে অর্ডার করুন</span>
            </button>
          </div>
        </div>

        <div v-if="loading" class="flex items-center gap-1.5 bg-slate-100 rounded-2xl rounded-bl-none px-3.5 py-2 w-fit">
          <span class="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"></span>
          <span class="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.2s]"></span>
          <span class="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.4s]"></span>
        </div>
      </div>

      <!-- Input Form -->
      <form @submit.prevent="sendMessage" class="p-2 border-t border-slate-100 bg-white flex items-center gap-1.5">
        <input 
          v-model="inputQuery" 
          type="text" 
          placeholder="আপনার প্রশ্ন লিখুন..." 
          class="flex-1 px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900"
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
import { ref, computed, nextTick, onMounted } from 'vue'
import { Bot, X, Send, ShoppingBag } from 'lucide-vue-next'

const props = defineProps({
  store: {
    type: Object,
    required: true
  }
})

const isOpen = ref(false)
const showGreetingBubble = ref(false)
const loading = ref(false)
const inputQuery = ref('')
const chatScroll = ref(null)

onMounted(() => {
  // Show the proactive floating greeting bubble after 1.5 seconds to attract attention
  const timer = setTimeout(() => {
    if (!isOpen.value) {
      showGreetingBubble.value = true
    }
  }, 1500)

  return () => clearTimeout(timer)
})

const openChat = () => {
  showGreetingBubble.value = false
  isOpen.value = true
  scrollToBottom()
}

const quickChips = [
  'দাম কত?',
  'ডেলিভারি চার্জ কত?',
  'পণ্য চেক করে টাকা দিতে পারব?',
  'অর্ডার করব কীভাবে?'
]

const messages = ref([
  {
    role: 'model',
    text: `আসসালামু আলাইকুম! আমি Dokan AI সেলস সহকারী। ${props.store.product_title} সম্পর্কে কোনো তথ্য বা সাহায্য লাগলে জানান!`
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

const closeAndScrollToOrder = () => {
  isOpen.value = false
  const orderSection = document.getElementById('order-form-section')
  if (orderSection) {
    orderSection.scrollIntoView({ behavior: 'smooth' })
  }
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

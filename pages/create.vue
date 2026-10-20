<template>
  <div class="fixed inset-0 flex flex-col bg-slate-50 overflow-hidden select-none">
    <Navbar class="shrink-0" />

    <main class="flex-1 w-full max-w-3xl mx-auto flex flex-col min-h-0 overflow-hidden p-0 sm:p-4">
      
      <!-- Top Title (Hidden on mobile to maximize chat viewport, visible on desktop) -->
      <div class="hidden sm:block mb-3 text-center px-2 shrink-0">
        <h1 class="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
          AI সহকারীর সাথে কথা বলে দোকান তৈরি করুন
        </h1>
        <p class="text-xs sm:text-sm text-slate-500 mt-0.5">
          AI আপনাকে প্রশ্ন করবে এবং আইডিয়া সাজেস্ট করবে।
        </p>
      </div>

      <!-- Pure Chat Container (Locked strictly inside the flexbox, only message feed scrolls) -->
      <div class="bg-white sm:rounded-3xl border-y sm:border border-slate-200/90 shadow-none sm:shadow-xl overflow-hidden flex flex-col flex-1 min-h-0">
        
        <!-- Chat Header Bar (Fixed / non-scrolling header) -->
        <div class="shrink-0 px-3 py-2 sm:px-4 sm:py-3 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
          <div class="flex items-center gap-2 sm:gap-3">
            <div class="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold shadow-sm">
              <Bot class="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h3 class="text-xs sm:text-sm font-bold text-slate-900">DokanAI সহকারী</h3>
              <span class="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-semibold">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> অনলাইন
              </span>
            </div>
          </div>

          <button @click="resetChat" class="text-xs text-slate-400 hover:text-slate-600 px-2 py-1">
            রিসেট
          </button>
        </div>

        <!-- Scrollable Messages Feed (The ONLY element that can scroll) -->
        <div ref="chatScrollContainer" class="flex-1 p-3 sm:p-6 overflow-y-auto overscroll-contain space-y-3 sm:space-y-4">
          
          <div v-for="(msg, idx) in messages" :key="idx" class="flex flex-col" :class="msg.role === 'user' ? 'items-end' : 'items-start'">
            
            <div 
              class="max-w-[92%] sm:max-w-[78%] rounded-2xl sm:rounded-3xl px-3.5 sm:px-5 py-2.5 sm:py-3.5 text-xs sm:text-sm leading-relaxed"
              :class="msg.role === 'user' 
                ? 'bg-emerald-600 text-white rounded-br-none shadow-sm' 
                : 'bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200/50'"
            >
              <!-- Render user-attached images inside message bubble -->
              <div v-if="msg.images && msg.images.length > 0" class="flex flex-wrap gap-1.5 mb-2">
                <div v-for="(img, imgIdx) in msg.images" :key="imgIdx" class="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-white/30 shadow-sm">
                  <img :src="img" class="w-full h-full object-cover" />
                </div>
              </div>

              <p class="whitespace-pre-line">{{ msg.content }}</p>

              <!-- IN-CHAT DYNAMIC ACTION CARD -->
              <div v-if="msg.readyToGenerate" class="mt-3 pt-2.5 border-t border-slate-200/60 animate-in fade-in zoom-in-95 duration-200">
                <div class="p-3 bg-white rounded-xl sm:rounded-2xl border border-emerald-200 shadow-sm space-y-2.5 text-slate-800">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-1.5 text-emerald-700 font-bold text-xs">
                      <CheckCircle2 class="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>সংগৃহীত সকল তথ্য রিভিউ</span>
                    </div>
                    <span class="text-[10px] bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded-full border border-emerald-200">
                      রেডি টু বিল্ড
                    </span>
                  </div>

                  <p class="text-[11px] text-slate-500 leading-normal">
                    একবার রিভিউ করে দেখুন, কিছু পরিবর্তন করার থাকলে নিচে লিখে জানান অথবা সরাসরি দোকানটি তৈরি করুন:
                  </p>
                  
                  <div class="text-[10px] sm:text-[11px] text-slate-700 font-medium space-y-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                    <div class="flex items-start justify-between border-b border-slate-200/60 pb-1">
                      <span class="text-slate-500">📦 প্রোডাক্ট:</span>
                      <strong class="text-right text-slate-900">{{ extractedData.product_title || 'এক্সক্লুসিভ কালেকশন' }}</strong>
                    </div>

                    <div class="flex items-center justify-between border-b border-slate-200/60 pb-1">
                      <span class="text-slate-500">💰 অফার মূল্য:</span>
                      <strong class="text-emerald-700 font-bold">৳{{ extractedData.price || 1200 }}</strong>
                    </div>

                    <div v-if="extractedData.variants && extractedData.variants.length > 0" class="flex items-start justify-between border-b border-slate-200/60 pb-1">
                      <span class="text-slate-500">🏷️ ভ্যারিয়েন্ট:</span>
                      <strong class="text-right text-slate-800">
                        {{ extractedData.variants.map(v => typeof v === 'object' ? `${v.name}${v.price ? ' (৳' + v.price + ')' : ''}` : v).join(', ') }}
                      </strong>
                    </div>

                    <div class="flex items-center justify-between border-b border-slate-200/60 pb-1">
                      <span class="text-slate-500">🖼️ ছবি:</span>
                      <strong class="text-slate-800">{{ allUploadedImages.length }} টি যুক্ত আছে</strong>
                    </div>

                    <div class="flex items-center justify-between border-b border-slate-200/60 pb-1">
                      <span class="text-slate-500">🎥 রিল / ভিডিও:</span>
                      <strong class="text-slate-800">
                        {{ extractedData.video_reel_url ? 'লিঙ্ক সংযুক্ত আছে' : 'সংযুক্ত নেই' }}
                      </strong>
                    </div>

                    <div class="flex items-center justify-between pt-0.5">
                      <span class="text-slate-500">🚚 ডেলিভারি চার্জ:</span>
                      <span class="text-slate-800 font-semibold">
                        ভেতরে ৳{{ extractedData.delivery_fee_inside }} | বাইরে ৳{{ extractedData.delivery_fee_outside }}
                      </span>
                    </div>
                  </div>

                  <button 
                    @click="generateFullStore" 
                    :disabled="isGeneratingStore"
                    class="w-full py-3 px-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer"
                  >
                    <Loader2 v-if="isGeneratingStore" class="w-4 h-4 animate-spin" />
                    <Sparkles v-else class="w-4 h-4" />
                    <span>{{ isGeneratingStore ? 'দোকান তৈরি হচ্ছে...' : 'দোকানটি তৈরি করুন' }}</span>
                  </button>
                </div>
              </div>
            </div>
            
            <span class="text-[9px] text-slate-400 mt-0.5 px-1">
              {{ msg.role === 'user' ? 'আপনি' : 'DokanAI' }}
            </span>
          </div>

          <!-- Dynamic Friendly AI Progress Indicator -->
          <div v-if="isAiTyping" class="flex items-center gap-2.5 bg-slate-100 border border-slate-200/60 rounded-2xl rounded-bl-none px-4 py-2.5 w-fit max-w-[85%] text-xs font-semibold text-slate-700 shadow-2xs">
            <span class="relative flex h-2 w-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span class="animate-pulse">{{ currentLoadingMessage }}</span>
          </div>
        </div>

        <!-- Mobile Optimized Chat Input Area -->
        <div class="shrink-0 p-2 sm:p-3.5 border-t border-slate-100 bg-white">
          <form @submit.prevent="sendMessage" class="bg-slate-50 border border-slate-200 rounded-2xl p-1.5 sm:p-2 focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 transition-all">
            
            <!-- Pre-send attached image thumbnails -->
            <div v-if="pendingImages.length > 0" class="flex items-center gap-1.5 px-1.5 pt-1 pb-1.5 overflow-x-auto">
              <div v-for="(img, pIdx) in pendingImages" :key="pIdx" class="relative group w-12 h-12 rounded-lg overflow-hidden border border-slate-300 shrink-0">
                <img :src="img" class="w-full h-full object-cover" />
                <button 
                  type="button"
                  @click="removePendingImage(pIdx)" 
                  class="absolute top-0.5 right-0.5 bg-slate-900/80 text-white rounded-full p-0.5"
                >
                  <X class="w-2.5 h-2.5" />
                </button>
              </div>
            </div>

            <!-- Input row: Clip button + Textarea + Send button -->
            <div class="flex items-end gap-1.5">
              <label 
                class="cursor-pointer p-2 text-slate-400 hover:text-emerald-600 rounded-full transition-colors flex items-center justify-center shrink-0 mb-0.5" 
                title="ছবি আপলোড করুন"
              >
                <Paperclip class="w-5 h-5" />
                <input type="file" accept="image/*" multiple @change="handleFileUpload" class="hidden" />
              </label>

              <textarea 
                v-model="inputMessage" 
                @keydown.enter.exact.prevent="sendMessage"
                @paste="handlePaste"
                rows="1"
                :placeholder="currentUser ? 'উত্তর লিখুন বা ছবি পেস্ট (Ctrl+V) / আপলোড করুন...' : 'চ্যাট করতে প্রথমে লগইন করুন...'" 
                class="flex-1 max-h-24 min-h-[36px] py-2 px-1 text-xs sm:text-sm bg-transparent border-0 focus:outline-none resize-none placeholder:text-slate-400 text-slate-800 font-medium"
                :disabled="!currentUser || isAiTyping || isGeneratingStore"
              ></textarea>

              <button 
                type="submit" 
                :disabled="!currentUser || (!inputMessage.trim() && pendingImages.length === 0) || isAiTyping || isGeneratingStore"
                class="p-2 sm:p-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-full font-bold transition-all flex items-center justify-center shadow-sm active:scale-95 shrink-0 mb-0.5"
              >
                <Send class="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>

      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, nextTick, onMounted, watch } from 'vue'
import { Sparkles, Bot, Send, Loader2, CheckCircle2, Paperclip, X } from 'lucide-vue-next'
import { useAuth } from '~/composables/useAuth'
import { useAuthModal } from '~/composables/useAuthModal'
import { useAppToast } from '~/composables/useAppToast'

const router = useRouter()
const { currentUser, initAuth } = useAuth()
const { openLogin } = useAuthModal()
const toast = useAppToast()

// Reactive Auth Guard: If user logs out while on /create, strictly lock with non-dismissible login modal
watch(currentUser, (user) => {
  if (!user) {
    openLogin('/create', false)
  }
})

const chatScrollContainer = ref(null)
const isAiTyping = ref(false)
const isGeneratingStore = ref(false)
const inputMessage = ref('')

const loadingMessages = [
  'আপনার তথ্যটি পর্যবেক্ষণ করছি...',
  'প্রোডাক্টের বিবরণ বিশ্লেষণ করা হচ্ছে...',
  'হাই-কনভার্টিং কপি ও তথ্য সাজাচ্ছি...',
  'একটু অপেক্ষা করুন, উত্তর তৈরি হচ্ছে...'
]
const currentLoadingMessage = ref(loadingMessages[0])
let loadingInterval = null

const startLoadingMessages = () => {
  let idx = 0
  currentLoadingMessage.value = loadingMessages[0]
  if (loadingInterval) clearInterval(loadingInterval)
  loadingInterval = setInterval(() => {
    idx = (idx + 1) % loadingMessages.length
    currentLoadingMessage.value = loadingMessages[idx]
  }, 1800)
}

const stopLoadingMessages = () => {
  if (loadingInterval) {
    clearInterval(loadingInterval)
    loadingInterval = null
  }
}

const pendingImages = ref([])
const allUploadedImages = ref([])

const messages = ref([
  {
    role: 'model',
    content: `হ্যালো! আপনার অনলাইন সিঙ্গেল-প্রোডাক্ট স্টোরের জন্য আপনি কোন প্রোডাক্টটি বিক্রি করতে চান? লিখে জানান, প্লিজ!`
  }
])

const extractedData = reactive({
  product_title: '',
  price: null,
  regular_price: null,
  delivery_fee_inside: 70,
  delivery_fee_outside: 130,
  theme_color: 'emerald',
  highlights: []
})

const scrollToBottom = async () => {
  await nextTick()
  if (chatScrollContainer.value) {
    chatScrollContainer.value.scrollTop = chatScrollContainer.value.scrollHeight
  }
}

const handleFileUpload = (e) => {
  const files = e.target.files
  if (!files || files.length === 0) return
  processFiles(files)
}

const handlePaste = (e) => {
  const clipboardData = e.clipboardData || window.clipboardData
  if (!clipboardData) return
  const items = clipboardData.items
  if (!items) return

  const imageFiles = []
  for (let i = 0; i < items.length; i++) {
    if (items[i].type && items[i].type.startsWith('image/')) {
      const file = items[i].getAsFile()
      if (file) {
        imageFiles.push(file)
      }
    }
  }

  if (imageFiles.length > 0) {
    processFiles(imageFiles)
    toast.success(`${imageFiles.length}টি ছবি পেস্ট করা হয়েছে!`)
  }
}

const processFiles = (files) => {
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    if (file && file.type && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          pendingImages.value.push(uploadEvent.target.result)
        }
      }
      reader.readAsDataURL(file)
    }
  }
}

const removePendingImage = (index) => {
  pendingImages.value.splice(index, 1)
}

const sendMessage = async () => {
  if (!currentUser.value) {
    openLogin('/create', false)
    return
  }

  const text = inputMessage.value.trim()
  const attached = [...pendingImages.value]

  if (!text && attached.length === 0) return

  messages.value.push({ 
    role: 'user', 
    content: text || 'প্রোডাক্টের ছবি যুক্ত করেছি',
    images: attached
  })

  if (attached.length > 0) {
    allUploadedImages.value.push(...attached)
  }

  inputMessage.value = ''
  pendingImages.value = []
  scrollToBottom()

  isAiTyping.value = true
  startLoadingMessages()

  try {
    const res = await $fetch('/api/ai/onboard', {
      method: 'POST',
      body: {
        messages: messages.value,
        userMessage: text || 'আমি ছবি দিয়েছি'
      }
    })

    if (res && res.reply) {
      if (res.extractedData) {
        if (res.extractedData.product_title && !extractedData.product_title) {
          extractedData.product_title = res.extractedData.product_title
        }
        if (res.extractedData.price) {
          extractedData.price = res.extractedData.price
          extractedData.regular_price = res.extractedData.regular_price || Math.round(res.extractedData.price * 1.4)
        }
        if (res.extractedData.video_reel_url) {
          extractedData.video_reel_url = res.extractedData.video_reel_url
        }
        if (res.extractedData.variants) {
          extractedData.variants = res.extractedData.variants
        }
        if (res.extractedData.delivery_fee_inside) {
          extractedData.delivery_fee_inside = res.extractedData.delivery_fee_inside
        }
        if (res.extractedData.delivery_fee_outside) {
          extractedData.delivery_fee_outside = res.extractedData.delivery_fee_outside
        }
        if (res.extractedData.theme_color) {
          extractedData.theme_color = res.extractedData.theme_color
        }
      }

      messages.value.push({
        role: 'model',
        content: res.reply,
        readyToGenerate: !!res.readyToGenerate
      })
    }
  } catch (err) {
    console.error('Onboarding error:', err)
    messages.value.push({
      role: 'model',
      content: 'আমি আপনার তথ্য বুঝতে পেরেছি। স্টোর তৈরি করতে চাইলে নিচের বাটনে চাপ দিন!',
      readyToGenerate: true
    })
  } finally {
    isAiTyping.value = false
    stopLoadingMessages()
    scrollToBottom()
  }
}

const generateFullStore = async () => {
  isGeneratingStore.value = true

  try {
    const res = await $fetch('/api/ai/generate', {
      method: 'POST',
      body: {
        user_id: currentUser.value?.id || 'guest_merchant_demo',
        product_title: extractedData.product_title || 'প্রিমিয়াম স্পেশাল প্রোডাক্ট',
        price: extractedData.price || 999,
        regular_price: extractedData.regular_price || 1400,
        delivery_fee_inside: extractedData.delivery_fee_inside || 70,
        delivery_fee_outside: extractedData.delivery_fee_outside || 130,
        video_reel_url: extractedData.video_reel_url || '',
        variants: extractedData.variants || [],
        images: allUploadedImages.value.length > 0 ? allUploadedImages.value : [],
        theme_color: extractedData.theme_color || 'emerald',
        description: messages.value.map(m => m.content).join(' ')
      }
    })

    if (res && res.store && res.store.slug) {
      router.push(`/s/${res.store.slug}?created=1`)
    }
  } catch (err) {
    console.error('Store generation failed:', err)
    toast.error('দোকান তৈরি করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।')
  } finally {
    isGeneratingStore.value = false
  }
}

const resetChat = () => {
  messages.value = [
    {
      role: 'model',
      content: `হ্যালো! আপনার অনলাইন সিঙ্গেল-প্রোডাক্ট স্টোরের জন্য আপনি কোন প্রোডাক্টটি বিক্রি করতে চান? লিখে জানান, প্লিজ!`
    }
  ]
  extractedData.product_title = ''
  extractedData.price = null
  extractedData.regular_price = null
  pendingImages.value = []
  allUploadedImages.value = []
}

onMounted(async () => {
  await initAuth()
  if (!currentUser.value) {
    openLogin('/create', false)
    return
  }
  scrollToBottom()
})
</script>

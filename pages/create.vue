<template>
  <div class="min-h-screen bg-slate-50 flex flex-col">
    <Navbar />

    <main class="flex-1 max-w-3xl w-full mx-auto p-2.5 sm:p-6 lg:p-8 flex flex-col justify-between">
      
      <!-- Top Title (Compact on mobile) -->
      <div class="mb-2 sm:mb-4 text-center px-2">
        <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1 sm:mb-2">
          <Sparkles class="w-3 h-3 text-emerald-600" />
          <span>Multimodal Conversational AI</span>
        </div>
        <h1 class="text-xl sm:text-3xl font-black text-slate-900 leading-tight">
          AI সহকারীর সাথে কথা বলে দোকান তৈরি করুন
        </h1>
        <p class="text-[11px] sm:text-sm text-slate-500 mt-0.5 sm:mt-1 max-w-md mx-auto hidden sm:block">
          AI আপনাকে একটি একটি করে প্রশ্ন করবে এবং আইডিয়া সাজেস্ট করবে।
        </p>
      </div>

      <!-- Pure Chat Container (Full height responsive on mobile screens) -->
      <div class="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-lg sm:shadow-xl overflow-hidden flex flex-col flex-1 h-[78vh] sm:h-[640px]">
        
        <!-- Chat Header Bar -->
        <div class="px-3 py-2.5 sm:p-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
          <div class="flex items-center gap-2 sm:gap-3">
            <div class="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold shadow-sm">
              <Bot class="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h3 class="text-xs sm:text-sm font-bold text-slate-900">DokanAI সহকারী</h3>
              <span class="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-semibold">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> ১টি করে প্রশ্ন মোড
              </span>
            </div>
          </div>

          <button @click="resetChat" class="text-xs text-slate-400 hover:text-slate-600 px-2 py-1">
            রিসেট
          </button>
        </div>

        <!-- Scrollable Messages Feed -->
        <div ref="chatScrollContainer" class="flex-1 p-3 sm:p-6 overflow-y-auto space-y-3 sm:space-y-4">
          
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
                <div class="p-3 bg-white rounded-xl sm:rounded-2xl border border-emerald-200 shadow-sm space-y-2 text-slate-800">
                  <div class="flex items-center gap-1.5 text-emerald-700 font-bold text-xs">
                    <CheckCircle2 class="w-4 h-4 text-emerald-600" />
                    <span>সব তথ্য সংগ্রহ সম্পন্ন হয়েছে!</span>
                  </div>
                  
                  <div class="text-[10px] sm:text-[11px] text-slate-600 font-medium space-y-0.5 bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <div>📦 প্রোডাক্ট: <strong>{{ extractedData.product_title || 'এক্সক্লুসিভ কালেকশন' }}</strong></div>
                    <div>💰 অফার মূল্য: <strong class="text-emerald-600">৳{{ extractedData.price || 1200 }}</strong></div>
                    <div>🚚 ডেলিভারি: <strong>ভেতরে ৳{{ extractedData.delivery_fee_inside }} | বাইরে ৳{{ extractedData.delivery_fee_outside }}</strong></div>
                    <div>🖼️ ছবি: <strong>{{ allUploadedImages.length }} টি যুক্ত আছে</strong></div>
                  </div>

                  <button 
                    @click="generateFullStore" 
                    :disabled="isGeneratingStore"
                    class="w-full py-3 px-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-xs sm:text-sm"
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

          <!-- Typing Indicator -->
          <div v-if="isAiTyping" class="flex items-center gap-1.5 bg-slate-100 border border-slate-200/50 rounded-2xl rounded-bl-none px-3.5 py-2.5 w-fit">
            <span class="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"></span>
            <span class="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.2s]"></span>
            <span class="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.4s]"></span>
          </div>
        </div>

        <!-- Mobile Optimized Chat Input Area -->
        <div class="p-2 sm:p-3.5 border-t border-slate-100 bg-white">
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
                rows="1"
                placeholder="উত্তর লিখুন বা ছবি দিন..." 
                class="flex-1 max-h-24 min-h-[36px] py-2 px-1 text-xs sm:text-sm bg-transparent border-0 focus:outline-none resize-none placeholder:text-slate-400 text-slate-800 font-medium"
                :disabled="isAiTyping || isGeneratingStore"
              ></textarea>

              <button 
                type="submit" 
                :disabled="(!inputMessage.trim() && pendingImages.length === 0) || isAiTyping || isGeneratingStore"
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
import { ref, reactive, nextTick, onMounted } from 'vue'
import { Sparkles, Bot, Send, Loader2, CheckCircle2, Paperclip, X } from 'lucide-vue-next'
import { useAuth } from '~/composables/useAuth'

const router = useRouter()
const { currentUser, initAuth } = useAuth()

const chatScrollContainer = ref(null)
const isAiTyping = ref(false)
const isGeneratingStore = ref(false)
const inputMessage = ref('')

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
  for (let i = 0; i < files.length; i++) {
    const reader = new FileReader()
    reader.onload = (uploadEvent) => {
      if (uploadEvent.target?.result) {
        pendingImages.value.push(uploadEvent.target.result)
      }
    }
    reader.readAsDataURL(files[i])
  }
}

const removePendingImage = (index) => {
  pendingImages.value.splice(index, 1)
}

const sendMessage = async () => {
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
        images: allUploadedImages.value.length > 0 ? allUploadedImages.value : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'],
        theme_color: extractedData.theme_color || 'emerald',
        description: messages.value.map(m => m.content).join(' ')
      }
    })

    if (res && res.store && res.store.slug) {
      router.push(`/shop/${res.store.slug}?created=1`)
    }
  } catch (err) {
    console.error('Store generation failed:', err)
    alert('দোকান তৈরি করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।')
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

onMounted(() => {
  initAuth()
  if (!currentUser.value) {
    router.push('/login?redirect=/create')
    return
  }
  scrollToBottom()
})
</script>

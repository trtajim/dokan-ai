<template>
  <div class="min-h-screen bg-slate-50 flex flex-col">
    <Navbar />

    <main class="flex-1 max-w-3xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col">
      <!-- Top Title -->
      <div class="mb-4 text-center">
        <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles class="w-3.5 h-3.5 text-emerald-600" />
          <span>Multimodal AI Store Agent</span>
        </div>
        <h1 class="text-2xl sm:text-3xl font-black text-slate-900">
          AI সহকারীর সাথে কথা বলে দোকান তৈরি করুন
        </h1>
        <p class="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
          ChatGPT/Gemini-এর মতো ছবি আপলোড করুন ও চ্যাট করুন। সব প্রশ্নের উত্তর দিয়ে তৈরি করুন সম্পূর্ণ লাইভ স্টোর।
        </p>
      </div>

      <!-- Pure Chat Container -->
      <div class="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden flex flex-col flex-1 h-[640px]">
        
        <!-- Chat Header Bar -->
        <div class="p-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-500/20">
              <Bot class="w-5 h-5" />
            </div>
            <div>
              <h3 class="text-sm font-bold text-slate-900">DokanAI অনবোর্ডিং স্পেশালিস্ট</h3>
              <span class="inline-flex items-center gap-1.5 text-[11px] text-emerald-600 font-semibold">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> অনলাইন (Conversational Mode)
              </span>
            </div>
          </div>

          <button @click="resetChat" class="text-xs text-slate-400 hover:text-slate-600 p-1">
            রিসেট
          </button>
        </div>

        <!-- Scrollable Messages Feed -->
        <div ref="chatScrollContainer" class="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
          
          <div v-for="(msg, idx) in messages" :key="idx" class="flex flex-col" :class="msg.role === 'user' ? 'items-end' : 'items-start'">
            
            <div 
              class="max-w-[88%] sm:max-w-[78%] rounded-3xl px-4 sm:px-5 py-3 sm:py-3.5 text-xs sm:text-sm leading-relaxed"
              :class="msg.role === 'user' 
                ? 'bg-emerald-600 text-white rounded-br-none shadow-md shadow-emerald-600/10' 
                : 'bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200/50'"
            >
              <!-- Render user-attached images directly inside user message bubble (like ChatGPT/Gemini) -->
              <div v-if="msg.images && msg.images.length > 0" class="flex flex-wrap gap-2 mb-2.5">
                <div v-for="(img, imgIdx) in msg.images" :key="imgIdx" class="w-20 h-20 rounded-xl overflow-hidden border border-white/20 shadow-sm">
                  <img :src="img" class="w-full h-full object-cover" />
                </div>
              </div>

              <p class="whitespace-pre-line">{{ msg.content }}</p>

              <!-- IN-CHAT DYNAMIC ACTION CARD (Appears in chat when all follow-ups are answered) -->
              <div v-if="msg.readyToGenerate" class="mt-4 pt-3 border-t border-slate-200/60 animate-in fade-in zoom-in-95 duration-200">
                <div class="p-3.5 bg-white rounded-2xl border border-emerald-200 shadow-sm space-y-2.5 text-slate-800">
                  <div class="flex items-center gap-2 text-emerald-700 font-bold text-xs">
                    <CheckCircle2 class="w-4 h-4 text-emerald-600" />
                    <span>সব প্রয়োজনীয় তথ্য সংগ্রহ সম্পন্ন হয়েছে!</span>
                  </div>
                  
                  <div class="text-[11px] text-slate-600 font-medium space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <div>📦 প্রোডাক্ট: <strong>{{ extractedData.product_title || 'এক্সক্লুসিভ কালেকশন' }}</strong></div>
                    <div>💰 অফার মূল্য: <strong class="text-emerald-600">৳{{ extractedData.price || 1200 }}</strong> (আগে ছিল: <span class="line-through">৳{{ extractedData.regular_price || 1800 }}</span>)</div>
                    <div>🚚 ডেলিভারি চার্জ: <strong>ঢাকার ভেতরে ৳{{ extractedData.delivery_fee_inside }} | বাইরে ৳{{ extractedData.delivery_fee_outside }}</strong></div>
                    <div>🖼️ প্রোডাক্ট ফটো: <strong>{{ allUploadedImages.length }} টি ছবি সংযুক্ত আছে</strong></div>
                  </div>

                  <button 
                    @click="generateFullStore" 
                    :disabled="isGeneratingStore"
                    class="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 text-xs sm:text-sm"
                  >
                    <Loader2 v-if="isGeneratingStore" class="w-4 h-4 animate-spin" />
                    <Sparkles v-else class="w-4 h-4" />
                    <span>{{ isGeneratingStore ? 'দোকান তৈরি হচ্ছে...' : 'দোকানটি তৈরি করুন (Click to Launch Store)' }}</span>
                  </button>
                </div>
              </div>
            </div>
            
            <span class="text-[10px] text-slate-400 mt-1 px-1">
              {{ msg.role === 'user' ? 'আপনি' : 'DokanAI' }}
            </span>
          </div>

          <!-- Typing Indicator -->
          <div v-if="isAiTyping" class="flex items-center gap-1.5 bg-slate-100 border border-slate-200/50 rounded-2xl rounded-bl-none px-4 py-3 w-fit">
            <span class="w-2 h-2 rounded-full bg-slate-400 animate-bounce"></span>
            <span class="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:0.2s]"></span>
            <span class="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:0.4s]"></span>
          </div>
        </div>

        <!-- Chat Input Area (ChatGPT / Gemini Style: Pill Box with Embedded Attachment) -->
        <div class="p-3 sm:p-4 border-t border-slate-100 bg-white">
          <form @submit.prevent="sendMessage" class="bg-slate-50 border border-slate-200 rounded-3xl p-2 sm:p-2.5 focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 transition-all">
            
            <!-- Pre-send attached image thumbnails (Inside the input card, just like ChatGPT/Gemini) -->
            <div v-if="pendingImages.length > 0" class="flex items-center gap-2 px-2 pt-1 pb-2 overflow-x-auto">
              <div v-for="(img, pIdx) in pendingImages" :key="pIdx" class="relative group w-14 h-14 rounded-xl overflow-hidden border border-slate-300 shrink-0">
                <img :src="img" class="w-full h-full object-cover" />
                <button 
                  type="button"
                  @click="removePendingImage(pIdx)" 
                  class="absolute top-1 right-1 bg-slate-900/80 hover:bg-red-600 text-white rounded-full p-0.5 transition-colors"
                >
                  <X class="w-3 h-3" />
                </button>
              </div>
            </div>

            <!-- Input row: Clip button + Textarea + Send button -->
            <div class="flex items-end gap-2">
              <!-- Paperclip / Image Attachment Button -->
              <label 
                class="cursor-pointer p-2.5 text-slate-400 hover:text-emerald-600 hover:bg-slate-200/60 rounded-full transition-colors flex items-center justify-center shrink-0 mb-0.5" 
                title="ছবি আপলোড করুন (Attach photo)"
              >
                <Paperclip class="w-5 h-5" />
                <input type="file" accept="image/*" multiple @change="handleFileUpload" class="hidden" />
              </label>

              <!-- Growing Textarea -->
              <textarea 
                v-model="inputMessage" 
                @keydown.enter.exact.prevent="sendMessage"
                rows="1"
                placeholder="প্রোডাক্টের বিবরণ লিখুন বা ছবি যুক্ত করুন..." 
                class="flex-1 max-h-32 min-h-[38px] py-2 px-1 text-xs sm:text-sm bg-transparent border-0 focus:outline-none resize-none placeholder:text-slate-400 text-slate-800 font-medium"
                :disabled="isAiTyping || isGeneratingStore"
              ></textarea>

              <!-- Send Button -->
              <button 
                type="submit" 
                :disabled="(!inputMessage.trim() && pendingImages.length === 0) || isAiTyping || isGeneratingStore"
                class="p-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-full font-bold transition-all flex items-center justify-center shadow-sm active:scale-95 shrink-0 mb-0.5"
              >
                <Send class="w-4 h-4" />
              </button>
            </div>
          </form>
          <div class="text-[11px] text-slate-400 text-center mt-2 font-medium">
            Shift + Enter দিয়ে নতুন লাইন লিখুন। ছবি যুক্ত করতে ক্লিপ বাটনে চাপ দিন।
          </div>
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

// Pre-send images attached to current prompt
const pendingImages = ref([])
// All images collected throughout the chat
const allUploadedImages = ref([])

const messages = ref([
  {
    role: 'model',
    content: `আসসালামু আলাইকুম! আমি আপনার DokanAI সহকারী।\nআপনার সিঙ্গেল প্রোডাক্টটি কি এবং কত টাকায় অফারে বিক্রি করতে চান? প্রোডাক্টের ছবি যুক্ত করতে পারেন বা লিখে জানাতে পারেন!`
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

  // Push user message with any attached images (like ChatGPT/Gemini)
  messages.value.push({ 
    role: 'user', 
    content: text || 'প্রোডাক্টের ছবি যুক্ত করেছি',
    images: attached
  })

  // Add to global store image repository
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
        userMessage: text || 'আমি প্রোডাক্টের ছবি আপলোড করেছি'
      }
    })

    if (res && res.reply) {
      if (res.extractedData) {
        if (res.extractedData.product_title) {
          extractedData.product_title = res.extractedData.product_title
        }
        if (res.extractedData.price) {
          extractedData.price = res.extractedData.price
          extractedData.regular_price = res.extractedData.regular_price || Math.round(res.extractedData.price * 1.4)
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
      content: `আসসালামু আলাইকুম! আমি আপনার DokanAI সহকারী। আপনার প্রোডাক্টের বিবরণ দিন বা ছবি যুক্ত করুন!`
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
  scrollToBottom()
})
</script>

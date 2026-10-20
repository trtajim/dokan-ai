<template>
  <div class="min-h-screen bg-slate-50 flex flex-col">
    <Navbar />

    <main class="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col">
      <!-- Top Title -->
      <div class="mb-4 text-center">
        <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles class="w-3.5 h-3.5 text-emerald-600" />
          <span>Interactive AI Store Agent</span>
        </div>
        <h1 class="text-2xl sm:text-3xl font-black text-slate-900">
          প্রোডাক্টের বিবরণ দিন — AI বানিয়ে দেবে সম্পূর্ণ দোকান
        </h1>
        <p class="text-xs sm:text-sm text-slate-500 mt-1 max-w-lg mx-auto">
          AI সহকারীর সাথে কথা বলুন, ছবি যোগ করুন বা আপলোড করুন। সব তথ্য ঠিক থাকলে চ্যাটের ভেতর থেকেই দোকান চালু করতে পারবেন।
        </p>
      </div>

      <!-- Main Conversational Interface Container -->
      <div class="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden flex flex-col flex-1 h-[650px]">
        
        <!-- Chat Header Bar -->
        <div class="p-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-500/20">
              <Bot class="w-5 h-5" />
            </div>
            <div>
              <h3 class="text-sm font-bold text-slate-900">DokanAI সহকারী</h3>
              <span class="inline-flex items-center gap-1.5 text-[11px] text-emerald-600 font-semibold">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> অনলাইন
              </span>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <button 
              type="button" 
              @click="showCustomDetails = !showCustomDetails" 
              class="px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5"
              :class="showCustomDetails ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'"
            >
              <Settings2 class="w-3.5 h-3.5" />
              <span>ডিটেইলস / ছবি ({{ uploadedImages.length }})</span>
            </button>
            <button @click="resetChat" class="text-xs text-slate-400 hover:text-slate-600 p-1">
              রিসেট
            </button>
          </div>
        </div>

        <!-- Optional Collapsible Details & Multi-Image Drawer -->
        <div v-if="showCustomDetails" class="p-4 bg-slate-50 border-b border-slate-200/80 animate-in slide-in-from-top-2 duration-200 space-y-3 text-xs">
          <div class="flex items-center justify-between">
            <span class="font-bold text-slate-800">অতিরিক্ত কনফিগারেশন ও প্রোডাক্টের ছবি:</span>
            <button @click="showCustomDetails = false" class="text-slate-400 hover:text-slate-600">✕ বন্ধ করুন</button>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label class="block font-bold text-slate-600 mb-1">ঢাকার ভেতরে ডেলিভারি চার্জ (৳):</label>
              <input v-model.number="extractedData.delivery_fee_inside" type="number" class="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-bold" />
            </div>
            <div>
              <label class="block font-bold text-slate-600 mb-1">ঢাকার বাইরে ডেলিভারি চার্জ (৳):</label>
              <input v-model.number="extractedData.delivery_fee_outside" type="number" class="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-bold" />
            </div>
            <div>
              <label class="block font-bold text-slate-600 mb-1">স্টোরের থিম কালার:</label>
              <select v-model="extractedData.theme_color" class="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-bold">
                <option value="emerald">Emerald (সবুজ)</option>
                <option value="indigo">Indigo (নীল)</option>
                <option value="rose">Rose (গোলাপি)</option>
                <option value="amber">Amber (কমলা)</option>
              </select>
            </div>
          </div>

          <!-- Multi-Image Upload & Preview -->
          <div>
            <label class="block font-bold text-slate-600 mb-1.5">প্রোডাক্টের ছবি আপলোড করুন বা লিংক দিন:</label>
            <div class="flex items-center gap-2">
              <label class="cursor-pointer px-3 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl hover:bg-emerald-100 font-bold flex items-center gap-1.5">
                <Upload class="w-4 h-4" />
                <span>কম্পিউটার/মোবাইল থেকে ছবি সিলেক্ট করুন</span>
                <input type="file" accept="image/*" multiple @change="handleFileUpload" class="hidden" />
              </label>
            </div>

            <!-- Uploaded Image Thumbs -->
            <div v-if="uploadedImages.length > 0" class="flex items-center gap-2 mt-2 overflow-x-auto py-1">
              <div v-for="(img, iIdx) in uploadedImages" :key="iIdx" class="relative group w-14 h-14 rounded-xl overflow-hidden border border-slate-300 shrink-0">
                <img :src="img" class="w-full h-full object-cover" />
                <button @click="removeImage(iIdx)" class="absolute top-0.5 right-0.5 bg-red-600 text-white rounded-full p-0.5 opacity-90 hover:opacity-100">
                  <X class="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Scrollable Messages Feed -->
        <div ref="chatScrollContainer" class="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
          
          <div v-for="(msg, idx) in messages" :key="idx" class="flex flex-col" :class="msg.role === 'user' ? 'items-end' : 'items-start'">
            <div 
              class="max-w-[85%] sm:max-w-[75%] rounded-3xl px-4 sm:px-5 py-3 sm:py-3.5 text-xs sm:text-sm leading-relaxed"
              :class="msg.role === 'user' 
                ? 'bg-emerald-600 text-white rounded-br-none shadow-md shadow-emerald-600/10' 
                : 'bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200/50'"
            >
              <p class="whitespace-pre-line">{{ msg.content }}</p>

              <!-- IN-CHAT ACTION TRIGGER BUTTON -->
              <div v-if="msg.readyToGenerate" class="mt-4 pt-3 border-t border-slate-200/60 animate-in fade-in zoom-in-95 duration-200">
                <div class="p-3 bg-white rounded-2xl border border-emerald-200 shadow-sm space-y-2 text-slate-800">
                  <div class="flex items-center gap-2 text-emerald-700 font-bold text-xs">
                    <CheckCircle2 class="w-4 h-4 text-emerald-600" />
                    <span>সব প্রয়োজনীয় তথ্য সংগ্রহ সম্পন্ন হয়েছে!</span>
                  </div>
                  <div class="text-[11px] text-slate-500 font-semibold space-y-0.5">
                    <div>📦 প্রোডাক্ট: <strong>{{ extractedData.product_title || 'এক্সক্লুসিভ কালেকশন' }}</strong></div>
                    <div>💰 অফার মূল্য: <strong>৳{{ extractedData.price || 1200 }}</strong> (আগে ছিল: ৳{{ extractedData.regular_price || 1800 }})</div>
                    <div>🚚 ডেলিভারি চার্জ: <strong>ঢাকার ভেতরে ৳{{ extractedData.delivery_fee_inside }} | বাইরে ৳{{ extractedData.delivery_fee_outside }}</strong></div>
                    <div>🖼️ ছবি: <strong>{{ uploadedImages.length }} টি যুক্ত আছে</strong></div>
                  </div>

                  <button 
                    @click="generateFullStore" 
                    :disabled="isGeneratingStore"
                    class="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 text-xs sm:text-sm mt-2"
                  >
                    <Loader2 v-if="isGeneratingStore" class="w-4 h-4 animate-spin" />
                    <Sparkles v-else class="w-4 h-4" />
                    <span>{{ isGeneratingStore ? 'দোকান তৈরি হচ্ছে (কয়েক সেকেন্ড সময় লাগবে)...' : 'দোকানটি তৈরি করুন (Click to Launch Store)' }}</span>
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

        <!-- Chat Input Bar -->
        <div class="p-3 sm:p-4 border-t border-slate-100 bg-white">
          <form @submit.prevent="sendMessage" class="flex items-center gap-2">
            <input 
              v-model="inputMessage" 
              type="text" 
              placeholder="যেমন: আমি সুন্দরবনের খাঁটি মধু বিক্রি করতে চাই ১০০০ টাকায়..." 
              class="flex-1 px-4 py-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-400"
              :disabled="isAiTyping || isGeneratingStore"
            />
            <button 
              type="submit" 
              :disabled="!inputMessage.trim() || isAiTyping || isGeneratingStore"
              class="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-2xl font-bold transition-all flex items-center justify-center shadow-md shadow-emerald-600/20 active:scale-95"
            >
              <Send class="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, nextTick, onMounted } from 'vue'
import { Sparkles, Bot, Send, Loader2, CheckCircle2, Settings2, Upload, X } from 'lucide-vue-next'
import { useAuth } from '~/composables/useAuth'

const router = useRouter()
const { currentUser, initAuth } = useAuth()

const chatScrollContainer = ref(null)
const isAiTyping = ref(false)
const isGeneratingStore = ref(false)
const inputMessage = ref('')
const showCustomDetails = ref(false)

const uploadedImages = ref([
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'
])

const messages = ref([
  {
    role: 'model',
    content: `আসসালামু আলাইকুম! আমি আপনার DokanAI সহকারী।\nআপনার সিঙ্গেল প্রোডাক্টটি কি এবং কত টাকায় অফারে বিক্রি করতে চান? লিখে জানান, আমি এখনই কথা বলে আপনার ক্যাশ অন ডেলিভারি স্টোর তৈরি করে দেব!`
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
        uploadedImages.value.push(uploadEvent.target.result)
      }
    }
    reader.readAsDataURL(files[i])
  }
}

const removeImage = (index) => {
  uploadedImages.value.splice(index, 1)
}

const sendMessage = async () => {
  const text = inputMessage.value.trim()
  if (!text) return

  messages.value.push({ role: 'user', content: text })
  inputMessage.value = ''
  scrollToBottom()

  isAiTyping.value = true

  try {
    const res = await $fetch('/api/ai/onboard', {
      method: 'POST',
      body: {
        messages: messages.value,
        userMessage: text
      }
    })

    if (res && res.reply) {
      if (res.extractedData) {
        if (res.extractedData.product_title && !extractedData.product_title) {
          extractedData.product_title = res.extractedData.product_title
        }
        if (res.extractedData.price && !extractedData.price) {
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
      content: 'আমি আপনার তথ্য বুঝতে পেরেছি। স্টোর তৈরি করতে চাইলে নিচে বাটন চাপুন।',
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
        product_title: extractedData.product_title || 'স্পেশাল প্রোডাক্ট',
        price: extractedData.price || 999,
        regular_price: extractedData.regular_price || 1400,
        delivery_fee_inside: extractedData.delivery_fee_inside || 70,
        delivery_fee_outside: extractedData.delivery_fee_outside || 130,
        images: uploadedImages.value,
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
      content: `আসসালামু আলাইকুম! আমি আপনার DokanAI সহকারী। আপনার প্রোডাক্টের বিবরণ দিন!`
    }
  ]
  extractedData.product_title = ''
  extractedData.price = null
  extractedData.regular_price = null
}

onMounted(() => {
  initAuth()
  scrollToBottom()
})
</script>

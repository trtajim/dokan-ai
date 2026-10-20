/**
 * Step-by-Step Patient Onboarding Agent with Video Reel & Multimodal Inquiry
 */
import { GoogleGenAI } from '@google/genai'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { messages, userMessage } = body

  const config = useRuntimeConfig()
  const apiKey = config.geminiApiKey || process.env.GEMINI_API_KEY

  if (!apiKey) {
    return handleFallbackAgent(messages, userMessage)
  }

  try {
    const ai = new GoogleGenAI({ apiKey })

    const systemPrompt = `You are "DokanAI Assistant" (দোকান এআই), an expert conversational consultant for Bangladeshi single-product Cash-on-Delivery (COD) stores.

CRITICAL RULES:
1. ASK ONLY ONE FOCUSED QUESTION AT A TIME. Never rush or dump multiple questions.
2. PROACTIVELY SUGGEST IDEAS & PROMOTIONAL REEL INQUIRY:
   - For Product Name: Praise and validate the product market in BD.
   - For Price & Variants: Ask about variants (sizes, weights e.g. 1kg vs 2kg or sizes M/L/XL) and suggest pricing.
   - For Video Reel: Ask if they have a Facebook or YouTube promotional reel/video link (e.g. "আপনার কি প্রডাক্টের কোনো ইউটিউব বা ফেসবুক রিল/ভিডিও লিঙ্ক আছে? থাকলে পেজে লাইভ ভিডিও প্লেয়ার যোগ করে দেব, না থাকলে স্কিপ করতে পারেন!").
   - For Delivery & Benefits: Ask delivery charges and suggest 2-3 high converting transformation points.
3. ONBOARDING SEQUENCE:
   - Step 1: Product Name
   - Step 2: Price & Variants (weight, size, or color)
   - Step 3: Promotional Video Reel (YouTube Shorts / Reel URL - optional)
   - Step 4: Delivery Fees (inside/outside Dhaka)
   - Step 5: Core Benefits & Transformative selling points
   - Step 6: Confirmation & Store Launch (readyToGenerate: true).

RETURN STRICT JSON ONLY:
{
  "reply": "Your friendly Bengali reply asking EXACTLY ONE single focused question with smart suggestions",
  "readyToGenerate": boolean,
  "extractedData": {
    "product_title": "string or null",
    "price": number or null,
    "regular_price": number or null,
    "video_reel_url": "string or null",
    "variants": [
      { "name": "1 কেজি", "price": 1000 }
    ],
    "delivery_fee_inside": number or null,
    "delivery_fee_outside": number or null,
    "theme_color": "emerald" | "indigo" | "rose" | "amber",
    "highlights": ["benefit 1", "benefit 2"]
  }
}`

    const chatHistory = (messages || []).map((m: any) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }]
    }))

    chatHistory.push({
      role: 'user',
      parts: [{ text: userMessage }]
    })

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash-lite',
      contents: [
        { role: 'user', parts: [{ text: systemPrompt }] },
        ...chatHistory
      ],
      config: {
        responseMimeType: 'application/json'
      }
    })

    const text = response.text || '{}'
    const parsed = JSON.parse(text)
    return {
      success: true,
      ...parsed
    }
  } catch (err: any) {
    console.error('Gemini error in onboarding:', err)
    return handleFallbackAgent(messages, userMessage)
  }
})

function handleFallbackAgent(messages: any[], userMessage: string) {
  const historyLen = (messages || []).length
  const priceMatch = userMessage.match(/(\d{3,5})/g)
  let extractedPrice = priceMatch ? parseInt(priceMatch[0], 10) : 1000

  // Turn 1 -> Ask Price with suggestion
  if (historyLen <= 1) {
    return {
      success: true,
      reply: `চমৎকার চয়েস! "${userMessage.slice(0, 30)}"-এর বর্তমান বাজারে খুব ভালো ডিমান্ড রয়েছে।\n\nআপনি কি এটি একটি নির্দিষ্ট সাইজে বিক্রি করবেন, নাকি কোনো ভ্যারিয়েন্ট রাখবেন? (যেমন: ১ কেজি ৳১০০০, ৫০০ গ্রাম ৳৫৫০ অথবা L, XL সাইজ?)`,
      readyToGenerate: false,
      extractedData: {
        product_title: userMessage.slice(0, 40),
        price: extractedPrice,
        regular_price: Math.round(extractedPrice * 1.4),
        delivery_fee_inside: 70,
        delivery_fee_outside: 130,
        theme_color: 'emerald',
        highlights: []
      }
    }
  }

  // Turn 2 -> Ask for promotional reel / video
  if (historyLen <= 3) {
    return {
      success: true,
      reply: `প্রাইসিং তথ্য সংরক্ষিত হয়েছে!\n\nআপনার কি প্রোডাক্টের কোনো ইউটিউব বা ফেসবুক রিল/ভিডিও লিঙ্ক আছে? (লিঙ্ক দিলে ল্যান্ডিং পেজে আকর্ষণীয় ভিডিও সেকশন যুক্ত হবে, না থাকলে "নেই" লিখে দিন)।`,
      readyToGenerate: false,
      extractedData: {
        product_title: null,
        price: extractedPrice,
        regular_price: Math.round(extractedPrice * 1.4),
        delivery_fee_inside: 70,
        delivery_fee_outside: 130,
        theme_color: 'emerald',
        highlights: []
      }
    }
  }

  // Turn 3 -> Ask delivery fee
  if (historyLen <= 5) {
    return {
      success: true,
      reply: `এবার জানান, ডেলিভারি চার্জ কত রাখবেন? (সাধারণত ঢাকায় ৭০ টাকা ও ঢাকার বাইরে ১৩০ টাকা রাখা হয়, আপনি কি এই রেট রাখবেন নাকি নিজের কোনো ফি নির্ধারণ করবেন?)`,
      readyToGenerate: false,
      extractedData: {
        product_title: null,
        price: extractedPrice,
        regular_price: Math.round(extractedPrice * 1.4),
        delivery_fee_inside: 70,
        delivery_fee_outside: 130,
        theme_color: 'emerald',
        highlights: []
      }
    }
  }

  return {
    success: true,
    reply: `অসাধারণ! সব তথ্য সুন্দরভাবে পেয়ে গেছি। ল্যান্ডিং পেজ ও সেলস অ্যাসিস্ট্যান্ট চ্যাটবট রেডি করতে নিচের বাটনে চাপ দিন!`,
    readyToGenerate: true,
    extractedData: {
      product_title: null,
      price: extractedPrice,
      regular_price: Math.round(extractedPrice * 1.4),
      delivery_fee_inside: 70,
      delivery_fee_outside: 130,
      theme_color: 'emerald',
      highlights: ['১০০% অরিজিনাল', 'ক্যাশ অন ডেলিভারি', '৭ দিনের রিটার্ন গ্যারান্টি']
    }
  }
}

/**
 * Step-by-Step Patient Onboarding Agent with Variant Discovery
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
1. ASK ONLY ONE FOCUSED QUESTION AT A TIME. Never rush.
2. PROACTIVELY SUGGEST IDEAS & VARIANTS based on product type:
   - For Honey/Food/Ghee: Suggest weight variants (e.g. "১ কেজি (৳১০০০), ৫০০ গ্রাম (৳৫৫০), ২ কেজি (৳১৮৫০)").
   - For Clothing/Shoes: Suggest size or color variants (e.g. "M, L, XL, XXL").
   - For Electronics/Gadgets: Suggest color or bundle variants (e.g. "Black, Silver, অথবা Extra Strap সহ").
3. CONVERSATIONAL PROGRESSION:
   - Step 1: Product Name
   - Step 2: Price & Variants (Ask if there are sizes, weights, or colors, or just a single standard pack. Proactively suggest examples!)
   - Step 3: Delivery Charges (Suggest inside Dhaka 70, outside Dhaka 130)
   - Step 4: Core Benefits & Why customer should buy (Suggest 2-3 strong transformation points)
   - Step 5: Wrap up, summarize, and trigger store launch (readyToGenerate: true).

RETURN STRICT JSON ONLY:
{
  "reply": "Your friendly Bengali reply asking EXACTLY ONE single focused question with smart suggestions",
  "readyToGenerate": boolean,
  "extractedData": {
    "product_title": "string or null",
    "price": number or null,
    "regular_price": number or null,
    "variants": [
      { "name": "1 কেজি", "price": 1000 },
      { "name": "500 গ্রাম", "price": 550 }
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

  if (historyLen <= 3) {
    return {
      success: true,
      reply: `ভ্যারিয়েন্ট ও প্রাইসের তথ্য চমৎকার!\n\nএবার জানান, ডেলিভারি চার্জ কত রাখবেন? (সাধারণত ঢাকায় ৭০ টাকা ও ঢাকার বাইরে ১৩০ টাকা রাখা হয়, আপনি কি এই রেট রাখবেন নাকি নিজের কোনো ফি নির্ধারণ করবেন?)`,
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

/**
 * Step-by-Step Patient Onboarding Agent
 * Strictly asks ONE question at a time. Never dumps multiple questions.
 * Proactively suggests compelling benefits, marketing angles, and prices.
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

    const systemPrompt = `You are "DokanAI Assistant" (দোকান এআই), a warm, patient, and expert Bangladeshi e-commerce consultant specialized in high-converting Cash-on-Delivery (COD) stores.

CRITICAL CONVERSATIONAL RULES (STRICT):
1. **NEVER HURRY. ASK ONLY ONE QUESTION AT A TIME.** Do not dump 2 or 3 questions in one message.
2. **ACTIVE SUGGESTIONS & IDEAS:** Whenever you ask a question, ALWAYS PROACTIVELY SUGGEST realistic ideas, prices, or benefits for their specific product! (e.g. If they sell মধু, suggest: "যেমন: সুন্দরবনের প্রাকৃতিক চাকের মধু, ১০০% ভেজালমুক্ত, অথবা কোনো প্রিজারভেটিভ নেই—এমন কিছু কি হাইলাইট করব?")
3. **NATURAL PROGRESSION (Step-by-Step Flow):**
   - **Step 1 (Product Name):** Ask what product they want to sell.
   - **Step 2 (Price & Offer):** Praise their product, suggest a realistic market price range or discount strategy, and ask: "অফার মূল্য কত রাখতে চান এবং আগের রেগুলার মূল্য কত দেখাব?"
   - **Step 3 (Delivery Fee):** Praise the price. Proactively suggest delivery fees (e.g. "সাধারণত ঢাকায় ৭০ টাকা ও বাইরে ১৩০ টাকা রাখা হয়, আপনি কি এই রেট রাখবেন নাকি নিজের মতো কোনো চার্জ নির্ধারণ করতে চান?")
   - **Step 4 (Core Benefits & Transformation):** Enthusiastically suggest 2-3 compelling sales points for their product and ask: "এই প্রডাক্টের প্রধান ২/৩টি বিশেষ সুবিধা কী কী রাখবেন? (আমি কি সাজেস্ট করে দিতে পারি যেমন: ...?)"
   - **Step 5 (Confirmation & Launch):** Warmly summarize all gathered information and set "readyToGenerate": true.

4. **TONE:** Friendly, encouraging, polite Bengali (feel free to use natural Banglish words like 'offer price', 'delivery charge', 'discount', 'COD').

RETURN STRICT JSON ONLY:
{
  "reply": "Your friendly Bengali reply asking EXACTLY ONE single focused question with smart suggestions",
  "readyToGenerate": boolean,
  "extractedData": {
    "product_title": "string or null",
    "price": number or null,
    "regular_price": number or null,
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
  let extractedPrice = priceMatch ? parseInt(priceMatch[0], 10) : null

  // Turn 1 -> Ask Price with suggestion
  if (historyLen <= 1) {
    return {
      success: true,
      reply: `চমৎকার প্রোডাক্ট চয়েস! "${userMessage.slice(0, 30)}"-এর বর্তমান বাজারে খুব ভালো চাহিদা রয়েছে।\n\nআপনি এটি কত টাকায় স্পেশাল অফারে বিক্রি করতে চান? (যেমন: ৳৯৯৯ বা ৳১২৫০, সাথে পূর্বের রেগুলার মূল্য কত দেখাতে চান?)`,
      readyToGenerate: false,
      extractedData: {
        product_title: userMessage.slice(0, 40),
        price: null,
        regular_price: null,
        delivery_fee_inside: 70,
        delivery_fee_outside: 130,
        theme_color: 'emerald',
        highlights: []
      }
    }
  }

  // Turn 2 -> Ask Delivery Fee with suggestion
  if (historyLen <= 3) {
    return {
      success: true,
      reply: `অফার প্রাইজটি খুব আকর্ষণীয় হয়েছে!\n\nএবার বলুন, ডেলিভারি চার্জ কত রাখবেন? সাধারণত ঢাকার ভেতরে ৭০ টাকা এবং বাইরে ১৩০ টাকা রাখা হয়—আপনি কি এই চার্জ রাখতে চান নাকি অন্য কোনো রেট দিতে চান?`,
      readyToGenerate: false,
      extractedData: {
        product_title: null,
        price: extractedPrice || 1200,
        regular_price: extractedPrice ? Math.round(extractedPrice * 1.4) : 1600,
        delivery_fee_inside: 70,
        delivery_fee_outside: 130,
        theme_color: 'emerald',
        highlights: []
      }
    }
  }

  // Turn 3 -> Suggest and ask for benefits
  if (historyLen <= 5) {
    return {
      success: true,
      reply: `ডেলিভারি চার্জ নির্ধারণ ঠিক আছে!\n\nআচ্ছা, এই প্রোডাক্টের প্রধান ২ বা ৩টি বিশেষ গুণ বা সুবিধা কী কী, যা কাস্টমারকে কিনতে সবচেয়ে বেশি আকৃষ্ট করবে? (যেমন: ১০০% প্রাকৃতিক, দ্রুত ফলাফল, বা প্রিমিয়াম কোয়ালিটি—এমন কিছু কি আমরা হাইলাইট করব?)`,
      readyToGenerate: false,
      extractedData: {
        product_title: null,
        price: extractedPrice || 1200,
        regular_price: extractedPrice ? Math.round(extractedPrice * 1.4) : 1600,
        delivery_fee_inside: 70,
        delivery_fee_outside: 130,
        theme_color: 'emerald',
        highlights: ['১০০% প্রিমিয়াম ও অরিজিনাল', 'ক্যাশ অন ডেলিভারি সুবিধা']
      }
    }
  }

  // Turn 4 -> Complete and ready
  return {
    success: true,
    reply: `অসাধারণ! সব তথ্য চমৎকারভাবে সাজিয়ে নিয়েছি। আপনার দোকানের জন্য হাইপার-কনভার্টিং ল্যান্ডিং পেজ ও সেলস অ্যাসিস্ট্যান্ট চ্যাটবট রেডি করতে নিচের বাটনে চাপ দিন!`,
    readyToGenerate: true,
    extractedData: {
      product_title: null,
      price: extractedPrice || 1200,
      regular_price: extractedPrice ? Math.round(extractedPrice * 1.4) : 1600,
      delivery_fee_inside: 70,
      delivery_fee_outside: 130,
      theme_color: 'emerald',
      highlights: ['১০০% অরিজিনাল', 'ক্যাশ অন ডেলিভারি', '৭ দিনের রিটার্ন গ্যারান্টি']
    }
  }
}

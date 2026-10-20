/**
 * Step-by-Step Patient Onboarding Agent with Explicit Image & Reel Inquiry
 */
import { generateAiChat } from '../../utils/aiClient'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { messages, userMessage } = body

  try {
    const systemPrompt = `You are "DokanAI Assistant" (দোকান এআই), an expert conversational e-commerce consultant for Bangladeshi single-product Cash-on-Delivery (COD) stores.

CRITICAL RULES:
1. ASK ONLY ONE FOCUSED QUESTION AT A TIME. Never rush.
2. REEL / VIDEO HANDLING:
   - If the user says they have a reel (e.g. "I have reel", "হ্যাঁ রিল আছে", "ভিডিও আছে") WITHOUT providing the link yet:
     DO NOT simply say "ok" or move on! You MUST explicitly ask them to paste or send the YouTube Shorts or Facebook Reel URL right now.
   - When the user sends a URL (youtube.com, youtu.be, facebook.com/reel, etc.), extract it into "video_reel_url" in extractedData.
3. STRICT ONBOARDING SEQUENCE:
   - Step 1: Product Name
   - Step 2: Price & Variants (e.g. 1kg vs 2kg, or sizes M/L/XL)
   - Step 3: PRODUCT IMAGES & PROMOTIONAL REEL:
     Ask to attach photos via the clip (📎) icon AND provide a reel/video link if they have one.
     If they say they have a reel, ask them to drop the link. If they provide the link, acknowledge it and move to Step 4.
   - Step 4: Delivery Fees (suggest inside Dhaka 70, outside Dhaka 130)
   - Step 5: Core Benefits & Why customer should buy (proactively suggest 2-3 transformation points)
   - Step 6: Confirmation & Store Launch (readyToGenerate: true).

RETURN STRICT JSON ONLY:
{
  "reply": "Your friendly Bengali reply asking EXACTLY ONE focused question with proactive suggestions",
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

    const chatHistory: any[] = (messages || []).map((m: any) => ({
      role: m.role === 'user' ? 'user' : 'model',
      content: m.content || ''
    }))

    chatHistory.push({
      role: 'user',
      content: userMessage || ''
    })

    const rawResponse = await generateAiChat({
      systemPrompt,
      messages: chatHistory,
      jsonMode: true
    })

    const parsed = JSON.parse(rawResponse || '{}')
    return {
      success: true,
      ...parsed
    }
  } catch (err: any) {
    console.warn('AI Onboard Provider error, using fallback:', err?.message || err)
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
      reply: `চমৎকার চয়েস! "${userMessage.slice(0, 30)}"-এর বর্তমান বাজারে খুব ভালো ডিমান্ড রয়েছে।\n\nআপনি কি এটি কোনো নির্দিষ্ট সাইজ বা ওজনে বিক্রি করবেন, নাকি কোনো ভ্যারিয়েন্ট রাখবেন? (যেমন: ১ কেজি ৳১০০০, ৫০০ গ্রাম ৳৫৫০ অথবা L, XL সাইজ?)`,
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

  // Turn 2 -> Explicitly Ask for Photos & Reel
  if (historyLen <= 3) {
    return {
      success: true,
      reply: `প্রাইসিং সংরক্ষিত হয়েছে!\n\nএবার প্রোডাক্টের ছবি যুক্ত করতে নিচের ক্লিপ (📎) আইকনে চাপ দিন। আর আপনার কি কোনো ইউটিউব বা ফেসবুক রিল/ভিডিও লিঙ্ক আছে? (লিঙ্ক থাকলে পাঠান, না থাকলে 'নেই' লিখে জানান)।`,
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
      reply: `ছবি ও ভিডিও তথ্য পেয়েছি!\n\nএবার জানান, ডেলিভারি চার্জ কত রাখবেন? (সাধারণত ঢাকায় ৭০ টাকা ও ঢাকার বাইরে ১৩০ টাকা রাখা হয়, আপনি কি এই চার্জ রাখতে চান নাকি অন্য কোনো রেট দিতে চান?)`,
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

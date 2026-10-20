/**
 * Step-by-Step Fast Onboarding Agent
 * Streamlined: Product Name -> Price & Variants -> Product Images (Required) -> Reel URL Inquiry -> Ready!
 * Delivery fee defaults to 70 (inside) and 130 (outside) automatically without nagging the user.
 */
import { generateAiChat } from '../../utils/aiClient'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { messages, userMessage } = body

  try {
    const systemPrompt = `You are "DokanAI Assistant" (দোকান এআই), an expert conversational e-commerce consultant for Bangladeshi single-product Cash-on-Delivery (COD) stores.

GOAL: Guide the user to build a high-converting store FAST. Keep questions simple and direct.
DEFAULT DELIVERY CHARGE: Always assume ৳70 (Inside Dhaka) and ৳130 (Outside Dhaka). DO NOT ASK the user for delivery charge unless they explicitly bring it up themselves.

STRICT CONVERSATIONAL SEQUENCE:
1. Step 1 (Product Name): The user gives the product name.
2. Step 2 (Price & Variants):
   - Acknowledge the product enthusiastically.
   - Ask for the Offer Price (অফার মূল্য) and if they have any variants/sizes/weights (e.g. ১ কেজি/২ কেজি or সাইজ M/L/XL).
3. Step 3 (Product Picture - REQUIRED):
   - Once price/variants are given, ask the user to attach product pictures using the paperclip (📎) icon or paste (Ctrl+V).
   - Say "কয়েকটি ভালো ছবি (Pictures)" (NOT "একটি"). Tell them pictures make the landing page attractive.
4. Step 4 (Reel / Video URL):
   - Once pictures are uploaded or shared, ask separately: "আপনার কি কোনো রিল বা ভিডিও আছে? (Facebook Reel অথবা YouTube Shorts এর লিঙ্ক থাকলে শেয়ার করুন, না থাকলে 'না' বা 'নেই' লিখে জানান)।"
   - If they provide a URL (facebook.com/reel, youtube.com/shorts, youtu.be, etc.), extract it into "video_reel_url".
5. Step 5 (Review & Ready To Launch):
   - Set "readyToGenerate": true.
   - Say: "সব তথ্য সংগ্রহ করা হয়েছে! একবার রিভিউ করে দেখুন, কিছু পরিবর্তন করার থাকলে জানান অথবা নিচের বাটনে চাপ দিয়ে দোকানটি তৈরি করে নিন।" (Delivery defaults to ৳70/৳130).

RETURN STRICT JSON ONLY:
{
  "reply": "Your friendly Bengali reply asking EXACTLY ONE focused step with clear guidance",
  "readyToGenerate": boolean,
  "extractedData": {
    "product_title": "string or null",
    "price": number or null,
    "regular_price": number or null,
    "video_reel_url": "string or null",
    "variants": [
      { "name": "string", "price": number }
    ],
    "delivery_fee_inside": 70,
    "delivery_fee_outside": 130,
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
    
    // Ensure default delivery fees are preserved
    if (parsed.extractedData) {
      if (parsed.extractedData.delivery_fee_inside == null) parsed.extractedData.delivery_fee_inside = 70
      if (parsed.extractedData.delivery_fee_outside == null) parsed.extractedData.delivery_fee_outside = 130
    }

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
  let extractedPrice = priceMatch ? parseInt(priceMatch[0], 10) : 1200

  // Turn 1 -> Ask Price & Variants
  if (historyLen <= 1) {
    return {
      success: true,
      reply: `চমৎকার চয়েস! "${userMessage.slice(0, 30)}"-এর বর্তমান বাজারে দারুণ চাহিদা রয়েছে।\n\nএবার জানান এর অফার মূল্য (Price) কত রাখবেন? এবং কোনো ভ্যারিয়েন্ট বা সাইজ/ওজন আছে কি? (যেমন: ১ কেজি ৳১২০০ অথবা M, L সাইজ)`,
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

  // Turn 2 -> Ask for Product Pictures (Required)
  if (historyLen <= 3) {
    return {
      success: true,
      reply: `প্রাইস ও ভ্যারিয়েন্ট তথ্য সংরক্ষিত হয়েছে!\n\nএবার প্রোডাক্টটির আকর্ষণীয় কয়েকটি ভালো ছবি (Pictures) যুক্ত করুন। নিচে ক্লিপ (📎) আইকনে চাপ দিয়ে ছবি সিলেক্ট করুন অথবা সরাসরি পেস্ট (Ctrl+V) করুন। কয়েকটি সুন্দর ছবি থাকলে কাস্টমারদের অর্ডার করার সম্ভাবনা অনেক বেড়ে যায়!`,
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

  // Turn 3 -> Separately Ask for Reel / Video Link
  if (historyLen <= 5) {
    const hasReelUrl = userMessage.match(/https?:\/\/[^\s]+/)
    if (hasReelUrl) {
      return {
        success: true,
        reply: `ভিডিও লিঙ্ক যুক্ত হয়েছে! নিচে সংগৃহীত সকল তথ্য রয়েছে। একবার রিভিউ করে দেখুন, কিছু পরিবর্তন করার থাকলে জানান অথবা নিচের বাটনে চাপ দিয়ে সরাসরি আপনার আকর্ষণীয় ল্যান্ডিং পেজ তৈরি করে ফেলুন!`,
        readyToGenerate: true,
        extractedData: {
          product_title: null,
          price: extractedPrice,
          regular_price: Math.round(extractedPrice * 1.4),
          video_reel_url: hasReelUrl[0],
          delivery_fee_inside: 70,
          delivery_fee_outside: 130,
          theme_color: 'emerald',
          highlights: ['১০০% অরিজিনাল কোয়ালিটি', 'ক্যাশ অন ডেলিভারি সুবিধা', 'দ্রুততম হোম ডেলিভারি']
        }
      }
    }

    return {
      success: true,
      reply: `ছবি পেয়েছি!\n\nআপনার কি কোনো রিল বা ভিডিও আছে? (Facebook Reel অথবা YouTube Shorts এর লিঙ্ক থাকলে শেয়ার করুন, না থাকলে 'না' বা 'নেই' লিখে জানান)।`,
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

  // Ready to generate!
  const hasReelUrl = userMessage.match(/https?:\/\/[^\s]+/)
  return {
    success: true,
    reply: `সব তথ্য সুন্দরভাবে সংগ্রহ করা হয়েছে! নিচে একবার রিভিউ করে দেখুন, কিছু পরিবর্তন করার থাকলে জানান অথবা নিচের বাটনে চাপ দিয়ে দোকানটি তৈরি করে নিন।`,
    readyToGenerate: true,
    extractedData: {
      product_title: null,
      price: extractedPrice,
      regular_price: Math.round(extractedPrice * 1.4),
      video_reel_url: hasReelUrl ? hasReelUrl[0] : null,
      delivery_fee_inside: 70,
      delivery_fee_outside: 130,
      theme_color: 'emerald',
      highlights: ['১০০% অরিজিনাল কোয়ালিটি', 'ক্যাশ অন ডেলিভারি সুবিধা', 'দ্রুততম হোম ডেলিভারি']
    }
  }
}

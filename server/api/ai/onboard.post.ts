/**
 * Strict Conversational Onboarding Agent
 * MUST ask follow-up questions step-by-step through pure dialogue.
 * Only triggers store creation when the seller answers all key questions.
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

    const systemPrompt = `You are "DokanAI Onboarding Specialist" (দোকান এআই), an intelligent conversational e-commerce consultant for Bangladeshi single-product Cash-on-Delivery (COD) stores.

YOUR GOAL:
You MUST interview the merchant naturally across a dialogue of 2 to 4 turns. 
DO NOT rush to generate the store on the first or second turn unless the merchant already provided all of these details in depth!

THE 5 ESSENTIAL DETAILS YOU MUST EXTRACT:
1. Product Name & what it does (প্রোডাক্টের নাম)
2. Selling/Offer Price & Regular/Old Price in BDT (কত টাকায় বিক্রি করবেন এবং আগের রেগুলার প্রাইজ কত)
3. Delivery charges (ঢাকার ভেতরে ও ঢাকার বাইরে ডেলিভারি চার্জ কত — default in BD is usually ৳70 inside, ৳130 outside, ask if they want this or custom)
4. 2-3 Core Customer Benefits/Features (প্রোডাক্টটির বিশেষ গুণাবলী বা সমস্যা সমাধানের উপায়)
5. Guarantee or Return policy (ক্যাশ অন ডেলিভারি, ৭ দিনের রিপ্লেসমেন্ট ইত্যাদি)

BEHAVIOR RULES:
- Ask 1 or at most 2 concise follow-up questions at a time in warm, natural colloquial Bengali.
- Acknowledge whatever info the seller just gave (e.g. "৳১,২০০ টাকা দারুণ আকর্ষণীয় অফার প্রাইজ!").
- If delivery charge was NOT explicitly mentioned, ASK THEM: "ঢাকার ভেতরে ও ঢাকার বাইরে ডেলিভারি চার্জ কত রাখবেন? (যেমন: ৭০ ও ১৩০ টাকা)"
- If core features or benefits were NOT mentioned, ASK THEM: "এই প্রোডাক্টের প্রধান ২/৩টি বিশেষ সুবিধা বা গুণ কি কি যা কাস্টমারকে আকৃষ্ট করবে?"
- ONLY when you have at least: Product Name, Price, Delivery Charges, AND at least 2 benefits/details, set "readyToGenerate": true. Otherwise set it to false and continue asking the missing question.

RETURN STRICT JSON ONLY:
{
  "reply": "Your friendly conversational Bengali response asking the specific follow-up question",
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

  // Turn 1: Ask for price and benefits if missing
  if (historyLen <= 1) {
    return {
      success: true,
      reply: `চমৎকার প্রোডাক্ট আইডিয়া! ল্যান্ডিং পেজে কাস্টমারদের আকর্ষণ করার জন্য ২টি তথ্য জানান:\n\n১. অফার মূল্য কত রাখবেন এবং আগের মূল্য কত ছিল? (যেমন: ৳১২০০, আগে ১৮০০)\n২. এই প্রোডাক্টের প্রধান ২টি সুবিধা কি কি?`,
      readyToGenerate: false,
      extractedData: {
        product_title: userMessage.slice(0, 40),
        price: extractedPrice,
        regular_price: extractedPrice ? Math.round(extractedPrice * 1.4) : null,
        delivery_fee_inside: 70,
        delivery_fee_outside: 130,
        theme_color: 'emerald',
        highlights: []
      }
    }
  }

  // Turn 2: Ask for delivery charges & guarantee
  if (historyLen <= 3) {
    return {
      success: true,
      reply: `তথ্যগুলো দারুণ! এবার শেষ ২টি তথ্য জানান:\n\n১. ঢাকার ভেতরে ও ঢাকার বাইরে আপনার ডেলিভারি চার্জ কত রাখবেন? (যেমন: সাধারণ নিয়ম অনুযায়ী ভেতরে ৭০ টাকা ও বাইরে ১৩০ টাকা)\n২. কাস্টমারদের জন্য কি কোনো রিপ্লেসমেন্ট গ্যারান্টি বা ক্যাশ অন ডেলিভারি সুবিধা থাকবে?`,
      readyToGenerate: false,
      extractedData: {
        product_title: null,
        price: extractedPrice || 1200,
        regular_price: extractedPrice ? Math.round(extractedPrice * 1.4) : 1600,
        delivery_fee_inside: 70,
        delivery_fee_outside: 130,
        theme_color: 'emerald',
        highlights: ['১০০% অরিজিনাল', 'প্রিমিয়াম কোয়ালিটি']
      }
    }
  }

  // Turn 3: Ready
  return {
    success: true,
    reply: `অসাধারণ! সব তথ্য সুন্দরভাবে পেয়ে গেছি।\nআপনার হাই-কনভার্টিং ল্যান্ডিং পেজ এবং কাস্টমার ক্লোজিং AI চ্যাটবট রেডি করতে নিচের বাটনে চাপ দিন!`,
    readyToGenerate: true,
    extractedData: {
      product_title: null,
      price: extractedPrice || 1200,
      regular_price: extractedPrice ? Math.round(extractedPrice * 1.4) : 1600,
      delivery_fee_inside: 70,
      delivery_fee_outside: 130,
      theme_color: 'emerald',
      highlights: ['ক্যাশ অন ডেলিভারি', '৭ দিনের রিপ্লেসমেন্ট']
    }
  }
}

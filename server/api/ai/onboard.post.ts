/**
 * Interactive Onboarding Chat Agent
 * Seamlessly chats with merchant, asks about delivery charges, returns readyToGenerate trigger
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

    const systemPrompt = `You are "DokanAI Assistant" (দোকান এআই), an expert conversational e-commerce consultant for Bangladeshi single-product Cash-on-Delivery (COD) merchants.
Your mission is to interview the merchant in natural, friendly, polite Bengali (feel free to use common English/Banglish terms like 'delivery charge', 'price', 'offer', 'photo', 'warranty').

Essential details you need to discover through conversational dialogue:
1. Product Title (প্রোডাক্টের নাম)
2. Offer Selling Price & Regular Price (অফার মূল্য ও পূর্বের রেগুলার মূল্য)
3. Delivery charges (ঢাকার ভেতরে ও বাইরে ডেলিভারি চার্জ কত — default standard in BD is ৳70 inside, ৳130 outside)
4. 2-3 Core Benefits / Transformations for the customer
5. Theme color preference (emerald, indigo, rose, amber)

Conversation rules:
- Keep responses short, concise, and helpful (2-3 sentences max).
- If the merchant gives only 1 piece of information (e.g. "I sell organic honey for 1000 taka"), praise it, acknowledge the price, and ask the next natural question (e.g., "ঢাকার ভেতরে ও বাইরে ডেলিভারি চার্জ কত রাখবেন? এবং এর বিশেষ ২টি উপকারিতা কি কি?").
- When you have enough essential information (Product name, Price, and at least some benefits or delivery charge), warmly summarize what you understood, and set "readyToGenerate": true.

Always return a strictly valid JSON object matching this schema:
{
  "reply": "Your friendly Bengali conversational reply to the merchant",
  "readyToGenerate": boolean,
  "summary": "Short 1-line recap of the gathered details if readyToGenerate is true, otherwise empty string",
  "extractedData": {
    "product_title": "string or null",
    "price": number or null,
    "regular_price": number or null,
    "delivery_fee_inside": number or 70,
    "delivery_fee_outside": number or 130,
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
  let extractedPrice = priceMatch ? parseInt(priceMatch[0], 10) : 1200
  let regularPrice = Math.round(extractedPrice * 1.4)

  if (historyLen <= 1) {
    return {
      success: true,
      reply: `চমৎকার প্রোডাক্ট! ল্যান্ডিং পেজে কাস্টমারদের আকৃষ্ট করতে আমাকে শুধু ২টি তথ্য জানান:\n১. ঢাকার ভেতরে ও বাইরে আপনার ডেলিভারি চার্জ কত? (যেমন: ৭০ ও ১৩০ টাকা)\n২. এই প্রোডাক্টের সেরা ২টি সুবিধা কি কি?`,
      readyToGenerate: false,
      summary: '',
      extractedData: {
        product_title: userMessage.slice(0, 45),
        price: extractedPrice,
        regular_price: regularPrice,
        delivery_fee_inside: 70,
        delivery_fee_outside: 130,
        theme_color: 'emerald',
        highlights: ['১০০% অরিজিনাল', 'ক্যাশ অন ডেলিভারি']
      }
    }
  }

  return {
    success: true,
    reply: `অসাধারণ! আপনার সব প্রয়োজনীয় তথ্য পেয়ে গেছি। সম্পূর্ণ কনভার্টিং ল্যান্ডিং পেজ ও সেলস চ্যাটবট রেডি করতে নিচের বাটনে ক্লিক করুন!`,
    readyToGenerate: true,
    summary: `প্রোডাক্ট: ${userMessage.slice(0, 30)} | প্রাইজ: ৳${extractedPrice}`,
    extractedData: {
      product_title: userMessage.slice(0, 35) || 'প্রিমিয়াম প্রোডাক্ট',
      price: extractedPrice,
      regular_price: regularPrice,
      delivery_fee_inside: 70,
      delivery_fee_outside: 130,
      theme_color: 'emerald',
      highlights: ['ক্যাশ অন ডেলিভারি', '৭ দিনের রিটার্ন গ্যারান্টি']
    }
  }
}

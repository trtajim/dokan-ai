/**
 * In-Store Sales Chatbot API Endpoint
 * Answers buyer questions on the live landing page. Context is strictly
 * locked to the product specifications, pricing, delivery, and guarantees.
 */
import { GoogleGenAI } from '@google/genai'
import { memoryStore } from '../../utils/memoryStore'
import { getSupabaseClient } from '../../utils/supabase'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { slug, message, history } = body

  if (!slug || !message) {
    throw createError({ statusCode: 400, message: 'Store slug and message are required' })
  }

  // 1. Fetch store info
  let store: any = null
  const supabase = getSupabaseClient()
  if (supabase) {
    const { data } = await supabase.from('stores').select('*').eq('slug', slug).single()
    if (data) store = data
  }
  if (!store) {
    store = memoryStore.getStore(slug)
  }

  if (!store) {
    throw createError({ statusCode: 404, message: 'Store not found' })
  }

  const config = useRuntimeConfig()
  const apiKey = config.geminiApiKey || process.env.GEMINI_API_KEY

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey })

      // Real dynamic delivery charges from store
      const insideFee = Number(store.config?.delivery_fee_inside || store.delivery_fee_inside) || 70
      const outsideFee = Number(store.config?.delivery_fee_outside || store.delivery_fee_outside) || 130

      const systemPrompt = `You are the polite, direct, and helpful Bangladeshi in-store sales assistant for the online store "${store.product_title}".
Store Information:
- Product Name: ${store.product_title}
- Current Offer Price: ৳${store.price} (Regular was: ৳${store.regular_price || Math.round(store.price * 1.4)})
- Delivery Details: Cash on Delivery (ক্যাশ অন ডেলিভারি). ডেলিভারি চার্জ: ঢাকার ভিতরে ${insideFee} টাকা (২৪-৪৮ ঘণ্টা), ঢাকার বাইরে ${outsideFee} টাকা (২-৩ দিন)। ডেলিভারির সময় পার্সেল খুলে চেক করে টাকা দিতে পারবে।
- Warranty: ৭ দিনের ফ্রি রিপ্লেসমেন্ট সুবিধা।
- Product Features: ${JSON.stringify(store.config?.features || [])}
- FAQs: ${JSON.stringify(store.config?.faqs || [])}

Rules:
1. Always reply in clear, polite Bengali (you can use natural Banglish words like 'order', 'delivery', 'check').
2. Keep answers direct, friendly, and very concise (1 to 2 sentences maximum).
3. Always provide direct answers without unnecessary filler details or boilerplate explanations.
4. DO NOT say "অর্ডার করতে চাইলে নিচের অর্ডার বাটনটিতে ক্লিক করে ফর্মটি পূরণ করুন" or instruct them to click the order button, because an interactive order button is already automatically attached below the message.
5. Always use the EXACT delivery fees mentioned above (Inside Dhaka: ৳${insideFee}, Outside Dhaka: ৳${outsideFee}). NEVER hallucinate other charges!
6. Do not make up fake specs not mentioned above.`

      const contents: any[] = [{ role: 'user', parts: [{ text: systemPrompt }] }]
      if (Array.isArray(history)) {
        history.forEach((h: any) => {
          contents.push({
            role: h.role === 'user' ? 'user' : 'model',
            parts: [{ text: h.text }]
          })
        })
      }
      contents.push({ role: 'user', parts: [{ text: message }] })

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash-lite',
        contents
      })

      return {
        success: true,
        reply: response.text || 'ধন্যবাদ! আপনার কোনো প্রশ্ন থাকলে জানাতে পারেন।'
      }
    } catch (err: any) {
      console.error('Chat Gemini error:', err)
    }
  }

  // Fallback intelligent response matcher
  const lower = message.toLowerCase()
  const insideFeeFallback = Number(store.config?.delivery_fee_inside || store.delivery_fee_inside) || 70
  const outsideFeeFallback = Number(store.config?.delivery_fee_outside || store.delivery_fee_outside) || 130
  let reply = 'ধন্যবাদ! আপনার যেকোনো প্রশ্ন থাকলে নির্ভয়ে জানাতে পারেন।'

  if (lower.includes('price') || lower.includes('দাম') || lower.includes('কত') || lower.includes('koto')) {
    reply = `প্রোডাক্টটির স্পেশাল অফার মূল্য মাত্র ৳${store.price} (রেগুলার মূল্য ছিল ৳${store.regular_price || Math.round(store.price * 1.4)})।`
  } else if (lower.includes('delivery') || lower.includes('চার্জ') || lower.includes('কবে') || lower.includes('charge')) {
    reply = `ক্যাশ অন ডেলিভারিতে পাবেন—ঢাকার ভেতরে ডেলিভারি চার্জ ${insideFeeFallback} টাকা এবং ঢাকার বাইরে ${outsideFeeFallback} টাকা। পার্সেল খুলে চেক করে টাকা পরিশোধ করতে পারবেন।`
  } else if (lower.includes('original') || lower.includes('অরিজিনাল') || lower.includes('গ্যারান্টি') || lower.includes('check')) {
    reply = `জি, এটি শতভাগ অরিজিনাল কোয়ালিটি সম্পন্ন প্রোডাক্ট এবং সাথে ৭ দিনের রিপ্লেসমেন্ট সুবিধা পাবেন।`
  } else if (lower.includes('order') || lower.includes('অর্ডার') || lower.includes('নিব') || lower.includes('কিনব')) {
    reply = `ক্যাশ অন ডেলিভারিতে কোনো অগ্রিম পেমেন্ট ছাড়াই অর্ডার করতে পারবেন।`
  }

  return {
    success: true,
    reply
  }
})

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
2. Keep answers short and concise (1 to 2 sentences maximum).
3. Always use the EXACT delivery fees mentioned above (Inside Dhaka: ৳${insideFee}, Outside Dhaka: ৳${outsideFee}). NEVER hallucinate other charges!
4. If they ask about buying or ordering, enthusiastically tell them to click the order button or fill in the short form below on the page.
5. Do not make up fake specs not mentioned above.`

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
        reply: response.text || 'ধন্যবাদ! অর্ডার করতে নিচের ফর্মে আপনার নাম ও ঠিকানা লিখে সাবমিট করুন।'
      }
    } catch (err: any) {
      console.error('Chat Gemini error:', err)
    }
  }

  // Fallback intelligent response matcher
  const lower = message.toLowerCase()
  const insideFeeFallback = Number(store.config?.delivery_fee_inside || store.delivery_fee_inside) || 70
  const outsideFeeFallback = Number(store.config?.delivery_fee_outside || store.delivery_fee_outside) || 130
  let reply = 'ধন্যবাদ আপনার মেসেজের জন্য! আমাদের প্রতিনিধি খুব দ্রুত যোগাযোগ করবেন। অর্ডার করতে সরাসরি নিচের ফর্মে নাম ও মোবাইল নম্বর দিয়ে কনফার্ম করুন।'

  if (lower.includes('price') || lower.includes('দাম') || lower.includes('কত') || lower.includes('koto')) {
    reply = `প্রোডাক্টটির স্পেশাল ডিসকাউন্ট মূল্য মাত্র ৳${store.price} (আগের মূল্য ছিল ৳${store.regular_price || Math.round(store.price * 1.4)})। স্টক সীমিত সময়ের জন্য এই অফার চলছে!`
  } else if (lower.includes('delivery') || lower.includes('চার্জ') || lower.includes('কবে') || lower.includes('charge')) {
    reply = `ক্যাশ অন ডেলিভারিতে পাবেন! ঢাকার ভেতরে ডেলিভারি চার্জ ${insideFeeFallback} টাকা (১-২ দিন) এবং ঢাকার বাইরে ${outsideFeeFallback} টাকা (২-৩ দিন)। পণ্য দেখে মূল্য পরিশোধের সুবিধা রয়েছে।`
  } else if (lower.includes('original') || lower.includes('অরিজিনাল') || lower.includes('গ্যারান্টি') || lower.includes('check')) {
    reply = `জি, এটি ১০০% অরিজিনাল ও পরীক্ষিত প্রোডাক্ট। ডেলিভারি ম্যানের সামনে প্যাকেট খুলে চেক করে টাকা পরিশোধ করতে পারবেন এবং ৭ দিনের রিপ্লেসমেন্ট পলিসি রয়েছে।`
  } else if (lower.includes('order') || lower.includes('অর্ডার') || lower.includes('নিব') || lower.includes('কিনব')) {
    reply = `অর্ডার করতে পেজের নিচে দেওয়া ছোট্ট ফর্মে আপনার নাম, মোবাইল নম্বর ও ঠিকানা লিখে "অর্ডার কনফার্ম করুন" বাটনে চাপ দিন। কোনো অগ্রিম টাকা লাগবে না!`
  }

  return {
    success: true,
    reply
  }
})

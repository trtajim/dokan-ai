/**
 * Conversational AI Store Editor API
 * Takes natural language instructions from the merchant (e.g. "হেডলাইন পরিবর্তন করো", "দাম ১২০০ টাকা করো")
 * and updates the store configuration intelligently using Gemini.
 */
import { GoogleGenAI } from '@google/genai'
import { memoryStore } from '../../utils/memoryStore'
import { getSupabaseClient } from '../../utils/supabase'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { slug, instruction } = body

  if (!slug || !instruction) {
    throw createError({ statusCode: 400, message: 'Slug and instruction are required' })
  }

  // 1. Fetch current store state
  let currentStore: any = memoryStore.getStore(slug)
  const supabase = getSupabaseClient()
  if (!currentStore && supabase) {
    const { data } = await supabase.from('stores').select('*').eq('slug', slug).single()
    if (data) currentStore = data
  }

  if (!currentStore) {
    throw createError({ statusCode: 404, message: 'Store not found' })
  }

  const config = useRuntimeConfig()
  const apiKey = config.geminiApiKey || process.env.GEMINI_API_KEY

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey })

      const prompt = `You are "DokanAI Live Store Editor".
A merchant wants to modify their live e-commerce single-product landing page.
Merchant's Instruction in Bengali/Banglish: "${instruction}"

Current Store Data:
- Product Title: "${currentStore.product_title}"
- Price: ${currentStore.price}
- Regular Price: ${currentStore.regular_price}
- Stock: ${currentStore.stock ?? 20}
- Delivery Fee Inside Dhaka: ${currentStore.config?.delivery_fee_inside ?? 70}
- Delivery Fee Outside Dhaka: ${currentStore.config?.delivery_fee_outside ?? 130}
- Video Reel URL: "${currentStore.config?.video_reel_url ?? ''}"
- Theme Color: "${currentStore.theme_color ?? 'emerald'}"
- Headline: "${currentStore.config?.headline ?? ''}"
- Subheadline: "${currentStore.config?.subheadline ?? ''}"
- Features: ${JSON.stringify(currentStore.config?.features ?? [])}
- Trust Badges: ${JSON.stringify(currentStore.config?.trust_badges ?? [])}
- FAQs: ${JSON.stringify(currentStore.config?.faqs ?? [])}

YOUR TASK:
Analyze the merchant's request and return an updated configuration. Only alter the parts requested by the merchant, keep everything else intact.
Explain the change in a friendly 1-sentence Bengali reply.

RETURN STRICT JSON ONLY:
{
  "reply": "friendly 1-sentence confirmation of what was modified in Bengali",
  "product_title": "string",
  "price": number,
  "regular_price": number,
  "stock": number,
  "theme_color": "emerald" | "indigo" | "rose" | "amber",
  "delivery_fee_inside": number,
  "delivery_fee_outside": number,
  "video_reel_url": "string",
  "headline": "string",
  "subheadline": "string",
  "features": [{"title": "...", "desc": "..."}],
  "trust_badges": ["string"],
  "faqs": [{"q": "...", "a": "..."}]
}`

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash-lite',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
      })

      const parsed = JSON.parse(response.text || '{}')

      // Apply updates
      const updatedConfig = {
        ...currentStore.config,
        headline: parsed.headline || currentStore.config?.headline,
        subheadline: parsed.subheadline || currentStore.config?.subheadline,
        delivery_fee_inside: parsed.delivery_fee_inside ?? currentStore.config?.delivery_fee_inside,
        delivery_fee_outside: parsed.delivery_fee_outside ?? currentStore.config?.delivery_fee_outside,
        video_reel_url: parsed.video_reel_url !== undefined ? parsed.video_reel_url : currentStore.config?.video_reel_url,
        features: parsed.features || currentStore.config?.features,
        trust_badges: parsed.trust_badges || currentStore.config?.trust_badges,
        faqs: parsed.faqs || currentStore.config?.faqs,
        stock: parsed.stock ?? currentStore.stock
      }

      currentStore.product_title = parsed.product_title || currentStore.product_title
      currentStore.price = parsed.price || currentStore.price
      currentStore.regular_price = parsed.regular_price || currentStore.regular_price
      currentStore.theme_color = parsed.theme_color || currentStore.theme_color
      currentStore.stock = parsed.stock ?? currentStore.stock
      currentStore.config = updatedConfig

      if (supabase) {
        try {
          await supabase.from('stores').update({
            product_title: currentStore.product_title,
            price: currentStore.price,
            regular_price: currentStore.regular_price,
            theme_color: currentStore.theme_color,
            config: currentStore.config
          }).eq('slug', slug)
        } catch (dbErr) {
          console.warn('Supabase store AI edit update error:', dbErr)
        }
      }

      memoryStore.setStore(slug, currentStore)

      return {
        success: true,
        reply: parsed.reply || 'আপনার নির্দেশনা অনুযায়ী দোকানের তথ্য আপডেট করা হয়েছে!',
        store: currentStore
      }
    } catch (err: any) {
      console.error('Gemini store editor error:', err)
    }
  }

  // Fallback heuristic editor if no API key
  const lower = instruction.toLowerCase()
  const priceMatch = instruction.match(/(\d{3,5})/g)
  if (priceMatch && (lower.includes('price') || lower.includes('দাম') || lower.includes('taka'))) {
    currentStore.price = parseInt(priceMatch[0], 10)
    currentStore.regular_price = Math.round(currentStore.price * 1.4)
  }

  memoryStore.setStore(slug, currentStore)

  return {
    success: true,
    reply: 'আপনার নির্দেশনা অনুযায়ী তথ্য আপডেট করা হয়েছে!',
    store: currentStore
  }
})

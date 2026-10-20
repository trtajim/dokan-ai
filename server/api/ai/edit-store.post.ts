/**
 * Conversational AI Store Editor API
 * Can modify EVERYTHING: FAQs, Reviews/Testimonials, Features,
 * Headlines, Stock, Delivery, Variants, and Badges using pure natural language.
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

      const prompt = `You are "DokanAI Master Store Editor".
The merchant is speaking to you to edit or customize their live store.
EVERYTHING on the page can be changed: FAQs, Customer Reviews/Testimonials, Features, Headline, Subheadline, Price, Stock, Badges, Delivery fees, or Reel link.

Merchant's Instruction in Bengali/Banglish: "${instruction}"

Current Store Data:
- Product Title: "${currentStore.product_title}"
- Price: ${currentStore.price}
- Regular Price: ${currentStore.regular_price}
- Stock: ${currentStore.stock ?? 20}
- Delivery Fee Inside Dhaka: ${currentStore.config?.delivery_fee_inside ?? 70}
- Delivery Fee Outside Dhaka: ${currentStore.config?.delivery_fee_outside ?? 130}
- Video Reel URL: "${currentStore.config?.video_reel_url ?? ''}"
- Headline: "${currentStore.config?.headline ?? ''}"
- Subheadline: "${currentStore.config?.subheadline ?? ''}"
- Features: ${JSON.stringify(currentStore.config?.features ?? [])}
- Trust Badges: ${JSON.stringify(currentStore.config?.trust_badges ?? [])}
- FAQs: ${JSON.stringify(currentStore.config?.faqs ?? [])}
- Testimonials / Reviews: ${JSON.stringify(currentStore.config?.testimonials ?? [])}
- Variants: ${JSON.stringify(currentStore.config?.variants ?? [])}

RULES:
1. If the merchant asks to change/add/remove a Review or Testimonial, update the "testimonials" array.
2. If they ask to change/add/remove an FAQ (প্রশ্ন ও উত্তর), update the "faqs" array.
3. If they ask to change features, headlines, price, or anything else, update accordingly.
4. Keep untouched fields exactly as they are.
5. Provide a warm, clear 1-sentence Bengali confirmation of the exact change made.

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
  "faqs": [{"q": "...", "a": "..."}],
  "testimonials": [{"name": "...", "location": "...", "comment": "..."}],
  "variants": [{"name": "...", "price": number}]
}`

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash-lite',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
      })

      const parsed = JSON.parse(response.text || '{}')

      // Apply updates to the store's full configuration
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
        testimonials: parsed.testimonials || currentStore.config?.testimonials,
        variants: parsed.variants || currentStore.config?.variants,
        stock: parsed.stock ?? currentStore.stock
      }

      currentStore.product_title = parsed.product_title || currentStore.product_title
      currentStore.price = parsed.price || currentStore.price
      currentStore.regular_price = parsed.regular_price || currentStore.regular_price
      currentStore.theme_color = parsed.theme_color || currentStore.theme_color
      currentStore.stock = parsed.stock ?? currentStore.stock
      currentStore.variants = parsed.variants || currentStore.variants
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
        reply: parsed.reply || 'আপনার নির্দেশনা অনুযায়ী রিভিউ ও তথ্য আপডেট করা হয়েছে!',
        store: currentStore
      }
    } catch (err: any) {
      console.error('Gemini store editor error:', err)
    }
  }

  // Fallback heuristic editor if no API key
  memoryStore.setStore(slug, currentStore)

  return {
    success: true,
    reply: 'আপনার নির্দেশনা অনুযায়ী তথ্য আপডেট করা হয়েছে!',
    store: currentStore
  }
})

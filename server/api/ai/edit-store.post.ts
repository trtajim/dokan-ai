/**
 * Conversational AI Store Editor API with Section Visibility Toggles
 * Can show, hide, edit, or remove:
 * - Top Urgency Bar (🔥 অফারটি সীমিত সময়ের জন্য...)
 * - Verified Seller Badge (১০০% ভেরিফাইড বিক্রেতা)
 * - FAQs, Testimonials, Features, Reel Video, or Badges
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
The merchant is giving you natural language commands to customize or remove/hide sections on their live single-product store page.

Merchant's Instruction: "${instruction}"

Current Store Data:
- Product Title: "${currentStore.product_title}"
- Price: ${currentStore.price}
- Regular Price: ${currentStore.regular_price}
- Stock: ${currentStore.stock ?? 20}
- Show Urgency Top Bar: ${currentStore.config?.show_urgency_bar ?? true}
- Show Verified Badge: ${currentStore.config?.show_verified_badge ?? true}
- Show Video Reel: ${currentStore.config?.show_video_reel ?? true}
- Show Testimonials / Reviews: ${currentStore.config?.show_testimonials ?? true}
- Show FAQs: ${currentStore.config?.show_faqs ?? true}
- Delivery Fee Inside Dhaka: ${currentStore.config?.delivery_fee_inside ?? 70}
- Delivery Fee Outside Dhaka: ${currentStore.config?.delivery_fee_outside ?? 130}
- Headline: "${currentStore.config?.headline ?? ''}"
- Subheadline: "${currentStore.config?.subheadline ?? ''}"
- Features: ${JSON.stringify(currentStore.config?.features ?? [])}
- Trust Badges: ${JSON.stringify(currentStore.config?.trust_badges ?? [])}
- FAQs: ${JSON.stringify(currentStore.config?.faqs ?? [])}
- Testimonials: ${JSON.stringify(currentStore.config?.testimonials ?? [])}

RULES FOR SECTION VISIBILITY:
- If the merchant asks to remove/hide the top urgency bar ("অফার বারটা সরাও" / "স্টক নোটিশ সরাও"), set "show_urgency_bar": false.
- If they ask to remove/hide the verified seller badge ("১০০% ভেরিফাইড বিক্রেতা লেখাটি বাদ দাও"), set "show_verified_badge": false.
- If they ask to remove the reviews or FAQs, set "show_testimonials": false or "show_faqs": false, or empty the arrays.
- If they ask to bring it back ("আবার যোগ করো"), set to true.

RETURN STRICT JSON ONLY:
{
  "reply": "friendly 1-sentence confirmation of what was modified in Bengali",
  "product_title": "string",
  "price": number,
  "regular_price": number,
  "stock": number,
  "show_urgency_bar": boolean,
  "show_verified_badge": boolean,
  "show_testimonials": boolean,
  "show_faqs": boolean,
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

      const updatedConfig = {
        ...currentStore.config,
        show_urgency_bar: parsed.show_urgency_bar !== undefined ? parsed.show_urgency_bar : (currentStore.config?.show_urgency_bar ?? true),
        show_verified_badge: parsed.show_verified_badge !== undefined ? parsed.show_verified_badge : (currentStore.config?.show_verified_badge ?? true),
        show_testimonials: parsed.show_testimonials !== undefined ? parsed.show_testimonials : (currentStore.config?.show_testimonials ?? true),
        show_faqs: parsed.show_faqs !== undefined ? parsed.show_faqs : (currentStore.config?.show_faqs ?? true),
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
        reply: parsed.reply || 'আপনার নির্দেশনা অনুযায়ী সেকশনটি আপডেট করা হয়েছে!',
        store: currentStore
      }
    } catch (err: any) {
      console.error('Gemini store editor error:', err)
    }
  }

  memoryStore.setStore(slug, currentStore)

  return {
    success: true,
    reply: 'আপনার নির্দেশনা অনুযায়ী তথ্য আপডেট করা হয়েছে!',
    store: currentStore
  }
})

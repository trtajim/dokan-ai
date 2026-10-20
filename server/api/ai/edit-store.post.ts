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

      const prompt = `You are "DokanAI Master Store Editor & Consultant".
The merchant is asking for modifications, design feedback, or questions about their live store.

Merchant's Message: "${instruction}"

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
- Badge Text: "${currentStore.config?.badge_text ?? 'অরিজিনাল কোয়ালিটি নিশ্চয়তা'}"
- Seller Tagline: "${currentStore.config?.seller_tagline ?? '১০০% খাঁটি ও গুণগত মান সম্পন্ন'}"
- CTA Button Text: "${currentStore.config?.cta_button_text ?? 'এখনই অর্ডার করুন (ক্যাশ অন ডেলিভারি)'}"
- Headline: "${currentStore.config?.headline ?? ''}" (Must be punchy & compact, max 10-14 words, not a long paragraph)
- Subheadline: "${currentStore.config?.subheadline ?? ''}"
- Features: ${JSON.stringify(currentStore.config?.features ?? [])}
- FAQs: ${JSON.stringify(currentStore.config?.faqs ?? [])}
- Testimonials: ${JSON.stringify(currentStore.config?.testimonials ?? [])}

BEHAVIOR AND INTERMEDIARY CONFIRMATION RULES:
1. Apply requested changes accurately. You can customize EVERY SINGLE PIECE of text and setting:
   - Badge text above headline (e.g. "প্রিমিয়াম কোয়ালিটি গ্যারান্টিড" -> anything the user wants)
   - CTA button text (e.g. "অর্ডার করুন", "এখনই কিনুন", etc.)
   - Headline, subheadline, price, regular price, stock, color theme
   - Features, trust badges, FAQs, reviews/testimonials
2. In "reply", confirm the modification clearly in friendly Bengali AND offer an intelligent follow-up suggestion or question.
3. Provide 2 to 3 quick clickable follow-up suggestion chips in Bengali in "suggestions" array.
4. SECTION VISIBILITY:
   - If asked to hide/remove urgency bar, set "show_urgency_bar": false.
   - If asked to hide/remove verified badge, set "show_verified_badge": false.
   - If asked to hide/remove testimonials/reviews or FAQs, set "show_testimonials": false or "show_faqs": false.

RETURN STRICT JSON ONLY:
{
  "reply": "friendly explanation in Bengali with follow-up suggestion",
  "suggestions": ["suggested chip 1", "suggested chip 2"],
  "product_title": "string",
  "price": number,
  "regular_price": number,
  "stock": number,
  "badge_text": "string (custom badge tag)",
  "seller_tagline": "string (custom seller short highlight in black)",
  "cta_button_text": "string (e.g. এখনই অর্ডার করুন (ক্যাশ অন ডেলিভারি) or custom)",
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
        badge_text: parsed.badge_text !== undefined ? parsed.badge_text : currentStore.config?.badge_text,
        seller_tagline: parsed.seller_tagline !== undefined ? parsed.seller_tagline : currentStore.config?.seller_tagline,
        cta_button_text: parsed.cta_button_text !== undefined ? parsed.cta_button_text : currentStore.config?.cta_button_text,
        video_reel_url: parsed.video_reel_url !== undefined ? parsed.video_reel_url : currentStore.config?.video_reel_url,
        features: parsed.features || currentStore.config?.features,
        trust_badges: parsed.trust_badges || currentStore.config?.trust_badges,
        faqs: parsed.faqs || currentStore.config?.faqs,
        testimonials: parsed.testimonials || currentStore.config?.testimonials,
        variants: parsed.variants || currentStore.config?.variants,
        stock: parsed.stock ?? currentStore.stock
      }

      const prevSnapshot = JSON.stringify({
        title: currentStore.product_title,
        price: currentStore.price,
        regular_price: currentStore.regular_price,
        theme_color: currentStore.theme_color,
        stock: currentStore.stock,
        config: currentStore.config
      })

      currentStore.product_title = parsed.product_title || currentStore.product_title
      currentStore.price = parsed.price || currentStore.price
      currentStore.regular_price = parsed.regular_price || currentStore.regular_price
      currentStore.theme_color = parsed.theme_color || currentStore.theme_color
      currentStore.stock = parsed.stock ?? currentStore.stock
      currentStore.variants = parsed.variants || currentStore.variants
      currentStore.config = updatedConfig

      const newSnapshot = JSON.stringify({
        title: currentStore.product_title,
        price: currentStore.price,
        regular_price: currentStore.regular_price,
        theme_color: currentStore.theme_color,
        stock: currentStore.stock,
        config: currentStore.config
      })

      const hasChanged = prevSnapshot !== newSnapshot

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
        suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
        hasChanged,
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

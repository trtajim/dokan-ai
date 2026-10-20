/**
 * Conversational AI Store Editor API with Section Visibility Toggles
 * Can show, hide, edit, or remove:
 * - Top Urgency Bar (🔥 অফারটি সীমিত সময়ের জন্য...)
 * - Verified Seller Badge (১০০% ভেরিফাইড বিক্রেতা)
 * - FAQs, Testimonials, Features, Reel Video, or Badges
 */
import { generateAiContent } from '../../utils/aiClient'
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

  // Let generateAiContent handle all 6 Groq & Gemini rotation keys seamlessly
  try {
    const prompt = `You are "DokanAI Master Store Editor & Consultant".
The merchant is asking for modifications, design feedback, or questions about their live store.

Merchant's Message: "${instruction}"

Current Store Data:
- Product Title: "${currentStore.product_title}"
- Price: ${currentStore.price}
- Regular Price: ${currentStore.regular_price}
- Stock: ${currentStore.stock ?? 20}
- Current Theme Color: "${currentStore.theme_color || 'emerald'}" (Themes: amber, emerald, indigo, rose, slate)
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
1. VAGUE OR AMBIGUOUS REQUESTS (CRITICAL):
   - If the merchant's request is unclear, vague, or missing key details (e.g., "change it", "এটা পরিবর্তন করো", "দাম বদলাও", "কালার বদলাও", "কিছু একটা বাদ দাও"), DO NOT guess or make random destructive modifications.
   - Set "is_clarification": true.
   - Keep all store fields, prices, themes, and configs EXACTLY as their current values.
   - In "reply", ask a polite, precise follow-up question in Bengali clarifying exactly what they want to change (e.g. "আপনি কি পণ্যের দাম, কালার থিম নাকি কোনো নির্দিষ্ট লেখা পরিবর্তন করতে চাচ্ছেন? বিস্তারিত জানালে সাথে সাথে করে দিচ্ছি।").
   - In "suggestions", provide 3 distinct, specific clickable options (e.g. ["দাম পরিবর্তন করুন", "কালার থিম পরিবর্তন করুন", "হেডলাইন পরিবর্তন করুন"]).

2. SPECIFIC INSTRUCTIONS:
   - Apply requested changes accurately. You can customize EVERY SINGLE PIECE of text and setting WITHOUT touching or wiping out other unrelated sections:
     - Badge text above headline (e.g. "প্রিমিয়াম কোয়ালিটি গ্যারান্টিড" -> anything the user wants)
     - CTA button text (e.g. "অর্ডার করুন", "এখনই কিনুন", etc.)
     - Headline, subheadline, price, regular price, stock, color theme ("amber", "emerald", "indigo", "rose", "slate")
     - Features, trust badges, FAQs, reviews/testimonials
     - Video Reel URL (add YouTube/Facebook reel or remove)
   - Preserve all existing features, FAQs, and testimonials unless the merchant specifically asked to modify or remove them!
   - In "reply", confirm the exact modification clearly in natural, reassuring Bengali (e.g. "আপনার পণ্যের দাম ১০০০ থেকে কমিয়ে ৯৫০ টাকা করা হয়েছে!") AND ask a helpful follow-up question.
   - Provide 2 to 3 quick clickable next-step chips in "suggestions" array.

3. SECTION VISIBILITY:
   - If asked to hide/remove urgency bar, set "show_urgency_bar": false.
   - If asked to hide/remove verified badge, set "show_verified_badge": false.
   - If asked to hide/remove video/reel, set "show_video_reel": false.
   - If asked to hide/remove testimonials/reviews or FAQs, set "show_testimonials": false or "show_faqs": false.
   - If asked to show them back, set them to true.

RETURN STRICT JSON ONLY:
{
  "reply": "friendly explanation in Bengali (or precise clarifying question if request was vague)",
  "is_clarification": boolean,
  "suggestions": ["suggested chip 1", "suggested chip 2", "suggested chip 3"],
  "product_title": "string",
  "price": number,
  "regular_price": number,
  "stock": number,
  "badge_text": "string (custom badge tag)",
  "seller_tagline": "string (custom seller short highlight in black)",
  "cta_button_text": "string (e.g. এখনই অর্ডার করুন (ক্যাশ অন ডেলিভারি) or custom)",
  "show_urgency_bar": boolean,
  "show_verified_badge": boolean,
  "show_video_reel": boolean,
  "show_testimonials": boolean,
  "show_faqs": boolean,
  "theme_color": "amber" | "emerald" | "indigo" | "rose" | "slate",
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

    const rawResponse = await generateAiContent({
      prompt,
      jsonMode: true
    })

    const parsed = JSON.parse(rawResponse || '{}')

    const updatedConfig = {
      ...currentStore.config,
      show_urgency_bar: parsed.show_urgency_bar !== undefined ? parsed.show_urgency_bar : (currentStore.config?.show_urgency_bar ?? true),
      show_verified_badge: parsed.show_verified_badge !== undefined ? parsed.show_verified_badge : (currentStore.config?.show_verified_badge ?? true),
      show_video_reel: parsed.show_video_reel !== undefined ? parsed.show_video_reel : (currentStore.config?.show_video_reel ?? true),
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
      features: (Array.isArray(parsed.features) && parsed.features.length > 0) ? parsed.features : currentStore.config?.features,
      trust_badges: (Array.isArray(parsed.trust_badges) && parsed.trust_badges.length > 0) ? parsed.trust_badges : currentStore.config?.trust_badges,
      faqs: (Array.isArray(parsed.faqs) && parsed.faqs.length > 0) ? parsed.faqs : currentStore.config?.faqs,
      testimonials: (Array.isArray(parsed.testimonials) && parsed.testimonials.length > 0) ? parsed.testimonials : currentStore.config?.testimonials,
      variants: parsed.variants || currentStore.config?.variants,
      stock: parsed.stock ?? currentStore.stock,
      pixel_id: parsed.pixel_id !== undefined ? parsed.pixel_id : currentStore.config?.pixel_id
    }

    const prevSnapshot = JSON.stringify({
      title: currentStore.product_title,
      price: currentStore.price,
      regular_price: currentStore.regular_price,
      theme_color: currentStore.theme_color,
      stock: currentStore.stock,
      config: currentStore.config
    })

    const isClarification = Boolean(parsed.is_clarification)
    let hasChanged = false

    if (!isClarification) {
      currentStore.product_title = parsed.product_title || currentStore.product_title
      currentStore.price = (parsed.price !== undefined && parsed.price !== null) ? Number(parsed.price) : currentStore.price
      currentStore.regular_price = (parsed.regular_price !== undefined && parsed.regular_price !== null) ? Number(parsed.regular_price) : currentStore.regular_price
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

      hasChanged = prevSnapshot !== newSnapshot

      if (supabase && hasChanged) {
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
    }

    return {
      success: true,
      reply: parsed.reply || (isClarification ? 'কী পরিবর্তন করতে চান অনুগ্রহ করে একটু বিস্তারিত বলুন।' : 'আপনার নির্দেশনা অনুযায়ী সেকশনটি আপডেট করা হয়েছে!'),
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
      isClarification,
      hasChanged,
      store: currentStore
    }
  } catch (err: any) {
    console.error('Store editor error:', err)
    throw createError({ statusCode: 500, message: err?.message || 'AI Edit error' })
  }
})

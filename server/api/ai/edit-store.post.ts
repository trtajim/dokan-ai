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
  const { slug, instruction, history } = body

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

  // Ensure variants and stock are normalized on currentStore
  const existingVariants = Array.isArray(currentStore.variants) && currentStore.variants.length > 0
    ? currentStore.variants
    : (Array.isArray(currentStore.config?.variants) ? currentStore.config.variants : [])
  currentStore.variants = existingVariants

  const existingStock = currentStore.stock ?? currentStore.config?.stock ?? 20
  currentStore.stock = existingStock

  const currentReelUrl = currentStore.config?.video_reel_url || currentStore.video_reel_url || ''

  // Format recent chat history if provided (last 4-6 turns) to provide conversational continuity
  let conversationContext = ''
  if (Array.isArray(history) && history.length > 0) {
    const recent = history.slice(-5)
    const formatted = recent
      .map((h: any) => {
        const userText = h.prompt || h.user || h.message || ''
        const aiText = h.response || h.reply || h.ai || ''
        let turn = ''
        if (userText) turn += `Merchant: "${userText}"\n`
        if (aiText) turn += `Assistant: "${aiText}"\n`
        return turn
      })
      .filter(Boolean)
      .join('\n')

    if (formatted) {
      conversationContext = `\nRecent Conversation History:\n${formatted}\n`
    }
  }

  // Let generateAiContent handle all 6 Groq & Gemini rotation keys seamlessly
  try {
    const prompt = `You are "DokanAI Master Store Editor & Consultant".
The merchant is asking for modifications, design feedback, or questions about their live store.
${conversationContext}
Merchant's Current Message: "${instruction}"

Current Store Data:
- Product Title: "${currentStore.product_title}"
- Price: ${currentStore.price}
- Regular Price: ${currentStore.regular_price ?? currentStore.price}
- Stock: ${existingStock}
- Variants: ${JSON.stringify(existingVariants)}
- Current Theme Color: "${currentStore.theme_color || 'emerald'}" (Themes: amber, emerald, indigo, rose, slate)
- Show Urgency Top Bar: ${currentStore.config?.show_urgency_bar ?? true}
- Show Verified Badge: ${currentStore.config?.show_verified_badge ?? true}
- Show Video Reel: ${currentStore.config?.show_video_reel ?? true}
- Video Reel URL: "${currentReelUrl}"
- Show Testimonials / Reviews: ${currentStore.config?.show_testimonials ?? true}
- Show FAQs: ${currentStore.config?.show_faqs ?? true}
- Delivery Fee Inside Dhaka: ${currentStore.config?.delivery_fee_inside ?? currentStore.delivery_fee_inside ?? 70}
- Delivery Fee Outside Dhaka: ${currentStore.config?.delivery_fee_outside ?? currentStore.delivery_fee_outside ?? 130}
- Badge Text: "${currentStore.config?.badge_text ?? ''}"
- Seller Tagline: "${currentStore.config?.seller_tagline ?? ''}"
- CTA Button Text: "${currentStore.config?.cta_button_text ?? 'এখনই অর্ডার করুন'}"
- Headline: "${currentStore.config?.headline ?? ''}" (Must be punchy & compact, max 10-14 words, not a long paragraph)
- Subheadline: "${currentStore.config?.subheadline ?? ''}"
- Features: ${JSON.stringify(currentStore.config?.features ?? [])}
- Trust Badges: ${JSON.stringify(currentStore.config?.trust_badges ?? [])}
- FAQs: ${JSON.stringify(currentStore.config?.faqs ?? [])}
- Testimonials: ${JSON.stringify(currentStore.config?.testimonials ?? [])}

CRITICAL PRESERVATION & ISOLATION RULES (DO NOT INVENT UNREQUESTED CHANGES):
1. PRESERVE UNTOUCHED FIELDS:
   - When editing a specific item (for example, just the title or just the price), DO NOT change, reset, overwrite, or remove ANY other field.
   - VARIANTS: NEVER wipe out or empty the "variants" array! Unless the merchant explicitly asks to add, change, or remove product variants (weights, sizes, packs, options), preserve them EXACTLY as ${JSON.stringify(existingVariants)}.
   - VIDEO REEL: NEVER remove or alter the Video Reel URL ("video_reel_url") or toggle "show_video_reel" unless the merchant EXPLICITLY asks to change/remove the video reel. Keep "video_reel_url" exactly as "${currentReelUrl}" unless explicitly asked to change or clear it.
   - BUTTON & TAGS: Keep "cta_button_text" exactly as "${currentStore.config?.cta_button_text || 'এখনই অর্ডার করুন'}" unless the user explicitly asks to change the order/CTA button text.
   - Keep "badge_text" and "seller_tagline" exactly as their current values unless asked to edit them.
   - Keep "features", "trust_badges", "faqs", and "testimonials" arrays exactly as they are unless asked to add/edit/remove them.
   - Keep "regular_price" exactly as ${currentStore.regular_price ?? currentStore.price} unless asked to edit regular price or discount.

2. SPECIFIC INSTRUCTIONS:
   - Apply requested changes directly and decisively. You can customize EVERY SINGLE PIECE of text and setting WITHOUT touching or wiping out other unrelated sections.
   - In "reply", give a direct, friendly confirmation in natural Bengali of what was updated (e.g. "আপনার পণ্যের দাম পরিবর্তন করা হয়েছে।"). DO NOT ask annoying or unnecessary follow-up questions if the command was completed.
   - Provide 2 to 3 quick clickable next-step chips in "suggestions" array.

3. SECTION VISIBILITY:
   - Only toggle visibility when explicitly requested by the user:
   - If asked to hide/remove urgency bar, set "show_urgency_bar": false. Otherwise keep it ${currentStore.config?.show_urgency_bar ?? true}.
   - If asked to hide/remove verified badge, set "show_verified_badge": false. Otherwise keep it ${currentStore.config?.show_verified_badge ?? true}.
   - If asked to hide/remove video/reel, set "show_video_reel": false. Otherwise keep it ${currentStore.config?.show_video_reel ?? true}.
   - If asked to hide/remove testimonials/reviews or FAQs, set "show_testimonials": false or "show_faqs": false. Otherwise keep their current values.
   - NEVER hide a section by accident.

4. SCOPE BOUNDARIES & LIMITATIONS (WHAT THIS EDITOR CAN AND CANNOT DO):
   - THIS EDITOR IS ONLY FOR EDITING THIS EXISTING STORE.
   - CANNOT create a new store: If the merchant asks to create a brand new store/product (e.g., "নতুন স্টোর বানিয়ে দাও", "create a new store"), set "is_clarification": true. Explain politely in Bengali that this editor only modifies the current live store, and guide them to create a new store from the homepage (https://dokan.express or "/") or dashboard.
   - CANNOT process orders/dispatch couriers directly here: Explain politely where to find that in the dashboard.
   - BE DECISIVE (DO NOT OVER-ASK): If the merchant gives a clear command like "দাম ৫০০ করো" or "টাইটেল পরিবর্তন করো", DO NOT ask again or set "is_clarification": true. Execute the update immediately!
   - Only set "is_clarification": true if:
     a) The request is completely unintelligible or out of scope (like creating a new store, asking about personal life, etc.).
     b) The request is missing the actual value and literally impossible to guess (e.g., user only typed "change" without mentioning what or to what).

RETURN STRICT JSON ONLY:
{
  "reply": "clear confirmation in Bengali (or polite explanation if request is out of scope/unclear)",
  "is_clarification": boolean,
  "suggestions": ["suggested chip 1", "suggested chip 2", "suggested chip 3"],
  "product_title": "string",
  "price": number,
  "regular_price": number,
  "stock": number,
  "badge_text": "string (custom badge tag)",
  "seller_tagline": "string (custom seller short highlight)",
  "cta_button_text": "string (e.g. এখনই অর্ডার করুন or custom)",
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

    // Safeguard intent filters to prevent accidental deletion/overwriting
    const hasVariantIntent = /variant|ভ্যারিয়েন্ট|ভ্যারিয়েন্ট|সাইজ|ওজন|প্যাক|রং|color|size|weight|package|pack/i.test(instruction)
    let finalVariants = existingVariants
    if (hasVariantIntent) {
      if (Array.isArray(parsed.variants)) {
        finalVariants = parsed.variants
      }
    } else {
      if (Array.isArray(parsed.variants) && parsed.variants.length > 0) {
        finalVariants = parsed.variants
      } else {
        finalVariants = existingVariants
      }
    }

    const hasVideoIntent = /video|ভিডিও|রিল|reel|youtube|facebook/i.test(instruction)
    let finalVideoUrl = currentReelUrl
    if (hasVideoIntent) {
      finalVideoUrl = (parsed.video_reel_url !== undefined && parsed.video_reel_url !== null) ? parsed.video_reel_url : currentReelUrl
    } else {
      finalVideoUrl = (parsed.video_reel_url && typeof parsed.video_reel_url === 'string' && parsed.video_reel_url.trim()) ? parsed.video_reel_url : currentReelUrl
    }

    const hasUrgencyIntent = /urgency|অফার বার|offer bar|top bar|উপরের বার|লাল বার/i.test(instruction)
    const hasBadgeIntent = /verified|ভেরিফাইড|badge|ব্যাজ|সেলার|বিক্রেতা/i.test(instruction)
    const hasTestimonialIntent = /review|রিভিউ|testimonial|টেস্টিমোনিয়াল|মতামত|ক্রেতা/i.test(instruction)
    const hasFaqIntent = /faq|প্রশ্ন|উত্তর|accordion/i.test(instruction)

    const finalShowUrgencyBar = hasUrgencyIntent && typeof parsed.show_urgency_bar === 'boolean'
      ? parsed.show_urgency_bar
      : (currentStore.config?.show_urgency_bar ?? true)

    const finalShowVerifiedBadge = hasBadgeIntent && typeof parsed.show_verified_badge === 'boolean'
      ? parsed.show_verified_badge
      : (currentStore.config?.show_verified_badge ?? true)

    const finalShowVideoReel = hasVideoIntent && typeof parsed.show_video_reel === 'boolean'
      ? parsed.show_video_reel
      : (currentStore.config?.show_video_reel ?? true)

    const finalShowTestimonials = hasTestimonialIntent && typeof parsed.show_testimonials === 'boolean'
      ? parsed.show_testimonials
      : (currentStore.config?.show_testimonials ?? true)

    const finalShowFaqs = hasFaqIntent && typeof parsed.show_faqs === 'boolean'
      ? parsed.show_faqs
      : (currentStore.config?.show_faqs ?? true)

    const finalBadgeText = (parsed.badge_text !== undefined && parsed.badge_text !== null && parsed.badge_text.trim() !== '')
      ? parsed.badge_text
      : currentStore.config?.badge_text

    const finalSellerTagline = (parsed.seller_tagline !== undefined && parsed.seller_tagline !== null && parsed.seller_tagline.trim() !== '')
      ? parsed.seller_tagline
      : currentStore.config?.seller_tagline

    const finalCtaButtonText = (parsed.cta_button_text && parsed.cta_button_text.trim())
      ? parsed.cta_button_text
      : (currentStore.config?.cta_button_text || 'এখনই অর্ডার করুন')

    const finalRegularPrice = (parsed.regular_price !== undefined && parsed.regular_price !== null && Number(parsed.regular_price) > 0)
      ? Number(parsed.regular_price)
      : (currentStore.regular_price || currentStore.price)

    const updatedConfig = {
      ...currentStore.config,
      show_urgency_bar: finalShowUrgencyBar,
      show_verified_badge: finalShowVerifiedBadge,
      show_video_reel: finalShowVideoReel,
      show_testimonials: finalShowTestimonials,
      show_faqs: finalShowFaqs,
      headline: (parsed.headline && parsed.headline.trim()) || currentStore.config?.headline,
      subheadline: (parsed.subheadline && parsed.subheadline.trim()) || currentStore.config?.subheadline,
      delivery_fee_inside: (parsed.delivery_fee_inside !== undefined && parsed.delivery_fee_inside !== null) ? Number(parsed.delivery_fee_inside) : (currentStore.config?.delivery_fee_inside ?? currentStore.delivery_fee_inside ?? 70),
      delivery_fee_outside: (parsed.delivery_fee_outside !== undefined && parsed.delivery_fee_outside !== null) ? Number(parsed.delivery_fee_outside) : (currentStore.config?.delivery_fee_outside ?? currentStore.delivery_fee_outside ?? 130),
      badge_text: finalBadgeText,
      seller_tagline: finalSellerTagline,
      cta_button_text: finalCtaButtonText,
      video_reel_url: finalVideoUrl,
      features: (Array.isArray(parsed.features) && parsed.features.length > 0) ? parsed.features : currentStore.config?.features,
      trust_badges: (Array.isArray(parsed.trust_badges) && parsed.trust_badges.length > 0) ? parsed.trust_badges : currentStore.config?.trust_badges,
      faqs: (Array.isArray(parsed.faqs) && parsed.faqs.length > 0) ? parsed.faqs : currentStore.config?.faqs,
      testimonials: (Array.isArray(parsed.testimonials) && parsed.testimonials.length > 0) ? parsed.testimonials : currentStore.config?.testimonials,
      variants: finalVariants,
      stock: (parsed.stock !== undefined && parsed.stock !== null) ? Number(parsed.stock) : existingStock,
      pixel_id: parsed.pixel_id !== undefined ? parsed.pixel_id : currentStore.config?.pixel_id
    }

    const prevSnapshot = JSON.stringify({
      title: currentStore.product_title,
      price: currentStore.price,
      regular_price: currentStore.regular_price,
      theme_color: currentStore.theme_color,
      stock: currentStore.stock,
      variants: currentStore.variants,
      config: currentStore.config
    })

    const isClarification = Boolean(parsed.is_clarification)
    let hasChanged = false

    if (!isClarification) {
      currentStore.product_title = (parsed.product_title && parsed.product_title.trim()) || currentStore.product_title
      currentStore.price = (parsed.price !== undefined && parsed.price !== null) ? Number(parsed.price) : currentStore.price
      currentStore.regular_price = finalRegularPrice
      currentStore.theme_color = parsed.theme_color || currentStore.theme_color
      currentStore.stock = updatedConfig.stock
      currentStore.variants = finalVariants
      currentStore.config = updatedConfig

      const newSnapshot = JSON.stringify({
        title: currentStore.product_title,
        price: currentStore.price,
        regular_price: currentStore.regular_price,
        theme_color: currentStore.theme_color,
        stock: currentStore.stock,
        variants: currentStore.variants,
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

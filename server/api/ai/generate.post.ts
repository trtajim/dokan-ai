/**
 * AI Store Configuration Generator with Intelligent Image Placement and Reel Support
 */
import { memoryStore } from '../../utils/memoryStore'
import { getSupabaseClient } from '../../utils/supabase'
import { generateAiContent } from '../../utils/aiClient'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { 
    user_id,
    product_title, 
    price, 
    regular_price, 
    variants,
    stock,
    video_reel_url,
    delivery_fee_inside,
    delivery_fee_outside,
    description, 
    theme_color, 
    image_url,
    images
  } = body

  // Clean human-friendly slug without leading hyphen:
  const cleanTitle = (product_title || 'shop')
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .trim()
    .replace(/\s+/g, '')

  const randomNum = Math.floor(100000 + Math.random() * 900000)
  const slug = cleanTitle.length > 0 ? `${cleanTitle}${randomNum}` : `store${randomNum}`

  const config = useRuntimeConfig()
  const apiKey = config.geminiApiKey || process.env.GEMINI_API_KEY

  const insideFee = Number(delivery_fee_inside) || 70
  const outsideFee = Number(delivery_fee_outside) || 130
  const productPrice = Number(price) || 999
  const oldPrice = Number(regular_price) || Math.round(productPrice * 1.4)
  const initialStock = Number(stock) || 50

  const allImages = Array.isArray(images) && images.length > 0 
    ? images 
    : (image_url ? [image_url] : [])

  // Intelligent Image Placement: Hero image, Secondary image, and Trust image
  const heroImage = allImages[0] || null
  const secondaryImage = allImages.length > 1 ? allImages[1] : null
  const featureImage = allImages.length > 2 ? allImages[2] : (allImages.length > 1 ? allImages[1] : null)

  let generatedConfig: any = null

  try {
    const prompt = `You are Bangladesh's top e-commerce landing page copywriter and conversion strategist.
Generate an irresistible, emotionally persuasive sales page JSON in natural colloquial Bengali for:

Product: ${product_title}
Price: ৳${productPrice} (Original: ৳${oldPrice})
Delivery Charges: Inside Dhaka ৳${insideFee}, Outside Dhaka ৳${outsideFee} (COD)
Variants Info: ${JSON.stringify(variants || [])}
Reel / Video URL: "${video_reel_url || ''}"
Notes: ${description || '100% genuine with warranty'}
Selected Theme: ${theme_color || 'auto'}

AESTHETIC THEME COLOR SELECTION:
Pick the most aesthetic, high-converting color theme for this product in "theme_color":
- "amber" -> for honey, ghee, organic food, bakery, mustard oil, dry fruits, spices, tea
- "emerald" -> for nature/herbal, watches, luxury gadgets, plants, agricultural items, electronics
- "indigo" -> for tech devices, smart gadgets, footwear, denim, modern electronics, accessories
- "rose" -> for cosmetics, skincare, perfumes, jewelry, women fashion
- "slate" -> for industrial tools, hardware, automotive parts, minimalist dark items

CRITICAL HEADLINE & CONTENT RULES:
1. "headline" MUST BE COMPACT & PUNCHY: Maximum 10-14 words (1 to 2 lines max). Do NOT write a whole paragraph or huge run-on sentence as the headline!
2. Put the full detailed explanation and benefits inside "subheadline" (2 concise sentences).
3. "badge_text": A clean 2-4 word Bengali highlight tag directly relevant to this product.
4. "seller_tagline": A relevant, authentic short Bengali line directly specific to this product (e.g. for honey: pure wild honey assurance, for watch: original imported guarantee).
5. "faqs": GENERATE 3-4 HIGHLY REALISTIC, PRODUCT-SPECIFIC FAQS directly addressing genuine customer queries and trust doubts for "${product_title}".
   - For food/honey/agro (like মধু): Answer specific questions such as authenticity/purity assurance, whether it crystallizes (জমে যায় কিনা), sourcing/origin (সুন্দরবন বা পাহাড়ি), and delivery check. Do NOT put tech/device replacement policy ("৭ দিনের রিপ্লেসমেন্ট পলিসি") for honey/perishable foods! For honey, offer natural purity guarantee or return if found unpure.
   - For tech/electronics: Battery backup, water resistance, warranty, replacement.
   - For fashion/cosmetics: Original authenticity, ingredients/side effects, sizing/delivery.

Respond ONLY with a strictly valid JSON matching this schema:
{
        "headline": "Short, punchy, high-converting Bengali headline (max 10-14 words)",
        "subheadline": "2-sentence transformation explanation highlighting benefits and why order now",
        "badge_text": "A punchy, relevant 2-4 word Bengali highlight tag directly relevant to this product",
        "seller_tagline": "A relevant, authentic short Bengali line directly specific to this product",
        "urgency_text": "🔥 অফারটি সীমিত সময়ের জন্য! ক্যাশ অন ডেলিভারিতে অর্ডার করুন!",
        "video_reel_url": "${video_reel_url || ''}",
        "theme_color": "amber" | "emerald" | "indigo" | "rose" | "slate",
        "features": [
          { "title": "Feature 1 Bengali title", "desc": "Detailed emotional benefit description" },
          { "title": "Feature 2 Bengali title", "desc": "Detailed emotional benefit description" },
          { "title": "Feature 3 Bengali title", "desc": "Detailed emotional benefit description" },
          { "title": "Feature 4 Bengali title", "desc": "Detailed emotional benefit description" }
        ],
  "faqs": [
    { "q": "ডেলিভারি ম্যানের সামনে কি খুলে চেক করা যাবে?", "a": "হ্যাঁ, সম্পূর্ণ নিশ্চিত হয়ে চেক করে তারপর মূল্য পরিশোধ করবেন।" },
    { "q": "ডেলিভারি চার্জ কত এবং কতদিনে ডেলিভারি পাব?", "a": "ঢাকার ভেতরে ${insideFee} টাকা (২৪-৪৮ ঘণ্টা) এবং ঢাকার বাইরে ${outsideFee} টাকা (২-৩ দিন)।" },
    { "q": "পণ্যটির আসল বা খাঁটি হওয়ার কী নিশ্চয়তা দিচ্ছেন?", "a": "আমরা ১০০% অরিজিনাল ও গুণগত মান নিশ্চিত করি। কোয়ালিটিতে সন্দেহ থাকলে তৎক্ষণাৎ ফেরত দেওয়ার সুবিধা রয়েছে।" }
  ],
  "testimonials": [
    { "name": "তানভীর আহমেদ", "location": "ঢাকা", "comment": "যেমন চেয়েছিলাম ঠিক তেমনই পেয়েছি। প্যাকেজিং খুব ভালো ছিল।" },
    { "name": "মোঃ সাইদুল ইসলাম", "location": "সিলেট", "comment": "ক্যাশ অন ডেলিভারিতে চেক করে নিতে পেরে খুব ভালো লাগল।" }
  ]
}`

    const rawResponse = await generateAiContent({
      prompt,
      jsonMode: true
    })

    generatedConfig = JSON.parse(rawResponse || '{}')
  } catch (err: any) {
    console.warn('AI Generate Provider error, using fallback:', err?.message || err)
  }

  if (!generatedConfig || !generatedConfig.headline) {
    generatedConfig = {
      headline: `প্রিমিয়াম কোয়ালিটির ${product_title} - আপনার প্রতিদিনের বিশ্বস্ত সঙ্গী`,
      subheadline: `সেরা কোয়ালিটি, আকর্ষণীয় ফিনিশিং এবং দীর্ঘস্থায়ী পারফরম্যান্সের নিশ্চয়তা। এখনই অর্ডার করুন ক্যাশ অন ডেলিভারি ডিসকাউন্টে!`,
      badge_text: `অরিজিনাল কোয়ালিটি নিশ্চয়তা`,
      seller_tagline: `১০০% খাঁটি ও গুণগত মান সম্পন্ন`,
      urgency_text: `🔥 অফারটি সীমিত সময়ের জন্য! ক্যাশ অন ডেলিভারিতে অর্ডার করুন!`,
      video_reel_url: video_reel_url || '',
      features: [
        {
          title: 'সেরা বিল্ড কোয়ালিটি ও ফিনিশিং',
          desc: 'আন্তর্জাতিক মানের উপাদান দিয়ে তৈরি, যা দীর্ঘদিন ব্যবহারে নিখুঁত স্থায়িত্ব প্রদান করে।'
        },
        {
          title: 'সহজ ও আরামদায়ক ব্যবহার',
          desc: 'প্রতিদিনের জীবনযাত্রাকে আরও সহজ ও স্বাচ্ছন্দ্যময় করে তোলার জন্য ডিজাইন করা।'
        }
      ],
      faqs: [
        {
          q: 'আমি কি পণ্যটি দেখে নেওয়ার সুযোগ পাব?',
          a: 'অবশ্যই! ডেলিভারি ম্যানের উপস্থিতিতে পার্সেল চেক করে সন্তুষ্ট হলে টাকা পরিশোধ করবেন।'
        },
        {
          q: 'ডেলিভারি চার্জ কত এবং কতদিনে পাব?',
          a: `ঢাকার ভেতরে ডেলিভারি চার্জ মাত্র ৳${insideFee} এবং ঢাকার বাইরে ৳${outsideFee}।`
        }
      ],
      testimonials: [
        {
          name: 'তানভীর আহমেদ',
          location: 'ধানমন্ডি, ঢাকা',
          comment: 'যেমন চেয়েছিলাম ঠিক তেমনই পেয়েছি। প্যাকেজিং খুব ভালো ছিল এবং ডেলিভারি খুব দ্রুত হয়েছে।'
        }
      ]
    }
  }

  const normalizedVariants = Array.isArray(variants) && variants.length > 0 ? variants : []

  // Clean / embed YouTube / Facebook reel URL
  let cleanVideoEmbed = ''
  if (video_reel_url) {
    const ytMatch = video_reel_url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/))([\w-]{11})/)
    if (ytMatch && ytMatch[1]) {
      cleanVideoEmbed = `https://www.youtube.com/embed/${ytMatch[1]}`
    } else {
      cleanVideoEmbed = video_reel_url
    }
  }

  const finalThemeColor = generatedConfig?.theme_color || theme_color || 'emerald'
  generatedConfig.theme_color = finalThemeColor
  generatedConfig.delivery_fee_inside = insideFee
  generatedConfig.delivery_fee_outside = outsideFee
  generatedConfig.images = allImages
  generatedConfig.hero_image = heroImage
  generatedConfig.secondary_image = secondaryImage
  generatedConfig.feature_image = featureImage
  generatedConfig.stock = initialStock
  generatedConfig.variants = normalizedVariants
  generatedConfig.video_reel_url = cleanVideoEmbed
  generatedConfig.user_id = user_id || null

  const storeData = {
    id: 'store_' + Date.now(),
    slug,
    user_id: user_id || null,
    product_title: product_title || 'এক্সক্লুসিভ প্রোডাক্ট',
    price: productPrice,
    regular_price: oldPrice,
    stock: initialStock,
    variants: normalizedVariants,
    image_url: heroImage,
    images: allImages,
    delivery_fee_inside: insideFee,
    delivery_fee_outside: outsideFee,
    theme_color: finalThemeColor,
    config: generatedConfig,
    created_at: new Date().toISOString()
  }

  const supabase = getSupabaseClient()
  if (supabase) {
    try {
      await supabase.from('stores').insert({
        id: storeData.id,
        slug: storeData.slug,
        user_id: storeData.user_id,
        product_title: storeData.product_title,
        price: storeData.price,
        regular_price: storeData.regular_price,
        image_url: storeData.image_url,
        images: storeData.images,
        delivery_fee_inside: storeData.delivery_fee_inside,
        delivery_fee_outside: storeData.delivery_fee_outside,
        theme_color: storeData.theme_color,
        config: storeData.config
      })
    } catch (dbErr) {
      console.warn('Supabase insert warning:', dbErr)
    }
  }

  memoryStore.setStore(slug, storeData)

  return {
    success: true,
    store: storeData,
    store_url: `/s/${slug}`
  }
})

/**
 * AI Store Configuration Generator & Updater
 */
import { GoogleGenAI } from '@google/genai'
import { memoryStore } from '../../utils/memoryStore'
import { getSupabaseClient } from '../../utils/supabase'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { 
    user_id,
    product_title, 
    price, 
    regular_price, 
    delivery_fee_inside,
    delivery_fee_outside,
    description, 
    theme_color, 
    image_url,
    images
  } = body

  const slug = (product_title || 'shop')
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-') + '-' + Math.floor(1000 + Math.random() * 9000)

  const config = useRuntimeConfig()
  const apiKey = config.geminiApiKey || process.env.GEMINI_API_KEY

  const insideFee = Number(delivery_fee_inside) || 70
  const outsideFee = Number(delivery_fee_outside) || 130
  const productPrice = Number(price) || 999
  const oldPrice = Number(regular_price) || Math.round(productPrice * 1.4)

  const allImages = Array.isArray(images) && images.length > 0 
    ? images 
    : [image_url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80']

  let generatedConfig: any = null

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey })
      const prompt = `You are an elite direct-response e-commerce copywriter in Bangladesh.
Generate high-converting sales landing page content in persuasive Bengali for this product:

Product: ${product_title}
Offer Price: ${productPrice} BDT (Regular: ${oldPrice} BDT)
Delivery: Inside Dhaka ${insideFee} BDT, Outside Dhaka ${outsideFee} BDT (Cash on Delivery)
Notes / Highlights: ${description || '100% genuine with warranty'}
Theme: ${theme_color || 'emerald'}

Respond ONLY with a strictly valid JSON matching this schema:
{
  "headline": "Persuasive attention-grabbing headline in Bengali",
  "subheadline": "Benefit-driven 2-sentence description in Bengali",
  "urgency_text": "🔥 অফারটি আর মাত্র ১২ জনের জন্য প্রযোজ্য!",
  "trust_badges": [
    "ক্যাশ অন ডেলিভারি (পণ্য চেক করে মূল্য পরিশোধ)",
    "৭ দিনের সহজ রিপ্লেসমেন্ট পলিসি",
    "১০০% অরিজিনাল ও প্রিমিয়াম কোয়ালিটি"
  ],
  "features": [
    { "title": "Feature title in Bengali", "desc": "Detailed benefit description in Bengali" },
    { "title": "Feature title in Bengali", "desc": "Detailed benefit description in Bengali" },
    { "title": "Feature title in Bengali", "desc": "Detailed benefit description in Bengali" },
    { "title": "Feature title in Bengali", "desc": "Detailed benefit description in Bengali" }
  ],
  "faqs": [
    { "q": "ডেলিভারি ম্যানের সামনে কি খুলে দেখা যাবে?", "a": "হ্যাঁ, সম্পূর্ণ নিশ্চিত হয়ে চেক করে মূল্য পরিশোধ করবেন।" },
    { "q": "ডেলিভারি চার্জ কত এবং কতদিনে পাব?", "a": "ঢাকার ভেতরে ${insideFee} টাকা (২৪-৪৮ ঘণ্টা) এবং ঢাকার বাইরে ${outsideFee} টাকা (২-৩ দিন)।" },
    { "q": "কোন সমস্যা হলে রিপ্লেসমেন্ট পাব?", "a": "আমাদের রয়েছে ৭ দিনের সহজ ফ্রি রিপ্লেসমেন্ট পলিসি।" }
  ],
  "testimonials": [
    { "name": "কাস্টমারের নাম", "location": "ঢাকা / চট্টগ্রাম / সিলেট", "comment": "স্বাভাবিক ও বাস্তবসম্মত প্রশংসা রিভিউ" },
    { "name": "কাস্টমারের নাম", "location": "রাজশাহী / খুলনা / বরিশাল", "comment": "পণ্য ও সার্ভিসের সন্তুষ্টি রিভিউ" }
  ]
}`

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash-lite',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      })

      generatedConfig = JSON.parse(response.text || '{}')
    } catch (err: any) {
      console.error('Failed to generate with Gemini, using fallback:', err)
    }
  }

  if (!generatedConfig || !generatedConfig.headline) {
    generatedConfig = {
      headline: `প্রিমিয়াম কোয়ালিটির ${product_title} - আপনার প্রতিদিনের বিশ্বস্ত সঙ্গী`,
      subheadline: `সেরা কোয়ালিটি, আকর্ষণীয় ডিজাইন এবং দীর্ঘস্থায়ী পারফরম্যান্সের নিশ্চয়তা। এখনই অর্ডার করুন এবং উপভোগ করুন স্পেশাল ক্যাশ অন ডেলিভারি ডিসকাউন্ট!`,
      urgency_text: `🔥 স্টক সীমিত! আজকের স্পেশাল ডিসকাউন্টে আর মাত্র ১১ টি বাকি আছে!`,
      trust_badges: [
        'ক্যাশ অন ডেলিভারি (পণ্য দেখে মূল্য পরিশোধ)',
        '৭ দিনের ফ্রি রিপ্লেসমেন্ট সুবিধা',
        '১০০% অরিজিনাল ও অথেন্টিক প্রোডাক্ট'
      ],
      features: [
        {
          title: 'সেরা বিল্ড কোয়ালিটি ও ফিনিশিং',
          desc: 'আন্তর্জাতিক মানের উপাদান দিয়ে তৈরি, যা দীর্ঘদিন ব্যবহারে নিখুঁত স্থায়িত্ব প্রদান করে।'
        },
        {
          title: 'সহজ ও আরামদায়ক ব্যবহার',
          desc: 'প্রতিদিনের জীবনযাত্রাকে আরও সহজ ও স্বাচ্ছন্দ্যময় করে তোলার জন্য বিশেষভাবে ডিজাইন করা।'
        },
        {
          title: '১০০% পরীক্ষিত ও নিরাপদ',
          desc: 'গুণগত মান যাচাইয়ের প্রতিটি ধাপে উত্তীর্ণ, তাই নিশ্চিন্তে ব্যবহার করতে পারেন।'
        },
        {
          title: 'সেরা ভ্যালু ফর মানি',
          desc: 'বাজারে বিদ্যমান সমমানের অন্যান্য পণ্যের চেয়ে সাশ্রয়ী মূল্যে সেরা সুযোগ।'
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
        },
        {
          q: 'পছন্দ না হলে বা ত্রুটি থাকলে কি করব?',
          a: 'আমাদের রয়েছে ৭ দিনের সহজ রিপ্লেসমেন্ট পলিসি। যেকোনো সমস্যায় যোগাযোগ করলেই ব্যবস্থা নেওয়া হবে।'
        }
      ],
      testimonials: [
        {
          name: 'তানভীর আহমেদ',
          location: 'ধানমন্ডি, ঢাকা',
          comment: 'যেমন চেয়েছিলাম ঠিক তেমনই পেয়েছি। প্যাকেজিং খুব ভালো ছিল এবং ডেলিভারি খুব দ্রুত হয়েছে।'
        },
        {
          name: 'মোঃ সাইদুর রহমান',
          location: 'আগ্রাবাদ, চট্টগ্রাম',
          comment: 'ক্যাশ অন ডেলিভারিতে চেক করে নিতে পেরে খুব ভালো লাগল। সেলারের রেসপন্সও খুব আন্তরিক ছিল।'
        }
      ]
    }
  }

  // Store custom delivery fee inside config as well to ensure full forward-compatibility
  generatedConfig.delivery_fee_inside = insideFee
  generatedConfig.delivery_fee_outside = outsideFee
  generatedConfig.images = allImages
  generatedConfig.user_id = user_id || 'guest_merchant_demo'

  const storeData = {
    id: 'store_' + Date.now(),
    slug,
    user_id: user_id || 'guest_merchant_demo',
    product_title: product_title || 'এক্সক্লুসিভ প্রোডাক্ট',
    price: productPrice,
    regular_price: oldPrice,
    image_url: allImages[0],
    images: allImages,
    delivery_fee_inside: insideFee,
    delivery_fee_outside: outsideFee,
    theme_color: theme_color || 'emerald',
    config: generatedConfig,
    created_at: new Date().toISOString()
  }

  // Save to Supabase (only existing schema columns)
  const supabase = getSupabaseClient()
  if (supabase) {
    try {
      await supabase.from('stores').insert({
        id: storeData.id,
        slug: storeData.slug,
        product_title: storeData.product_title,
        price: storeData.price,
        regular_price: storeData.regular_price,
        image_url: storeData.image_url,
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
    store_url: `/shop/${slug}`
  }
})

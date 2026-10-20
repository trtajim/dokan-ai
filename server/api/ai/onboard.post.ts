/**
 * DokanAI Onboarding Conversation Handler
 * State-Synchronized Architecture:
 * 1. Conversational Pass: Natural Bengali response (100% plain text, never crashes on JSON syntax/keys).
 * 2. Document Patch Pass: Accepts currentState, compares it with the ongoing dialogue, and emits a fully updated state document.
 */
import { generateAiChat } from '../../utils/aiClient'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { messages, userMessage, currentState, uploadedImagesCount } = body

  // Format valid multi-turn chat history
  const chatHistory: { role: 'user' | 'assistant'; content: string }[] = []

  if (Array.isArray(messages)) {
    for (const m of messages) {
      if (!m || !m.content) continue
      const role: 'user' | 'assistant' = (m.role === 'user') ? 'user' : 'assistant'
      chatHistory.push({
        role,
        content: String(m.content)
      })
    }
  }

  // Ensure current user message is appended if not already the latest
  const lastMsg = chatHistory[chatHistory.length - 1]
  if (!lastMsg || lastMsg.role !== 'user' || lastMsg.content !== userMessage) {
    if (userMessage) {
      chatHistory.push({
        role: 'user',
        content: String(userMessage)
      })
    }
  }

  // Current state baseline with sensible defaults
  const workingState = {
    product_title: currentState?.product_title || null,
    price: currentState?.price ? Number(currentState.price) : null,
    regular_price: currentState?.regular_price ? Number(currentState.regular_price) : null,
    stock: currentState?.stock ? Number(currentState.stock) : 50,
    delivery_fee_inside: currentState?.delivery_fee_inside != null ? Number(currentState.delivery_fee_inside) : 70,
    delivery_fee_outside: currentState?.delivery_fee_outside != null ? Number(currentState.delivery_fee_outside) : 130,
    video_reel_url: currentState?.video_reel_url || null,
    variants: Array.isArray(currentState?.variants) ? currentState.variants : [],
    theme_color: currentState?.theme_color || 'emerald'
  }

  // PASS 1: Natural Conversational Response
  const chatSystemPrompt = `You are "DokanAI Assistant" (দোকান এআই), an expert conversational e-commerce consultant for Bangladeshi single-product Cash-on-Delivery (COD) stores.

CONTEXT:
- Total user uploaded images attached so far: ${uploadedImagesCount || 0}
- If images count > 0, acknowledge receipt of pictures with enthusiasm.

CRITICAL INSTRUCTIONS:
1. ASK ONLY ONE QUESTION AT A TIME. DO NOT send a giant list of questions or numbered questionnaire!
2. Speak in warm, concise, friendly Bengali (colloquial and direct, 1-3 short sentences max).
3. Do NOT output JSON or markdown codeblocks. Just plain natural conversational text.
4. If the user asks to CHANGE or UPDATE anything (e.g. name, price, variants, delivery fee, stock):
   - Acknowledge their change warmly and confirm that you've updated it!
   - (e.g. "ঠিক আছে, প্রোডাক্টের নাম খাঁটি মধু করে দিলাম!", "ডেলিভারি চার্জ ঢাকায় ৫০ টাকা ও বাইরে ৯০ টাকা সেট করলাম!")

STEP-BY-STEP PROGRESSION:
- Step 1: Product Name -> Acknowledge enthusiastically, then ask ONLY for the Offer Price (৳) and if there are any variants/weights/sizes (e.g. 1kg vs 2kg or M/L).
- Step 2: Price/Variants -> Acknowledge, then ask them to upload product pictures using the paperclip (📎) icon or Ctrl+V.
- Step 3: Pictures Uploaded -> Acknowledge the photos! Then ask separately if they have a Facebook Reel or YouTube Shorts video link.
- Step 4: Reel Answered -> When the user replies with a video link OR confirms they don't have one (e.g. "nei", "na", "no"), invite them to review the information below and launch their store!
- Any Question / Clarification -> Answer and clarify simply and patiently.`

  let conversationalReply = ''
  try {
    conversationalReply = await generateAiChat({
      systemPrompt: chatSystemPrompt,
      messages: chatHistory,
      jsonMode: false
    })
  } catch (err: any) {
    console.warn('[AI Conversational Pass Warning]:', err?.message || err)
    conversationalReply = 'আপনার তথ্য পেয়েছি। বিস্তারিত দেখে নিন।'
  }

  // PASS 2: State Document Patch Operator
  let readyToGenerate = false

  try {
    const patchSystemPrompt = `You are a state-patch compiler for DokanAI.
Your job is to update the JSON store configuration document based on the latest chat dialogue.

CURRENT BASELINE STATE:
${JSON.stringify(workingState, null, 2)}

UPLOADED IMAGES COUNT: ${uploadedImagesCount || 0}

INSTRUCTIONS:
1. Examine the user's latest messages and the AI response.
2. If the user provided or updated ANY field, update it:
   - "product_title": updated name (e.g. if user says "nam change kore khati modhu dao", set to "খাঁটি মধু")
   - "price": updated number (e.g. 500)
   - "regular_price": updated number or null
   - "stock": updated number (e.g. if user says "stock 40 ta rakho", set to 40)
   - "delivery_fee_inside": updated number (e.g. if user says "50 tk dhakay", set to 50)
   - "delivery_fee_outside": updated number (e.g. if user says "bahire 90 taka", set to 90)
   - "video_reel_url": URL if provided, otherwise preserve baseline
   - "variants": array of [{"name": string, "price": number}]
   - "theme_color": pick the most aesthetic matching theme for this product category from:
     * 'amber' (honey, organic food, bakery, leather, oil, tea, spices)
     * 'emerald' (herbal, green products, watches, luxury, plants, agriculture)
     * 'indigo' (tech, smart electronics, gadgets, modern apparel, footwear)
     * 'rose' (cosmetics, skincare, jewelry, perfume, feminine fashion)
     * 'slate' (automotive, tools, industrial, minimalist hardware)
3. Retain existing baseline values if the user did NOT request to change them.
4. "readyToGenerate" condition:
   - Must be true ONLY AFTER:
     a) product_title is known
     b) price is known
     c) pictures are uploaded (${uploadedImagesCount || 0} > 0)
     d) user has responded to the reel inquiry (either provided a URL or explicitly replied with "no", "na", "nei", or sent their response).
   - "readyToGenerate" MUST BE FALSE while DokanAI is currently ASKING about the reel or waiting for the user's answer!
   - If user is asking a question or clarifying, set readyToGenerate to false.

OUTPUT STRICT JSON ONLY:
{
  "product_title": string or null,
  "price": number or null,
  "regular_price": number or null,
  "stock": number,
  "delivery_fee_inside": number,
  "delivery_fee_outside": number,
  "video_reel_url": string or null,
  "variants": [{"name": string, "price": number}],
  "theme_color": "amber" | "emerald" | "indigo" | "rose" | "slate",
  "readyToGenerate": boolean
}`

    const patchRes = await generateAiChat({
      systemPrompt: patchSystemPrompt,
      messages: [
        ...chatHistory,
        { role: 'assistant', content: conversationalReply }
      ],
      jsonMode: false
    })

    let cleanJson = (patchRes || '').trim()
    if (cleanJson.startsWith('```')) {
      cleanJson = cleanJson.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
    }
    const jsonMatch = cleanJson.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      if (parsed) {
        if (parsed.product_title !== undefined && parsed.product_title !== null) {
          workingState.product_title = String(parsed.product_title).trim()
        }
        if (parsed.price !== undefined && parsed.price !== null) {
          workingState.price = Number(parsed.price)
        }
        if (parsed.regular_price !== undefined && parsed.regular_price !== null) {
          workingState.regular_price = Number(parsed.regular_price)
        }
        if (parsed.stock !== undefined && parsed.stock !== null && !isNaN(Number(parsed.stock))) {
          workingState.stock = Number(parsed.stock)
        }
        if (parsed.delivery_fee_inside !== undefined && parsed.delivery_fee_inside !== null && !isNaN(Number(parsed.delivery_fee_inside))) {
          workingState.delivery_fee_inside = Number(parsed.delivery_fee_inside)
        }
        if (parsed.delivery_fee_outside !== undefined && parsed.delivery_fee_outside !== null && !isNaN(Number(parsed.delivery_fee_outside))) {
          workingState.delivery_fee_outside = Number(parsed.delivery_fee_outside)
        }
        if (parsed.video_reel_url) {
          workingState.video_reel_url = String(parsed.video_reel_url).trim()
        }
        if (Array.isArray(parsed.variants)) {
          workingState.variants = parsed.variants
        }
        if (parsed.theme_color && ['amber', 'emerald', 'indigo', 'rose', 'slate'].includes(parsed.theme_color)) {
          workingState.theme_color = parsed.theme_color
        }
        if (parsed.readyToGenerate !== undefined) {
          readyToGenerate = Boolean(parsed.readyToGenerate)
        }
      }
    }
  } catch (patchErr) {
    console.warn('[AI State Patch Pass Warning]:', patchErr)
  }

  // Direct regex safety check for links in latest message
  if (userMessage) {
    const urlMatch = userMessage.match(/https?:\/\/[^\s]+/)
    if (urlMatch) {
      workingState.video_reel_url = urlMatch[0]
    }
  }

  return {
    success: true,
    reply: conversationalReply || 'আপনার তথ্য আপডেট করা হয়েছে।',
    readyToGenerate,
    extractedData: workingState
  }
})

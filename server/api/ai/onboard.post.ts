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
    variants: Array.isArray(currentState?.variants) ? currentState.variants : []
  }

  // PASS 1: Natural Conversational Response
  const chatSystemPrompt = `You are "DokanAI Assistant" (দোকান এআই), an expert conversational e-commerce consultant for Bangladeshi single-product Cash-on-Delivery (COD) stores.

CRITICAL INSTRUCTIONS:
1. ASK ONLY ONE QUESTION AT A TIME. DO NOT send a giant list of questions or numbered questionnaire!
2. Speak in warm, concise, friendly Bengali (colloquial and direct, 1-3 short sentences max).
3. Do NOT output JSON or markdown codeblocks. Just plain natural conversational text.
4. If the user asks to CHANGE or UPDATE anything (e.g. name, price, variants, delivery fee, stock):
   - Acknowledge their change warmly and confirm that you've updated it!
   - (e.g. "ঠিক আছে, প্রোডাক্টের নাম খাঁটি মধু করে দিলাম!", "ডেলিভারি চার্জ ঢাকায় ৫০ টাকা ও বাইরে ৯০ টাকা সেট করলাম!")

STEP-BY-STEP PROGRESSION:
- If user provides Product Name: Acknowledge enthusiastically, then ask ONLY for the Offer Price (৳) and if there are any variants/weights/sizes (e.g. 1kg vs 2kg or M/L).
- If user provides Price/Variants: Acknowledge, then ask them to upload product pictures using the paperclip (📎) icon or Ctrl+V.
- If user asks a question, is confused, or says "ki?": Answer and clarify simply and patiently.
- If user uploads pictures: Separately ask if they have a Facebook Reel or YouTube Shorts link.
- If user says they have a reel: Ask them to paste the link.
- If user has answered all questions or updated info: Let them know the details are updated, and invite them to review the information below and launch their store!`

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
3. Retain existing baseline values if the user did NOT request to change them.
4. "readyToGenerate" condition:
   - Must be true IF product_title is known AND price is known AND (has pictures OR pictures were uploaded) AND reel was either linked or declined/asked.
   - If user is currently in the middle of clarifying or asking a question, set readyToGenerate to false.

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

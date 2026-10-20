/**
 * DokanAI Onboarding Conversation Handler
 * Dual-Pass Architecture:
 * 1. Conversational Pass: Natural Bengali response (100% plain text, never crashes on JSON syntax/keys).
 * 2. Background Extraction Pass: Structured e-commerce data extraction.
 */
import { generateAiChat } from '../../utils/aiClient'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { messages, userMessage } = body

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

  // PASS 1: Natural Conversational Response (Plain text, zero JSON formatting risk)
  const chatSystemPrompt = `You are "DokanAI Assistant" (দোকান এআই), an expert conversational e-commerce consultant for Bangladeshi single-product Cash-on-Delivery (COD) stores.

CRITICAL INSTRUCTIONS:
1. ASK ONLY ONE QUESTION AT A TIME. DO NOT send a giant list of questions or numbered questionnaire!
2. Speak in warm, concise, friendly Bengali (colloquial and direct, 2-3 short sentences max).
3. Do NOT output JSON or markdown codeblocks. Just plain natural conversational text.

STEP-BY-STEP PROGRESSION:
- If user provides Product Name: Acknowledge enthusiastically, then ask ONLY for the Offer Price (৳) and if there are any variants/weights/sizes (e.g. 1kg vs 2kg or M/L).
- If user provides Price/Variants: Acknowledge, then ask them to upload product pictures using the paperclip (📎) icon or Ctrl+V.
- If user asks a question, is confused, or says "ki?": Answer and clarify simply and patiently.
- If user uploads pictures: Separately ask if they have a Facebook Reel or YouTube Shorts link.
- If user says they have a reel: Ask them to paste the link.
- If user has answered all questions: Congratulate them and invite them to review the information below and launch their store!`

  let conversationalReply = ''
  try {
    conversationalReply = await generateAiChat({
      systemPrompt: chatSystemPrompt,
      messages: chatHistory,
      jsonMode: false
    })
  } catch (err: any) {
    console.warn('[AI Conversational Pass Warning]:', err?.message || err)
    conversationalReply = 'দারুণ! আপনার তথ্যটি পেয়েছি। প্রোডাক্টের বিস্তারিত তথ্য লিখে জানান।'
  }

  // PASS 2: Background Data Extractor
  let extractedData: any = {
    product_title: null,
    price: null,
    regular_price: null,
    video_reel_url: null,
    variants: [],
    delivery_fee_inside: 70,
    delivery_fee_outside: 130
  }
  let readyToGenerate = false

  try {
    const extractSystemPrompt = `Analyze this conversation between a merchant and DokanAI.
Extract product details into valid JSON only. No markdown fences.
Schema:
{
  "product_title": "string or null",
  "price": number or null,
  "regular_price": number or null,
  "video_reel_url": "string or null",
  "variants": [{"name": "string", "price": number}],
  "has_pictures_in_chat": boolean,
  "has_reel_discussed": boolean,
  "readyToGenerate": boolean
}
Note: "readyToGenerate" is true ONLY when product_title, price, and pictures are provided, AND reel has been either linked or declined.`

    const extractRes = await generateAiChat({
      systemPrompt: extractSystemPrompt,
      messages: [
        ...chatHistory,
        { role: 'assistant', content: conversationalReply }
      ],
      jsonMode: false
    })

    let cleanJson = (extractRes || '').trim()
    if (cleanJson.startsWith('```')) {
      cleanJson = cleanJson.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
    }
    const jsonMatch = cleanJson.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      if (parsed) {
        if (parsed.product_title) extractedData.product_title = parsed.product_title
        if (parsed.price) extractedData.price = Number(parsed.price)
        if (parsed.regular_price) extractedData.regular_price = Number(parsed.regular_price)
        if (parsed.video_reel_url) extractedData.video_reel_url = parsed.video_reel_url
        if (Array.isArray(parsed.variants)) extractedData.variants = parsed.variants
        readyToGenerate = Boolean(parsed.readyToGenerate)
      }
    }
  } catch (extractErr) {
    // Extraction pass should never break the chat
    console.warn('[AI Background Extraction Pass Warning]:', extractErr)
  }

  // Check URL in user message directly as safeguard
  if (!extractedData.video_reel_url && userMessage) {
    const urlMatch = userMessage.match(/https?:\/\/[^\s]+/)
    if (urlMatch) {
      extractedData.video_reel_url = urlMatch[0]
    }
  }

  // Ensure default delivery fees
  extractedData.delivery_fee_inside = 70
  extractedData.delivery_fee_outside = 130

  return {
    success: true,
    reply: conversationalReply || 'আপনার তথ্য পেয়েছি। অনুগ্রহ করে পরবর্তী তথ্যটি দিন।',
    readyToGenerate,
    extractedData
  }
})

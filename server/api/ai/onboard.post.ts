/**
 * DokanAI Onboarding Conversation Handler
 * Powered directly by Groq / Gemini LLMs without hardcoded conversational mocks.
 */
import { generateAiChat } from '../../utils/aiClient'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { messages, userMessage } = body

  // Format valid multi-turn chat history for OpenAI / Groq / Gemini
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

  const systemPrompt = `You are "DokanAI Assistant" (দোকান এআই), a conversational AI store consultant helping Bangladeshi merchants build a single-product Cash-on-Delivery (COD) landing page.

CONVERSATION PRINCIPLES:
1. Speak in friendly, natural colloquial Bengali (Banglish/Bengali understood).
2. Answer ANY question, confusion, clarification, or objection the user has naturally.
3. Your goal is to collect:
   - Product title / name
   - Offer price & variants (if any)
   - Product pictures (uploaded via clip or pasted)
   - Reel / video link (Facebook Reel or YouTube Shorts, optional)
4. Default delivery fee is always ৳70 (Inside Dhaka) and ৳130 (Outside Dhaka). Do NOT ask for delivery fees unless the merchant wants to customize it.
5. "readyToGenerate" condition:
   - ONLY set "readyToGenerate": true when product name, pricing, and pictures have been provided, AND the reel question has either been answered (with a link or saying they don't have one).
   - If the user asks a question (like "ki?", "kiser chobi?", "kivabe dibo?"), is confused, wants to add or change something, or says "reel ache": DO NOT set readyToGenerate to true! Set "readyToGenerate": false and guide them conversationally.

RESPONSE FORMAT:
You MUST respond with a valid JSON object only. No markdown fences around it.
{
  "reply": "Your natural Bengali conversational response to the user",
  "readyToGenerate": boolean,
  "extractedData": {
    "product_title": "string or null",
    "price": number or null,
    "regular_price": number or null,
    "video_reel_url": "string or null",
    "variants": [
      { "name": "string", "price": number }
    ],
    "delivery_fee_inside": 70,
    "delivery_fee_outside": 130,
    "theme_color": "emerald"
  }
}`

  try {
    const rawResponse = await generateAiChat({
      systemPrompt,
      messages: chatHistory,
      jsonMode: true
    })

    // Clean any markdown code blocks or wrapper whitespace
    let cleanJson = (rawResponse || '').trim()
    if (cleanJson.startsWith('```')) {
      cleanJson = cleanJson.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
    }
    const jsonMatch = cleanJson.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      cleanJson = jsonMatch[0]
    }

    const parsed = JSON.parse(cleanJson)

    // Ensure delivery fees default correctly
    if (!parsed.extractedData) {
      parsed.extractedData = {}
    }
    if (parsed.extractedData.delivery_fee_inside == null) parsed.extractedData.delivery_fee_inside = 70
    if (parsed.extractedData.delivery_fee_outside == null) parsed.extractedData.delivery_fee_outside = 130

    return {
      success: true,
      reply: parsed.reply || 'আমি বুঝতে পেরেছি। দয়া করে পরবর্তী তথ্যটি দিন।',
      readyToGenerate: Boolean(parsed.readyToGenerate),
      extractedData: parsed.extractedData
    }
  } catch (err: any) {
    console.error('[AI Onboard Error]', err)
    // If the entire 6-key rotation fails, return error rather than faking dialogue
    return {
      success: false,
      reply: 'সার্ভারে সাময়িক সমস্যা হচ্ছে। অনুগ্রহ করে আরেকবার চেষ্টা করুন।',
      readyToGenerate: false,
      extractedData: {}
    }
  }
})

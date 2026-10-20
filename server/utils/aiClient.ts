/**
 * Unified AI Client Provider
 * Switches strictly between 'gemini' and 'groq' via AI_PROVIDER env variable.
 */
import { GoogleGenAI } from '@google/genai'
import Groq from 'groq-sdk'

export interface AiTextOptions {
  systemPrompt?: string
  prompt: string
  jsonMode?: boolean
}

export interface AiChatMessage {
  role: 'user' | 'model' | 'assistant'
  content: string
}

export interface AiChatOptions {
  systemPrompt: string
  messages: AiChatMessage[]
  jsonMode?: boolean
}

export const getAiProvider = () => {
  const config = useRuntimeConfig()
  const provider = (process.env.AI_PROVIDER || config.aiProvider || 'gemini').toLowerCase().trim()
  return provider === 'groq' ? 'groq' : 'gemini'
}

export const generateAiContent = async (options: AiTextOptions): Promise<string> => {
  const provider = getAiProvider()
  const config = useRuntimeConfig()

  if (provider === 'groq') {
    const groqKey = process.env.GROQ_API_KEY || config.groqApiKey
    if (!groqKey) {
      throw new Error('GROQ_API_KEY is not set in environment')
    }

    const groq = new Groq({ apiKey: groqKey })
    const messages: any[] = []
    if (options.systemPrompt) {
      messages.push({ role: 'system', content: options.systemPrompt })
    }
    messages.push({ role: 'user', content: options.prompt })

    const completion = await groq.chat.completions.create({
      model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
      messages,
      response_format: options.jsonMode ? { type: 'json_object' } : undefined,
      temperature: 0.6
    })

    return completion.choices[0]?.message?.content || ''
  }

  // Default: Gemini
  const geminiKey = process.env.GEMINI_API_KEY || config.geminiApiKey
  if (!geminiKey) {
    throw new Error('GEMINI_API_KEY is not set in environment')
  }

  const ai = new GoogleGenAI({ apiKey: geminiKey })
  const contents: any[] = []
  if (options.systemPrompt) {
    contents.push({ role: 'user', parts: [{ text: options.systemPrompt }] })
  }
  contents.push({ role: 'user', parts: [{ text: options.prompt }] })

  const response = await ai.models.generateContent({
    model: 'gemini-3.5-flash-lite',
    contents,
    config: options.jsonMode ? { responseMimeType: 'application/json' } : undefined
  })

  return response.text || ''
}

export const generateAiChat = async (options: AiChatOptions): Promise<string> => {
  const provider = getAiProvider()
  const config = useRuntimeConfig()

  if (provider === 'groq') {
    const groqKey = process.env.GROQ_API_KEY || config.groqApiKey
    if (!groqKey) {
      throw new Error('GROQ_API_KEY is not set in environment')
    }

    const groq = new Groq({ apiKey: groqKey })
    const messages: any[] = [
      { role: 'system', content: options.systemPrompt }
    ]

    options.messages.forEach(m => {
      messages.push({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content
      })
    })

    const completion = await groq.chat.completions.create({
      model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
      messages,
      response_format: options.jsonMode ? { type: 'json_object' } : undefined,
      temperature: 0.6
    })

    return completion.choices[0]?.message?.content || ''
  }

  // Default: Gemini
  const geminiKey = process.env.GEMINI_API_KEY || config.geminiApiKey
  if (!geminiKey) {
    throw new Error('GEMINI_API_KEY is not set in environment')
  }

  const ai = new GoogleGenAI({ apiKey: geminiKey })
  const contents: any[] = [
    { role: 'user', parts: [{ text: options.systemPrompt }] }
  ]

  options.messages.forEach(m => {
    contents.push({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }]
    })
  })

  const response = await ai.models.generateContent({
    model: 'gemini-3.5-flash-lite',
    contents,
    config: options.jsonMode ? { responseMimeType: 'application/json' } : undefined
  })

  return response.text || ''
}

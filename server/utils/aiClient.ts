/**
 * DokanAI Resilient Multi-Provider & Multi-Key AI Client
 * 
 * Features:
 * - 3 Groq Keys + 3 Gemini Keys support (up to 6 API keys total).
 * - Priority determined by AI_PROVIDER ('groq' or 'gemini', default: 'groq').
 *   - If 'groq': Groq Key 1 -> Groq Key 2 -> Groq Key 3 -> Gemini Key 1 -> Gemini Key 2 -> Gemini Key 3
 *   - If 'gemini': Gemini Key 1 -> Gemini Key 2 -> Gemini Key 3 -> Groq Key 1 -> Groq Key 2 -> Groq Key 3
 * - Automatic failover: If rate-limited (429), quota exceeded, or error, seamlessly rolls to the next key.
 * - Primary Groq Model: 'qwen/qwen3.8-27b' (proven fast, excellent Bengali quality, no blank reasoning output).
 * - Primary Gemini Model: 'gemini-2.5-flash' (or fallback to 'gemini-1.5-flash').
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

interface KeyConfig {
  provider: 'groq' | 'gemini'
  key: string
  label: string
}

const getKeys = (): KeyConfig[] => {
  const config = useRuntimeConfig()

  // Collect Groq Keys
  const groqKeys: string[] = [
    process.env.GROQ_API_KEY || (config.groqApiKey as string) || '',
    process.env.GROQ_API_KEY_2 || (config.groqApiKey2 as string) || '',
    process.env.GROQ_API_KEY_3 || (config.groqApiKey3 as string) || ''
  ].map(k => k.trim()).filter(Boolean)

  // Default fallback hardcoded if none provided
  if (groqKeys.length === 0) {
    groqKeys.push('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')
  }

  // Collect Gemini Keys
  const geminiKeys: string[] = [
    process.env.GEMINI_API_KEY || (config.geminiApiKey as string) || '',
    process.env.GEMINI_API_KEY_2 || (config.geminiApiKey2 as string) || '',
    process.env.GEMINI_API_KEY_3 || (config.geminiApiKey3 as string) || ''
  ].map(k => k.trim()).filter(Boolean)

  const groqConfigList: KeyConfig[] = groqKeys.map((k, idx) => ({
    provider: 'groq',
    key: k,
    label: `Groq-Key-${idx + 1}`
  }))

  const geminiConfigList: KeyConfig[] = geminiKeys.map((k, idx) => ({
    provider: 'gemini',
    key: k,
    label: `Gemini-Key-${idx + 1}`
  }))

  const preferred = (process.env.AI_PROVIDER || (config.aiProvider as string) || 'groq').toLowerCase().trim()

  if (preferred === 'gemini') {
    return [...geminiConfigList, ...groqConfigList]
  }

  // Default: groq first, then gemini
  return [...groqConfigList, ...geminiConfigList]
}

async function callGroqContent(apiKey: string, options: AiTextOptions): Promise<string> {
  const groq = new Groq({ apiKey })
  const messages: any[] = []
  if (options.systemPrompt) {
    messages.push({ role: 'system', content: options.systemPrompt })
  }
  messages.push({ role: 'user', content: options.prompt })

  const model = process.env.GROQ_MODEL || 'qwen/qwen3.8-27b'
  const completion = await groq.chat.completions.create({
    model,
    messages,
    response_format: options.jsonMode ? { type: 'json_object' } : undefined,
    temperature: 0.6,
    max_tokens: 1500
  })

  return completion.choices[0]?.message?.content || ''
}

async function callGroqChat(apiKey: string, options: AiChatOptions): Promise<string> {
  const groq = new Groq({ apiKey })
  const messages: any[] = [
    { role: 'system', content: options.systemPrompt }
  ]

  options.messages.forEach(m => {
    messages.push({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.content
    })
  })

  const model = process.env.GROQ_MODEL || 'qwen/qwen3.8-27b'
  const completion = await groq.chat.completions.create({
    model,
    messages,
    response_format: options.jsonMode ? { type: 'json_object' } : undefined,
    temperature: 0.6,
    max_tokens: 1500
  })

  return completion.choices[0]?.message?.content || ''
}

async function callGeminiContent(apiKey: string, options: AiTextOptions): Promise<string> {
  const ai = new GoogleGenAI({ apiKey })
  const contents: any[] = []
  if (options.systemPrompt) {
    contents.push({ role: 'user', parts: [{ text: options.systemPrompt }] })
  }
  contents.push({ role: 'user', parts: [{ text: options.prompt }] })

  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash'
  const response = await ai.models.generateContent({
    model,
    contents,
    config: options.jsonMode ? { responseMimeType: 'application/json' } : undefined
  })

  return response.text || ''
}

async function callGeminiChat(apiKey: string, options: AiChatOptions): Promise<string> {
  const ai = new GoogleGenAI({ apiKey })
  const contents: any[] = [
    { role: 'user', parts: [{ text: options.systemPrompt }] }
  ]

  options.messages.forEach(m => {
    contents.push({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }]
    })
  })

  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash'
  const response = await ai.models.generateContent({
    model,
    contents,
    config: options.jsonMode ? { responseMimeType: 'application/json' } : undefined
  })

  return response.text || ''
}

export const generateAiContent = async (options: AiTextOptions): Promise<string> => {
  const keyChain = getKeys()
  if (keyChain.length === 0) {
    throw new Error('No AI API keys configured (Checked GROQ_API_KEY[1-3] and GEMINI_API_KEY[1-3])')
  }

  const errors: string[] = []

  for (const item of keyChain) {
    try {
      if (item.provider === 'groq') {
        const result = await callGroqContent(item.key, options)
        if (result && result.trim()) return result
      } else {
        const result = await callGeminiContent(item.key, options)
        if (result && result.trim()) return result
      }
    } catch (err: any) {
      console.warn(`[AI Failover] ${item.label} (${item.provider}) failed:`, err?.message || err)
      errors.push(`${item.label}: ${err?.message || 'unknown error'}`)
      // continue to next key in chain
    }
  }

  throw new Error(`All configured AI keys failed in rotation. Attempts:\n${errors.join('\n')}`)
}

export const generateAiChat = async (options: AiChatOptions): Promise<string> => {
  const keyChain = getKeys()
  if (keyChain.length === 0) {
    throw new Error('No AI API keys configured (Checked GROQ_API_KEY[1-3] and GEMINI_API_KEY[1-3])')
  }

  const errors: string[] = []

  for (const item of keyChain) {
    try {
      if (item.provider === 'groq') {
        const result = await callGroqChat(item.key, options)
        if (result && result.trim()) return result
      } else {
        const result = await callGeminiChat(item.key, options)
        if (result && result.trim()) return result
      }
    } catch (err: any) {
      console.warn(`[AI Failover] ${item.label} (${item.provider}) failed:`, err?.message || err)
      errors.push(`${item.label}: ${err?.message || 'unknown error'}`)
      // continue to next key in chain
    }
  }

  throw new Error(`All configured AI keys failed in rotation. Attempts:\n${errors.join('\n')}`)
}

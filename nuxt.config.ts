// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss'],
  runtimeConfig: {
    geminiApiKey: process.env.GEMINI_API_KEY || '',
    geminiApiKey2: process.env.GEMINI_API_KEY_2 || '',
    geminiApiKey3: process.env.GEMINI_API_KEY_3 || '',
    groqApiKey: process.env.GROQ_API_KEY || '',
    groqApiKey2: process.env.GROQ_API_KEY_2 || '',
    groqApiKey3: process.env.GROQ_API_KEY_3 || '',
    aiProvider: process.env.AI_PROVIDER || 'groq',
    supabaseUrl: process.env.SUPABASE_URL || '',
    supabaseKey: process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || '',
    telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',
    public: {
      supabaseUrl: process.env.SUPABASE_URL || '',
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
      telegramBotUsername: process.env.TELEGRAM_BOT_USERNAME || ''
    }
  }
})

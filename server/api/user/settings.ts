/**
 * User Settings API (Account-wise Telegram Chat ID & Preferences)
 */
import { memoryStore } from '../../utils/memoryStore'
import { getSupabaseClient } from '../../utils/supabase'

export default defineEventHandler(async (event) => {
  const method = getMethod(event)
  const query = getQuery(event)
  const userId = query.user_id as string | undefined

  if (method === 'GET') {
    if (!userId) {
      throw createError({ statusCode: 400, message: 'user_id is required' })
    }

    let chatId = memoryStore.getUserTelegramChatId(userId)

    const supabase = getSupabaseClient()
    if (supabase && !chatId) {
      try {
        const { data } = await supabase.from('profiles').select('telegram_chat_id').eq('id', userId).single()
        if (data?.telegram_chat_id) {
          chatId = String(data.telegram_chat_id)
          memoryStore.setUserTelegramChatId(userId, chatId)
        }
      } catch (e) {}
    }

    return {
      success: true,
      telegram_chat_id: chatId
    }
  }

  if (method === 'PATCH') {
    const body = await readBody(event)
    const { user_id, telegram_chat_id } = body

    if (!user_id) {
      throw createError({ statusCode: 400, message: 'user_id is required' })
    }

    const cleanChatId = telegram_chat_id ? String(telegram_chat_id).trim() : null
    memoryStore.setUserTelegramChatId(user_id, cleanChatId)

    const supabase = getSupabaseClient()
    if (supabase) {
      try {
        await supabase.from('profiles').upsert({
          id: user_id,
          telegram_chat_id: cleanChatId,
          updated_at: new Date().toISOString()
        })
      } catch (e) {
        console.warn('Supabase profile telegram update warning:', e)
      }
    }

    return {
      success: true,
      telegram_chat_id: cleanChatId
    }
  }
})

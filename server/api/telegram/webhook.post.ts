/**
 * Telegram Webhook Handler
 * Receives incoming messages from Telegram Bot.
 * When merchant presses /start with payload (e.g. /start store_slug),
 * automatically links their telegram chat_id to the store!
 */
import { memoryStore } from '../../utils/memoryStore'
import { getSupabaseClient } from '../../utils/supabase'
import { sendTelegramMessage } from '../../utils/telegram'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body || !body.message) {
    return { ok: true }
  }

  const message = body.message
  const chatId = message.chat?.id
  const text: string = message.text || ''

  if (!chatId || !text) {
    return { ok: true }
  }

  // Handle /start payload (e.g. "/start honey-store" or "/start pairing_honey-store")
  if (text.startsWith('/start')) {
    const parts = text.split(' ')
    const param = parts[1]?.trim()

    if (param) {
      const slug = param.replace(/^store_/, '').replace(/^pair_/, '').trim()

      let storeTitle = slug
      const supabase = getSupabaseClient()
      
      // Update memory store
      const memStore = memoryStore.getStore(slug)
      if (memStore) {
        if (!memStore.config) memStore.config = {}
        memStore.config.telegram_chat_id = String(chatId)
        memoryStore.setStore(slug, memStore)
        storeTitle = memStore.product_title || slug
      }

      // Update Supabase if available
      if (supabase) {
        try {
          const { data: store } = await supabase.from('stores').select('product_title, config').eq('slug', slug).single()
          if (store) {
            storeTitle = store.product_title || slug
            const cfg = store.config || {}
            cfg.telegram_chat_id = String(chatId)
            await supabase.from('stores').update({ config: cfg }).eq('slug', slug)
          }
        } catch (dbErr) {
          console.warn('Supabase telegram pairing update error:', dbErr)
        }
      }

      await sendTelegramMessage({
        chatId,
        text: `✅ <b>টেলিগ্রাম এলার্ট সফলভাবে চালু হয়েছে!</b>\n\n🛍️ আপনার দোকান: <b>${storeTitle}</b>\n\nএখন থেকে এই দোকানে যেকোনো নতুন ক্যাশ অন ডেলিভারি অর্ডার আসলে সাথে সাথে এখানে বিস্তারিত নোটিফিকেশন পাবেন।`
      })

      return { ok: true, linked: slug }
    } else {
      // Plain /start without parameters
      await sendTelegramMessage({
        chatId,
        text: `👋 <b>স্বাগতম DokanAI নোটিফিকেশন বটে!</b>\n\nআপনার অনলাইন স্টোরের সাথে বটটি যুক্ত করতে মার্চেন্ট ড্যাশবোর্ড থেকে <b>"টেলিগ্রাম চালু করুন"</b> বাটনে ক্লিক করুন।`
      })
      return { ok: true }
    }
  }

  return { ok: true }
})

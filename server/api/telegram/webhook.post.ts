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

  // Handle /start payload (e.g. "/start user_demo_judge_account_id" or "/start store_slug")
  if (text.startsWith('/start')) {
    const parts = text.split(' ')
    const param = parts[1]?.trim()

    if (param) {
      const supabase = getSupabaseClient()

      // CASE A: User/Account-wise pairing (e.g. "user_12345" or "usr_abc")
      if (param.startsWith('user_') || param.startsWith('usr_')) {
        const userId = param.replace(/^user_/, '').trim()

        memoryStore.setUserTelegramChatId(userId, String(chatId))

        if (supabase) {
          try {
            await supabase.from('profiles').upsert({
              id: userId,
              telegram_chat_id: String(chatId),
              updated_at: new Date().toISOString()
            })
          } catch (dbErr) {
            console.warn('Supabase profile telegram pairing error:', dbErr)
          }
        }

        await sendTelegramMessage({
          chatId,
          text: `✅ <b>টেলিগ্রাম এলার্ট সফলভাবে যুক্ত হয়েছে!</b>\n\n🎉 আপনার DokanAI মার্চেন্ট অ্যাকাউন্টের সাথে টেলিগ্রাম সফলভাবে কানেক্টেড।\n\nএখন থেকে আপনার <b>সকল দোকানের</b> নতুন ক্যাশ অন ডেলিভারি অর্ডার আসলে সাথে সাথে এখানে দোকানের নামসহ বিস্তারিত নোটিফিকেশন পাবেন।`
        })

        return { ok: true, linked_user: userId }
      }

      // CASE B: Store-level slug fallback
      const slug = param.replace(/^store_/, '').replace(/^pair_/, '').trim()

      let storeTitle = slug
      
      // Update memory store
      const memStore = memoryStore.getStore(slug)
      if (memStore) {
        if (!memStore.config) memStore.config = {}
        memStore.config.telegram_chat_id = String(chatId)
        memoryStore.setStore(slug, memStore)
        storeTitle = memStore.product_title || slug
        if (memStore.user_id) {
          memoryStore.setUserTelegramChatId(memStore.user_id, String(chatId))
        }
      }

      // Update Supabase if available
      if (supabase) {
        try {
          const { data: store } = await supabase.from('stores').select('user_id, product_title, config').eq('slug', slug).single()
          if (store) {
            storeTitle = store.product_title || slug
            const cfg = store.config || {}
            cfg.telegram_chat_id = String(chatId)
            await supabase.from('stores').update({ config: cfg }).eq('slug', slug)
            if (store.user_id) {
              await supabase.from('profiles').upsert({
                id: store.user_id,
                telegram_chat_id: String(chatId),
                updated_at: new Date().toISOString()
              })
            }
          }
        } catch (dbErr) {
          console.warn('Supabase telegram pairing update error:', dbErr)
        }
      }

      await sendTelegramMessage({
        chatId,
        text: `✅ <b>টেলিগ্রাম এলার্ট সফলভাবে চালু হয়েছে!</b>\n\n🛍️ আপনার দোকান: <b>${storeTitle}</b>\n\nএখন থেকে আপনার সকল দোকানের নতুন ক্যাশ অন ডেলিভারি অর্ডার আসলে সাথে সাথে এখানে বিস্তারিত নোটিফিকেশন পাবেন।`
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

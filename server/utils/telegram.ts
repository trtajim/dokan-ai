/**
 * Telegram Bot Helper Utility
 * - Sends direct Telegram messages
 * - Supports sending new order alert with markdown formatting
 */
export async function sendTelegramMessage(params: {
  botToken?: string
  chatId: string | number
  text: string
  parseMode?: 'HTML' | 'Markdown'
}): Promise<{ success: boolean; data?: any; error?: string }> {
  const config = useRuntimeConfig()
  const token = params.botToken || config.telegramBotToken || process.env.TELEGRAM_BOT_TOKEN

  if (!token) {
    return { success: false, error: 'Telegram Bot Token is not configured' }
  }

  if (!params.chatId) {
    return { success: false, error: 'Telegram Chat ID is missing' }
  }

  try {
    const res = await $fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      body: {
        chat_id: params.chatId,
        text: params.text,
        parse_mode: params.parseMode || 'HTML'
      }
    })
    return { success: true, data: res }
  } catch (err: any) {
    console.warn('Telegram sendMessage error:', err?.data || err?.message || err)
    return { success: false, error: err?.message || 'Failed to send Telegram message' }
  }
}

export function formatOrderTelegramMessage(order: {
  store_title?: string
  store_slug: string
  customer_name: string
  customer_phone: string
  customer_address: string
  selected_variant?: string
  quantity: number
  total_price: number
  delivery_zone: string
  delivery_fee: number
}): string {
  const zoneLabel = order.delivery_zone === 'outside_dhaka' ? 'ঢাকার বাইরে' : 'ঢাকার ভিতরে'
  const time = new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })

  let msg = `🔔 <b>নতুন ক্যাশ অন ডেলিভারি অর্ডার!</b>\n`
  msg += `━━━━━━━━━━━━━━━━━━━━\n`
  msg += `🛍️ <b>দোকান:</b> ${escapeHtml(order.store_title || order.store_slug)}\n`
  if (order.selected_variant) {
    msg += `📦 <b>ভ্যারিয়েন্ট:</b> ${escapeHtml(order.selected_variant)}\n`
  }
  msg += `🔢 <b>পরিমাণ:</b> ${order.quantity} টি\n`
  msg += `💰 <b>সর্বমোট বিল:</b> ৳${order.total_price} (ক্যাশ অন ডেলিভারি)\n\n`
  
  msg += `👤 <b>ক্রেতার তথ্য:</b>\n`
  msg += `• <b>নাম:</b> ${escapeHtml(order.customer_name)}\n`
  msg += `• <b>মোবাইল:</b> <code>${escapeHtml(order.customer_phone)}</code>\n`
  msg += `• <b>ঠিকানা:</b> ${escapeHtml(order.customer_address)}\n\n`

  msg += `🚚 <b>ডেলিভারি এরিয়া:</b> ${zoneLabel} (৳${order.delivery_fee})\n`
  msg += `⏰ <b>সময়:</b> ${time}\n`
  msg += `━━━━━━━━━━━━━━━━━━━━\n`
  msg += `<i>মার্চেন্ট ড্যাশবোর্ড থেকে কল করে অর্ডারটি কনফার্ম করুন।</i>`

  return msg
}

function escapeHtml(str: string): string {
  if (!str) return ''
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

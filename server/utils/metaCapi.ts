/**
 * Meta Conversions API (CAPI) Utility
 * Sends server-side conversion events directly to Meta Graph API
 * Especially critical for Cash On Delivery (COD) to send 'Purchase'
 * only when merchant confirms the order over phone/delivery.
 */
import crypto from 'node:crypto'

interface SendMetaPurchaseParams {
  pixelId: string
  accessToken: string
  orderId: string
  totalPrice: number
  currency?: string
  customerPhone: string
  customerName: string
  customerAddress?: string
  eventTime?: number
}

function sha256Hash(value: string): string {
  return crypto.createHash('sha256').update(value.trim().toLowerCase()).digest('hex')
}

export async function sendMetaPurchaseEvent(params: SendMetaPurchaseParams): Promise<{ success: boolean; data?: any; error?: string }> {
  const { pixelId, accessToken, orderId, totalPrice, currency = 'BDT', customerPhone, customerName, customerAddress, eventTime = Math.floor(Date.now() / 1000) } = params

  if (!pixelId || !accessToken) {
    return { success: false, error: 'Missing pixelId or accessToken' }
  }

  // Normalize phone (Bangladeshi numbers should include international prefix 880 for optimal match quality)
  let cleanPhone = customerPhone.replace(/\D/g, '')
  if (cleanPhone.startsWith('01')) {
    cleanPhone = '88' + cleanPhone
  }

  const userData: Record<string, any> = {
    ph: [sha256Hash(cleanPhone)],
    fn: [sha256Hash(customerName.split(' ')[0] || customerName)]
  }

  if (customerAddress) {
    userData.ct = [sha256Hash(customerAddress.includes('ঢাকা') || customerAddress.toLowerCase().includes('dhaka') ? 'dhaka' : 'bangladesh')]
    userData.country = [sha256Hash('bd')]
  }

  const payload = {
    data: [
      {
        event_name: 'Purchase',
        event_time: eventTime,
        event_id: orderId, // Ensures deduplication if browser pixel also fired
        action_source: 'system_generated', // Indicates backend server confirmation
        user_data: userData,
        custom_data: {
          currency,
          value: Number(totalPrice) || 0,
          order_id: orderId
        }
      }
    ]
  }

  try {
    const res = await $fetch(`https://graph.facebook.com/v19.0/${pixelId}/events`, {
      method: 'POST',
      query: { access_token: accessToken },
      body: payload
    })
    return { success: true, data: res }
  } catch (err: any) {
    console.warn('Meta CAPI error:', err?.data || err?.message || err)
    return { success: false, error: err?.message || 'Failed to send event to Meta CAPI' }
  }
}

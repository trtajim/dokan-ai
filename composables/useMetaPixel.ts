/**
 * Composable for Meta Pixel (Facebook Pixel) tracking
 * Standard events for COD single-product stores:
 * - PageView (automatic on page load)
 * - ViewContent (item details)
 * - InitiateCheckout (on scrolling to form or clicking Order CTA)
 * - Lead (on successful COD order submission - preventing premature Purchase skewing)
 */
export const useMetaPixel = (pixelIdRef: { value: string | null | undefined }) => {
  const isInitialized = ref(false)

  const initPixel = (id: string) => {
    if (!import.meta.client || !id || isInitialized.value) return

    // Inject Meta Pixel script standard snippet safely if not already present
    if (!window.fbq) {
      /* eslint-disable */
      (function(f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
        if (f.fbq) return;
        n = f.fbq = function() {
          n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
        };
        if (!f._fbq) f._fbq = n;
        n.push = n;
        n.loaded = !0;
        n.version = '2.0';
        n.queue = [];
        t = b.createElement(e);
        t.async = !0;
        t.src = v;
        s = b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t, s);
      })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
      /* eslint-enable */
    }

    try {
      window.fbq('init', id)
      window.fbq('track', 'PageView')
      isInitialized.value = true
    } catch (err) {
      console.warn('Meta Pixel initialization warning:', err)
    }
  }

  const trackEvent = (eventName: string, params: Record<string, any> = {}) => {
    if (!import.meta.client || !window.fbq) return
    try {
      window.fbq('track', eventName, params)
    } catch (err) {
      console.warn(`Meta Pixel track(${eventName}) warning:`, err)
    }
  }

  const trackViewContent = (params: { content_name?: string; value?: number; currency?: string }) => {
    trackEvent('ViewContent', {
      content_name: params.content_name || 'Product',
      value: params.value || 0,
      currency: params.currency || 'BDT',
      content_type: 'product'
    })
  }

  const trackInitiateCheckout = (params: { content_name?: string; value?: number; currency?: string }) => {
    trackEvent('InitiateCheckout', {
      content_name: params.content_name || 'Product',
      value: params.value || 0,
      currency: params.currency || 'BDT'
    })
  }

  /**
   * Fires 'Lead' on COD form submission as required for COD ad optimization.
   * Also passes order value & currency so Meta can measure lead prospective value.
   */
  const trackLead = (params: { content_name?: string; value?: number; currency?: string }) => {
    trackEvent('Lead', {
      content_name: params.content_name || 'Product',
      value: params.value || 0,
      currency: params.currency || 'BDT'
    })
  }

  watch(
    () => pixelIdRef.value,
    (newId) => {
      if (newId && typeof newId === 'string' && newId.trim()) {
        initPixel(newId.trim())
      }
    },
    { immediate: true }
  )

  return {
    initPixel,
    trackEvent,
    trackViewContent,
    trackInitiateCheckout,
    trackLead
  }
}

declare global {
  interface Window {
    fbq?: any
    _fbq?: any
  }
}

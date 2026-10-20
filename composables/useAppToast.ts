import { reactive } from 'vue'

export interface ToastItem {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  title?: string
  message: string
  duration?: number
}

const state = reactive<{
  toasts: ToastItem[]
}>({
  toasts: []
})

export const useAppToast = () => {
  const show = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info', title?: string, duration: number = 3500) => {
    const id = Math.random().toString(36).substring(2, 9)
    const toast: ToastItem = { id, type, title, message, duration }
    state.toasts.push(toast)

    if (duration > 0) {
      setTimeout(() => {
        dismiss(id)
      }, duration)
    }
  }

  const success = (message: string, title?: string, duration?: number) => show(message, 'success', title, duration)
  const error = (message: string, title?: string, duration?: number) => show(message, 'error', title, duration)
  const info = (message: string, title?: string, duration?: number) => show(message, 'info', title, duration)
  const warning = (message: string, title?: string, duration?: number) => show(message, 'warning', title, duration)

  const dismiss = (id: string) => {
    const idx = state.toasts.findIndex(t => t.id === id)
    if (idx !== -1) {
      state.toasts.splice(idx, 1)
    }
  }

  return {
    toasts: state.toasts,
    show,
    success,
    error,
    info,
    warning,
    dismiss
  }
}

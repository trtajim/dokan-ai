import { ref } from 'vue'

const isOpen = ref(false)
const redirectPath = ref('/dashboard')
const isDismissible = ref(true)

export const useAuthModal = () => {
  const openLogin = (redirect: string = '/dashboard', dismissible: boolean = true) => {
    redirectPath.value = redirect
    isDismissible.value = dismissible
    isOpen.value = true
  }

  const closeLogin = () => {
    if (!isDismissible.value) return
    isOpen.value = false
  }

  return {
    isOpen,
    redirectPath,
    isDismissible,
    openLogin,
    closeLogin
  }
}

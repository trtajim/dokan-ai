import { ref } from 'vue'

const isOpen = ref(false)
const redirectPath = ref('/dashboard')

export const useAuthModal = () => {
  const openLogin = (redirect: string = '/dashboard') => {
    redirectPath.value = redirect
    isOpen.value = true
  }

  const closeLogin = () => {
    isOpen.value = false
  }

  return {
    isOpen,
    redirectPath,
    openLogin,
    closeLogin
  }
}

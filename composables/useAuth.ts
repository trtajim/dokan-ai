import { ref, computed } from 'vue'

export interface UserSession {
  id: string
  email: string
  isGuest: boolean
  displayName: string
}

const currentUser = ref<UserSession | null>(null)

export const useAuth = () => {
  const initAuth = () => {
    if (import.meta.client && !currentUser.value) {
      const saved = localStorage.getItem('dokan_auth_session')
      if (saved) {
        try {
          currentUser.value = JSON.parse(saved)
        } catch (e) {
          localStorage.removeItem('dokan_auth_session')
        }
      }
    }
  }

  const loginAsGuest = () => {
    const guestUser: UserSession = {
      id: 'guest_merchant_demo',
      email: 'demo@dokan.ai',
      isGuest: true,
      displayName: 'ডেমো মার্চেন্ট (Guest)'
    }
    currentUser.value = guestUser
    if (import.meta.client) {
      localStorage.setItem('dokan_auth_session', JSON.stringify(guestUser))
    }
    return guestUser
  }

  const loginWithEmail = async (email: string, pass: string) => {
    // Generates or matches merchant account
    const cleanEmail = email.trim().toLowerCase()
    const user: UserSession = {
      id: 'usr_' + btoa(cleanEmail).replace(/[^a-zA-Z0-9]/g, '').slice(0, 16),
      email: cleanEmail,
      isGuest: false,
      displayName: cleanEmail.split('@')[0]
    }
    currentUser.value = user
    if (import.meta.client) {
      localStorage.setItem('dokan_auth_session', JSON.stringify(user))
    }
    return user
  }

  const logout = () => {
    currentUser.value = null
    if (import.meta.client) {
      localStorage.removeItem('dokan_auth_session')
    }
  }

  const isAuthenticated = computed(() => !!currentUser.value)

  return {
    currentUser,
    isAuthenticated,
    initAuth,
    loginAsGuest,
    loginWithEmail,
    logout
  }
}

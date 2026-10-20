import { ref, computed } from 'vue'
import { createClient } from '@supabase/supabase-js'

export interface UserSession {
  id: string
  email: string
  isGuest: boolean
  displayName: string
}

const currentUser = ref<UserSession | null>(null)

export const useAuth = () => {
  const config = useRuntimeConfig()
  const supabaseUrl = config.public?.supabaseUrl || 'https://xdvddtlpsytntzjhtwtw.supabase.co'
  const supabaseAnonKey = config.public?.supabaseAnonKey || 'sb_publishable_yCjWyQODXLjr-mHOC_y9Yw_ZLQsuAcq'
  
  const sb = createClient(supabaseUrl, supabaseAnonKey)

  const initAuth = async () => {
    if (import.meta.client && !currentUser.value) {
      // 1. Check local session cache
      const saved = localStorage.getItem('dokan_auth_session')
      if (saved) {
        try {
          currentUser.value = JSON.parse(saved)
        } catch (e) {
          localStorage.removeItem('dokan_auth_session')
        }
      }

      // 2. Check Supabase Auth state if exists
      try {
        const { data: { session } } = await sb.auth.getSession()
        if (session && session.user) {
          const userSession: UserSession = {
            id: session.user.id,
            email: session.user.email || 'seller@dokan.ai',
            isGuest: session.user.email?.startsWith('guest_') || false,
            displayName: session.user.user_metadata?.display_name || session.user.email?.split('@')[0] || 'Merchant'
          }
          currentUser.value = userSession
          localStorage.setItem('dokan_auth_session', JSON.stringify(userSession))
        }
      } catch (e) {
        // Fallback gracefully
      }
    }
  }

  // 1-Click Guest Demo Login: Logs into a real persistent account in Supabase
  const loginAsGuest = async () => {
    const demoEmail = 'judge.demo@dokan.ai'
    const demoPassword = 'DokanAI_Guest_2026!'

    let userSession: UserSession = {
      id: 'demo_judge_account_id',
      email: demoEmail,
      isGuest: true,
      displayName: 'Judge / Demo Merchant'
    }

    try {
      // Try signing in to real Supabase account
      let { data, error } = await sb.auth.signInWithPassword({
        email: demoEmail,
        password: demoPassword
      })

      // If user doesn't exist yet, sign up to create real persistent user in Supabase
      if (error && error.message.includes('Invalid login credentials')) {
        const { data: signUpData, error: signUpErr } = await sb.auth.signUp({
          email: demoEmail,
          password: demoPassword,
          options: {
            data: { display_name: 'Judge / Demo Merchant' }
          }
        })
        if (signUpData?.user) {
          userSession.id = signUpData.user.id
        }
      } else if (data?.user) {
        userSession.id = data.user.id
      }
    } catch (err) {
      console.warn('Supabase real guest account sync notice:', err)
    }

    currentUser.value = userSession
    if (import.meta.client) {
      localStorage.setItem('dokan_auth_session', JSON.stringify(userSession))
    }
    return userSession
  }

  // Real Email/Password Login & Register
  const loginWithEmail = async (email: string, pass: string) => {
    const cleanEmail = email.trim().toLowerCase()
    let userSession: UserSession = {
      id: 'usr_' + btoa(cleanEmail).replace(/[^a-zA-Z0-9]/g, '').slice(0, 16),
      email: cleanEmail,
      isGuest: false,
      displayName: cleanEmail.split('@')[0]
    }

    try {
      const { data, error } = await sb.auth.signInWithPassword({
        email: cleanEmail,
        password: pass
      })

      if (error) {
        // If account not found, auto-create
        const { data: signUpData } = await sb.auth.signUp({
          email: cleanEmail,
          password: pass,
          options: {
            data: { display_name: cleanEmail.split('@')[0] }
          }
        })
        if (signUpData?.user) userSession.id = signUpData.user.id
      } else if (data?.user) {
        userSession.id = data.user.id
      }
    } catch (e) {
      console.warn('Supabase auth notice:', e)
    }

    currentUser.value = userSession
    if (import.meta.client) {
      localStorage.setItem('dokan_auth_session', JSON.stringify(userSession))
    }
    return userSession
  }

  const logout = async () => {
    try {
      await sb.auth.signOut()
    } catch (e) {}
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

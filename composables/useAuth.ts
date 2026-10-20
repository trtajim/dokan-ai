import { ref, computed } from 'vue'
import { createClient } from '@supabase/supabase-js'

export interface UserSession {
  id: string
  email: string
  displayName: string
}

const currentUser = ref<UserSession | null>(null)
const isAuthInitializing = ref(true)

export const useAuth = () => {
  const config = useRuntimeConfig()
  const supabaseUrl = config.public?.supabaseUrl || 'https://xdvddtlpsytntzjhtwtw.supabase.co'
  const supabaseAnonKey = config.public?.supabaseAnonKey || 'sb_publishable_yCjWyQODXLjr-mHOC_y9Yw_ZLQsuAcq'
  
  const sb = createClient(supabaseUrl, supabaseAnonKey)

  const initAuth = async () => {
    if (!import.meta.client) return

    try {
      // Get real verified session from Supabase
      const { data: { session } } = await sb.auth.getSession()
      if (session?.user) {
        currentUser.value = {
          id: session.user.id,
          email: session.user.email || '',
          displayName: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'মার্চেন্ট'
        }
      } else {
        currentUser.value = null
      }

      // Listen to real auth state changes (login, logout, token refresh)
      sb.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          currentUser.value = {
            id: session.user.id,
            email: session.user.email || '',
            displayName: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'মার্চেন্ট'
          }
        } else {
          currentUser.value = null
        }
      })
    } catch (e) {
      console.warn('Supabase auth init error:', e)
      currentUser.value = null
    } finally {
      isAuthInitializing.value = false
    }
  }

  // Real Email/Password Sign Up & Login
  const loginOrSignUp = async (email: string, pass: string) => {
    const cleanEmail = email.trim().toLowerCase()
    
    // First attempt to sign in
    const signInRes = await sb.auth.signInWithPassword({
      email: cleanEmail,
      password: pass
    })

    if (!signInRes.error && signInRes.data.user) {
      currentUser.value = {
        id: signInRes.data.user.id,
        email: signInRes.data.user.email || '',
        displayName: signInRes.data.user.user_metadata?.full_name || cleanEmail.split('@')[0] || 'মার্চেন্ট'
      }
      return currentUser.value
    }

    // If invalid login credentials, check if user exists or sign them up automatically
    if (signInRes.error?.message?.toLowerCase().includes('invalid login credentials')) {
      const signUpRes = await sb.auth.signUp({
        email: cleanEmail,
        password: pass,
        options: {
          data: {
            full_name: cleanEmail.split('@')[0]
          }
        }
      })

      if (signUpRes.error) {
        // If password is too short or something invalid
        throw new Error(signUpRes.error.message || 'ভুল ইমেইল বা পাসওয়ার্ড')
      }

      if (signUpRes.data.user) {
        currentUser.value = {
          id: signUpRes.data.user.id,
          email: signUpRes.data.user.email || '',
          displayName: cleanEmail.split('@')[0] || 'মার্চেন্ট'
        }
        return currentUser.value
      }
    }

    throw new Error(signInRes.error?.message || 'লগইন ব্যর্থ হয়েছে')
  }

  const logout = async () => {
    try {
      await sb.auth.signOut()
    } catch (e) {}
    currentUser.value = null
  }

  const isAuthenticated = computed(() => !!currentUser.value)

  return {
    currentUser,
    isAuthenticated,
    isAuthInitializing,
    initAuth,
    loginOrSignUp,
    logout
  }
}

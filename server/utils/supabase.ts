/**
 * Supabase Client Initializer for Server & Client
 */
import { createClient } from '@supabase/supabase-js'

export const getSupabaseClient = () => {
  const config = useRuntimeConfig()
  const url = config.supabaseUrl || config.public?.supabaseUrl
  const key = config.supabaseKey || config.public?.supabaseAnonKey

  if (!url || !key) {
    return null
  }

  return createClient(url, key)
}

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})

export type ActiveMode = 'selling' | 'sourcing'

export interface UserProfile {
  id: string
  full_name: string
  email: string
  company_name: string
  active_mode: ActiveMode
  avatar_url?: string | null
}

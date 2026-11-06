import { createContext, useContext } from 'react'
import type { Session } from '@supabase/supabase-js'

export interface AuthState {
  session: Session | null
  loading: boolean
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthState>({
  session: null,
  loading: false,
  signOut: async () => {},
})

export const useAuth = () => useContext(AuthContext)

import { Navigate, Outlet } from 'react-router-dom'
import { isSupabaseConfigured } from '@/data/supabase/client'
import { useAuth } from './authContext'

/** With Supabase configured, everything but /login needs a signed-in user. */
export function RequireAuth() {
  const { session, loading } = useAuth()
  if (!isSupabaseConfigured) return <Outlet />
  if (loading) return null
  if (!session) return <Navigate to="/login" replace />
  return <Outlet />
}

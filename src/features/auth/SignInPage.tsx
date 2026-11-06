import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { Button, FormField, inputClass } from '@/components'
import { isSupabaseConfigured, supabase } from '@/data/supabase/client'
import { useAuth } from './authContext'

export function SignInPage() {
  const { session, loading } = useAuth()
  const [mode, setMode] = useState<'in' | 'up'>('in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  if (!isSupabaseConfigured || session) return <Navigate to="/" replace />
  if (loading) return null

  async function submit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    setNotice(null)
    if (mode === 'in') {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password })
      if (err) setError(err.message)
    } else {
      const { data, error: err } = await supabase.auth.signUp({ email, password })
      if (err) setError(err.message)
      else if (!data.session) setNotice('Check your email to confirm your account, then sign in.')
    }
    setBusy(false)
  }

  return (
    <div className="pt-safe pb-safe min-h-dvh">
      <div className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-6 py-10">
        <p className="eyebrow mb-1.5">Okuru</p>
        <h1 className="font-display text-display">
          {mode === 'in' ? 'Welcome back' : 'Start your notebook'}
        </h1>
        <p className="text-ink-soft mt-2">Make thoughtfulness tangible.</p>

        <form onSubmit={submit} className="mt-8 flex flex-col gap-4">
          <FormField label="Email">
            {(p) => (
              <input
                {...p}
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
              />
            )}
          </FormField>
          <FormField label="Password" hint={mode === 'up' ? 'At least 6 characters.' : undefined}>
            {(p) => (
              <input
                {...p}
                type="password"
                autoComplete={mode === 'in' ? 'current-password' : 'new-password'}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
              />
            )}
          </FormField>
          {error && (
            <p role="alert" className="text-accent-strong text-sm">
              {error}
            </p>
          )}
          {notice && (
            <p role="status" className="text-ink-soft text-sm">
              {notice}
            </p>
          )}
          <Button type="submit" disabled={busy}>
            {mode === 'in' ? 'Sign in' : 'Create account'}
          </Button>
        </form>

        <button
          type="button"
          onClick={() => {
            setMode(mode === 'in' ? 'up' : 'in')
            setError(null)
            setNotice(null)
          }}
          className="text-ink-soft hover:text-ink mt-4 min-h-11 self-start text-sm underline underline-offset-4"
        >
          {mode === 'in' ? 'New here? Create an account' : 'Have an account? Sign in'}
        </button>
      </div>
    </div>
  )
}

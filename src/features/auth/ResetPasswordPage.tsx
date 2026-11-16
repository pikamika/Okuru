import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, FormField, inputClass } from '@/components'
import { isSupabaseConfigured, supabase } from '@/data/supabase/client'
import { useAuth } from './authContext'

/** Where the emailed reset link lands. Supabase has already checked the link and signed them in. */
export function ResetPasswordPage() {
  const { session, loading } = useAuth()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isSupabaseConfigured) return null
  if (loading) return null

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (password !== confirm) return setError('The two passwords don’t match.')
    setBusy(true)
    setError(null)
    const { error: err } = await supabase.auth.updateUser({ password })
    setBusy(false)
    if (err) return setError(err.message)
    navigate('/', { replace: true })
  }

  return (
    <div className="pt-safe pb-safe min-h-dvh">
      <div className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-6 py-10">
        <p className="eyebrow mb-1.5">Okuru</p>
        {session ? (
          <>
            <h1 className="font-display text-display">Choose a new password</h1>
            <form onSubmit={submit} className="mt-8 flex flex-col gap-4">
              <FormField label="New password" hint="At least 6 characters.">
                {(p) => (
                  <input
                    {...p}
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={inputClass}
                  />
                )}
              </FormField>
              <FormField label="Confirm new password">
                {(p) => (
                  <input
                    {...p}
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={6}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className={inputClass}
                  />
                )}
              </FormField>
              {error && (
                <p role="alert" className="text-accent-strong text-sm">
                  {error}
                </p>
              )}
              <Button type="submit" disabled={busy}>
                Save new password
              </Button>
            </form>
          </>
        ) : (
          <>
            <h1 className="font-display text-display">This link has expired</h1>
            <p className="text-ink-soft mt-2">
              Reset links work once and last an hour. Ask for a fresh one.
            </p>
            <Link
              to="/login"
              className="bg-accent text-on-accent hover:bg-accent-strong mt-8 inline-flex min-h-11 items-center justify-center rounded-full px-5 font-medium"
            >
              Back to sign in
            </Link>
          </>
        )}
      </div>
    </div>
  )
}

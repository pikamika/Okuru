import { Navigate } from 'react-router-dom'
import { CaptureProvider } from '@/features/capture'
import { useOnboarded } from '@/hooks'
import { AppShell } from './AppShell'

/** First run goes to onboarding. Skippable, and only asked once. */
export function RequireOnboarding() {
  const { data: onboarded, isLoading } = useOnboarded()
  if (isLoading) return null
  if (!onboarded) return <Navigate to="/welcome" replace />
  return (
    <CaptureProvider>
      <AppShell />
    </CaptureProvider>
  )
}

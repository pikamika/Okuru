import { useCallback, useRef, useState, type ReactNode } from 'react'
import { ToastContext } from './toastContext'

/** A soft, brief confirmation. Announced politely to screen readers. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null)
  const timer = useRef<number | undefined>(undefined)

  const show = useCallback((m: string) => {
    window.clearTimeout(timer.current)
    setMessage(m)
    timer.current = window.setTimeout(() => setMessage(null), 2200)
  }, [])

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-[calc(var(--tab-height)+env(safe-area-inset-bottom)+1rem)] z-[60] flex justify-center px-4 md:bottom-8"
      >
        {message && (
          <div
            key={message}
            className="anim-fade bg-ink text-paper shadow-card rounded-full px-5 py-2.5 text-sm"
          >
            {message}
          </div>
        )}
      </div>
    </ToastContext.Provider>
  )
}

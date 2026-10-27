import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { CaptureContext, type OpenOptions } from './captureContext'
import { CaptureSheet } from './CaptureSheet'

/** Quick capture is reachable from anywhere: any component can call `openCapture()`. */
export function CaptureProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{ open: boolean; personId?: string }>({ open: false })

  const openCapture = useCallback((options?: OpenOptions) => {
    setState({ open: true, personId: options?.personId })
  }, [])
  const close = useCallback(() => setState((s) => ({ ...s, open: false })), [])

  const api = useMemo(() => ({ openCapture }), [openCapture])

  return (
    <CaptureContext.Provider value={api}>
      {children}
      <CaptureSheet open={state.open} initialPersonId={state.personId} onClose={close} />
    </CaptureContext.Provider>
  )
}

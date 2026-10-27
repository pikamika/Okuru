import { useEffect, useRef, type ReactNode } from 'react'
import { CloseIcon } from './icons'

interface Props {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

/** Bottom sheet on mobile, centered card on wide screens. Built on <dialog> for focus trap + Esc. */
export function Sheet({ open, onClose, title, children }: Props) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (open && !el.open) {
      el.showModal()
      // <dialog> opens closed-then-shown, so React's autoFocus misses; focus explicitly.
      el.querySelector<HTMLElement>('[data-autofocus]')?.focus()
    }
    if (!open && el.open) el.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      aria-labelledby="sheet-title"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose()
      }}
      className="anim-sheet rounded-t-sheet bg-paper text-ink shadow-sheet backdrop:bg-ink/30 sm:rounded-sheet fixed inset-x-0 top-auto bottom-0 m-0 max-h-[92dvh] w-full max-w-none overflow-y-auto p-0 backdrop:backdrop-blur-[2px] sm:inset-y-0 sm:m-auto sm:h-fit sm:max-w-lg"
    >
      {open && (
        <div className="pb-safe px-5 pt-3 pb-5">
          <div
            aria-hidden
            className="bg-line-strong mx-auto mb-3 h-1 w-10 rounded-full sm:hidden"
          />
          <div className="mb-3 flex items-center justify-between">
            <h2 id="sheet-title" className="font-display text-title">
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="text-ink-soft hover:bg-sunken -mr-2 grid size-11 place-items-center rounded-full"
            >
              <CloseIcon />
            </button>
          </div>
          {children}
        </div>
      )}
    </dialog>
  )
}

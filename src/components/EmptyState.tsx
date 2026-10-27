import type { ReactNode } from 'react'

export function EmptyState({
  title,
  children,
  action,
}: {
  title: string
  children?: ReactNode
  action?: ReactNode
}) {
  return (
    <div className="anim-fade mx-auto flex max-w-xs flex-col items-center gap-3 py-12 text-center">
      <svg aria-hidden viewBox="0 0 64 32" className="text-line-strong w-16" fill="none">
        <path
          d="M2 24C16 2 26 30 38 14s16-6 24-10"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <circle cx="62" cy="4" r="2" fill="currentColor" />
      </svg>
      <h2 className="font-display text-xl">{title}</h2>
      {children && <p className="text-ink-soft text-[0.95rem] leading-relaxed">{children}</p>}
      {action}
    </div>
  )
}

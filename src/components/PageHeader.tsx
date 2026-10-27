import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeftIcon } from './icons'

export function PageHeader({
  title,
  eyebrow,
  back,
  action,
}: {
  title: string
  eyebrow?: string
  back?: { to: string; label: string }
  action?: ReactNode
}) {
  return (
    <header className="mb-6">
      {back && (
        <Link
          to={back.to}
          className="text-ink-soft hover:text-ink mb-1 -ml-2 inline-flex min-h-11 items-center gap-1 rounded-full px-2 text-sm"
        >
          <ChevronLeftIcon width={18} height={18} />
          {back.label}
        </Link>
      )}
      <div className="flex items-end justify-between gap-4">
        <div>
          {eyebrow && <p className="text-ink-faint mb-1 text-sm">{eyebrow}</p>}
          <h1 className="font-display text-[2rem] leading-tight">{title}</h1>
        </div>
        {action}
      </div>
    </header>
  )
}

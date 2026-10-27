import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

/**
 * The recurring thread: a single continuous line linking things that belong together.
 * `ThreadList` runs it down the left of a stream; `ThreadCurve` links two blocks.
 */
export function ThreadList({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <ol className={cn('border-line-strong relative ml-[9px] border-l border-dashed', className)}>
      {children}
    </ol>
  )
}

export function ThreadItem({ children, active }: { children: ReactNode; active?: boolean }) {
  return (
    <li className="relative pb-6 pl-6 last:pb-0">
      <span
        aria-hidden
        className={cn(
          'ring-paper absolute top-[0.55rem] -left-[5px] size-[9px] rounded-full ring-4',
          active ? 'bg-accent' : 'bg-line-strong',
        )}
      />
      {children}
    </li>
  )
}

export function ThreadCurve({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 40"
      className={cn('text-accent h-10 w-6', className)}
      fill="none"
    >
      <path
        d="M12 0C12 14 4 14 4 24s8 10 8 16"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeDasharray="1 4"
      />
    </svg>
  )
}

/** Progress as a thread with knots, used in gift projects. */
export function ThreadProgress({ done, total }: { done: number; total: number }) {
  const pct = total === 0 ? 0 : (done / total) * 100
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={done}
      aria-label="Preparation progress"
      className="relative h-3"
    >
      <div className="bg-line-strong absolute top-1/2 h-px w-full -translate-y-1/2" />
      <div
        className="bg-accent absolute top-1/2 h-0.5 -translate-y-1/2 rounded-full transition-[width] duration-[var(--dur-base)] ease-[var(--ease-soft)]"
        style={{ width: `${pct}%` }}
      />
      <div
        className="bg-accent ring-paper absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full ring-4 transition-[left] duration-[var(--dur-base)] ease-[var(--ease-soft)]"
        style={{ left: `${pct}%` }}
      />
    </div>
  )
}

import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

/**
 * The thread: one continuous cord that ties thoughts, moments and gifts together.
 * Built from three parts: `Knot` (a point on the cord), `ThreadList` (the cord down a stream),
 * and `ThreadBridge` (a slack curve linking one block to the next).
 */

/** A small mizuhiki-style knot: a ring on the cord, filled when something is tied to it. */
export function Knot({ tied, className }: { tied?: boolean; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        'bg-paper grid size-[13px] place-items-center rounded-full border-[1.5px]',
        tied ? 'border-accent' : 'border-line-strong',
        className,
      )}
    >
      {tied && <span className="bg-accent size-[4px] rounded-full" />}
    </span>
  )
}

export function ThreadList({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <ol className={cn('border-line-strong relative ml-[6px] border-l', className)}>{children}</ol>
  )
}

export function ThreadItem({ children, tied }: { children: ReactNode; tied?: boolean }) {
  return (
    <li className="relative pb-7 pl-7 last:pb-0">
      <Knot tied={tied} className="absolute top-[0.45rem] -left-[7px]" />
      {children}
    </li>
  )
}

/**
 * Slack in the cord between two blocks. Sits at a fixed x so the thread reads as one line
 * running down the page behind the cards. `x` is the cord's distance from the left edge.
 */
export function ThreadBridge({ x = 41, height = 32 }: { x?: number; height?: number }) {
  return (
    <svg
      aria-hidden
      width={x + 16}
      height={height}
      viewBox={`0 0 ${x + 16} ${height}`}
      className="block overflow-visible text-[var(--thread)]"
      fill="none"
    >
      <path
        d={`M${x} 0C${x + 14} ${height * 0.3} ${x + 14} ${height * 0.7} ${x} ${height}`}
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  )
}

/** Progress as a cord with one knot per step. Tied knots are the steps already done. */
export function ThreadProgress({ done, total }: { done: number; total: number }) {
  const count = Math.max(total, 1)
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={done}
      aria-label="Preparation progress"
      className="relative flex h-4 items-center justify-between px-[7px]"
    >
      <div className="bg-line-strong absolute inset-x-[7px] top-1/2 h-px" />
      <div
        className="bg-accent absolute top-1/2 left-[7px] h-[1.5px] -translate-y-1/2 transition-[width] duration-[var(--dur-base)] ease-[var(--ease-soft)]"
        style={{
          width:
            total <= 1
              ? done > 0
                ? 'calc(100% - 14px)'
                : '0'
              : `calc((100% - 14px) * ${Math.min(done, total - 1) / (total - 1)})`,
        }}
      />
      {Array.from({ length: count }, (_, i) => (
        <Knot key={i} tied={i < done} className="relative" />
      ))}
    </div>
  )
}

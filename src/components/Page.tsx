import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

export function Page({
  children,
  wide,
  className,
}: {
  children: ReactNode
  wide?: boolean
  className?: string
}) {
  return (
    <div
      className={cn(
        'mx-auto w-full px-[var(--space-page-x)] pt-8 md:pt-12',
        wide ? 'max-w-5xl' : 'max-w-[var(--column-max)]',
        className,
      )}
    >
      {children}
    </div>
  )
}

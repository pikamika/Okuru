import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

type Variant = 'primary' | 'soft' | 'ghost'

const styles: Record<Variant, string> = {
  primary: 'bg-accent text-on-accent hover:bg-accent-strong shadow-card',
  soft: 'bg-sunken text-ink hover:bg-line',
  ghost: 'text-ink-soft hover:bg-sunken',
}

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
}

export function Button({ variant = 'primary', className, type = 'button', ...rest }: Props) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 text-[0.95rem] font-medium',
        'transition-colors duration-[var(--dur-fast)] disabled:cursor-not-allowed disabled:opacity-50',
        styles[variant],
        className,
      )}
      {...rest}
    />
  )
}

import { cn } from '@/lib/cn'

const tints = ['#f4e1d8', '#e4e8d9', '#ece3d2', '#e9dde0', '#dfe6e8']

function tintFor(name: string) {
  let h = 0
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) % tints.length
  return tints[h]
}

export function Avatar({
  name,
  size = 44,
  className,
}: {
  name: string
  size?: number
  className?: string
}) {
  return (
    <span
      aria-hidden
      style={{ width: size, height: size, background: tintFor(name), fontSize: size * 0.42 }}
      className={cn(
        'font-display text-ink grid shrink-0 place-items-center rounded-full',
        className,
      )}
    >
      {name.trim().charAt(0).toUpperCase()}
    </span>
  )
}

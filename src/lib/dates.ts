import type { IsoDate } from '@/types'

const DAY = 86_400_000

export const nowIso = (): IsoDate => new Date().toISOString()

export const newId = (): string => crypto.randomUUID()

/** `YYYY-MM-DD` for a local date. */
export function toDateOnly(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

/** Parse `YYYY-MM-DD` as a local date (avoids the UTC off-by-one). */
export function parseDateOnly(s: string): Date {
  const [y, m, d] = s.slice(0, 10).split('-').map(Number)
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1)
}

export function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

export function addDays(d: Date, n: number): Date {
  const x = new Date(d)
  x.setDate(x.getDate() + n)
  return x
}

export function daysBetween(from: Date, to: Date): number {
  return Math.round((startOfDay(to).getTime() - startOfDay(from).getTime()) / DAY)
}

/** Next time an occasion falls on or after `from`, or null if a one-off that has passed. */
export function nextOccurrence(
  date: string,
  recurs: 'yearly' | 'none',
  from: Date = new Date(),
): Date | null {
  const base = parseDateOnly(date)
  const today = startOfDay(from)
  if (recurs === 'none') return base >= today ? base : null
  const thisYear = new Date(today.getFullYear(), base.getMonth(), base.getDate())
  return thisYear >= today
    ? thisYear
    : new Date(today.getFullYear() + 1, base.getMonth(), base.getDate())
}

/** "in 3 weeks", "tomorrow", "today" — warm, approximate. */
export function whenPhrase(days: number): string {
  if (days <= 0) return 'today'
  if (days === 1) return 'tomorrow'
  if (days < 14) return `in ${days} days`
  if (days < 60) return `in ${Math.round(days / 7)} weeks`
  return `in ${Math.round(days / 30)} months`
}

/** "last June", "3 weeks ago" — how long ago a thought was noticed. */
export function agoPhrase(iso: string, now: Date = new Date()): string {
  const d = new Date(iso)
  const days = daysBetween(d, now)
  if (days <= 0) return 'today'
  if (days === 1) return 'yesterday'
  if (days < 14) return `${days} days ago`
  if (days < 60) return `${Math.round(days / 7)} weeks ago`
  const sameYear = d.getFullYear() === now.getFullYear()
  const month = d.toLocaleDateString(undefined, { month: 'long' })
  return sameYear ? `in ${month}` : `in ${month} ${d.getFullYear()}`
}

export function formatDate(s: string, withYear = true): string {
  return parseDateOnly(s).toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    ...(withYear ? { year: 'numeric' } : {}),
  })
}

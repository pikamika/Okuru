import { describe, expect, it } from 'vitest'
import {
  addDays,
  agoPhrase,
  daysBetween,
  nextOccurrence,
  parseDateOnly,
  toDateOnly,
  whenPhrase,
} from './dates'

describe('date-only helpers', () => {
  it('round-trips a date without a time zone shift', () => {
    expect(toDateOnly(parseDateOnly('2026-03-14'))).toBe('2026-03-14')
    expect(toDateOnly(new Date(2026, 0, 5))).toBe('2026-01-05')
  })

  it('counts whole calendar days', () => {
    expect(daysBetween(new Date(2026, 0, 1, 23, 0), new Date(2026, 0, 2, 1, 0))).toBe(1)
    expect(daysBetween(new Date(2026, 0, 10), new Date(2026, 0, 3))).toBe(-7)
  })

  it('adds days across a month end', () => {
    expect(toDateOnly(addDays(new Date(2026, 0, 30), 3))).toBe('2026-02-02')
  })
})

describe('nextOccurrence', () => {
  const from = new Date(2026, 5, 15)

  it('keeps a yearly date that is still ahead this year', () => {
    expect(toDateOnly(nextOccurrence('1990-08-20', 'yearly', from)!)).toBe('2026-08-20')
  })

  it('rolls a yearly date that has passed to next year', () => {
    expect(toDateOnly(nextOccurrence('1990-02-01', 'yearly', from)!)).toBe('2027-02-01')
  })

  it('counts today as still ahead', () => {
    expect(toDateOnly(nextOccurrence('2000-06-15', 'yearly', from)!)).toBe('2026-06-15')
  })

  it('returns null for a one-off in the past and the date for one ahead', () => {
    expect(nextOccurrence('2026-01-01', 'none', from)).toBeNull()
    expect(toDateOnly(nextOccurrence('2026-07-01', 'none', from)!)).toBe('2026-07-01')
  })
})

describe('phrases', () => {
  it('words upcoming days warmly', () => {
    expect(whenPhrase(0)).toBe('today')
    expect(whenPhrase(1)).toBe('tomorrow')
    expect(whenPhrase(5)).toBe('in 5 days')
    expect(whenPhrase(21)).toBe('in 3 weeks')
    expect(whenPhrase(120)).toBe('in 4 months')
  })

  it('words past days warmly', () => {
    const now = new Date(2026, 5, 15, 12)
    expect(agoPhrase(new Date(2026, 5, 15, 8).toISOString(), now)).toBe('today')
    expect(agoPhrase(new Date(2026, 5, 14, 8).toISOString(), now)).toBe('yesterday')
    expect(agoPhrase(new Date(2026, 5, 8, 8).toISOString(), now)).toBe('7 days ago')
    expect(agoPhrase(new Date(2026, 4, 11, 8).toISOString(), now)).toBe('5 weeks ago')
  })
})

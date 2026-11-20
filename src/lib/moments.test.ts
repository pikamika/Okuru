import { describe, expect, it } from 'vitest'
import type { GiftIdea, Occasion, Person, Thought } from '@/types'
import { resurfaceMoments } from './moments'

const stamp = '2026-01-01T00:00:00.000Z'
const base = { createdAt: stamp, updatedAt: stamp }
const now = new Date(2026, 5, 15)

const person = (id: string): Person => ({ ...base, id, name: id, relationships: [], tags: [] })
const occasion = (id: string, personId: string, date: string, recurs: Occasion['recurs']) =>
  ({
    ...base,
    id,
    personId,
    kind: 'birthday',
    title: id,
    date,
    recurs,
    yearKnown: true,
  }) as Occasion
const thought = (id: string, personId: string, observedAt: string, extra = {}): Thought => ({
  ...base,
  id,
  personId,
  body: id,
  source: 'typed',
  observedAt,
  ...extra,
})

describe('resurfaceMoments', () => {
  it('pairs an upcoming occasion with a thought about the same person', () => {
    const out = resurfaceMoments(
      [person('mum')],
      [occasion('b', 'mum', '1960-06-30', 'yearly')],
      [thought('t', 'mum', '2026-02-01T00:00:00.000Z')],
      [],
      now,
    )
    expect(out).toHaveLength(1)
    expect(out[0]).toMatchObject({ daysAway: 15 })
    expect(out[0]?.thought.id).toBe('t')
  })

  it('ignores occasions beyond the window, in the past, or with no thoughts', () => {
    const out = resurfaceMoments(
      [person('a'), person('b'), person('c')],
      [
        occasion('far', 'a', '2026-12-25', 'none'),
        occasion('past', 'b', '2026-01-01', 'none'),
        occasion('empty', 'c', '2026-06-20', 'none'),
      ],
      [thought('ta', 'a', stamp), thought('tb', 'b', stamp)],
      [],
      now,
    )
    expect(out).toEqual([])
  })

  it('prefers a thought linked to the occasion, then the newest', () => {
    const o = occasion('b', 'mum', '2026-06-20', 'none')
    const linked = thought('linked', 'mum', '2026-01-01T00:00:00.000Z', { occasionId: 'b' })
    const newer = thought('newer', 'mum', '2026-05-01T00:00:00.000Z')
    expect(resurfaceMoments([person('mum')], [o], [newer, linked], [], now)[0]?.thought.id).toBe(
      'linked',
    )
    expect(
      resurfaceMoments(
        [person('mum')],
        [{ ...o, id: 'other' }],
        [thought('old', 'mum', '2026-01-01T00:00:00.000Z'), newer],
        [],
        now,
      )[0]?.thought.id,
    ).toBe('newer')
  })

  it('attaches the gift idea that came from the chosen thought', () => {
    const idea: GiftIdea = {
      ...base,
      id: 'i',
      personId: 'mum',
      title: 'Mug',
      status: 'idea',
      sourceThoughtId: 't',
    }
    const out = resurfaceMoments(
      [person('mum')],
      [occasion('b', 'mum', '2026-06-20', 'none')],
      [thought('t', 'mum', stamp)],
      [idea],
      now,
    )
    expect(out[0]?.giftIdea?.id).toBe('i')
  })

  it('returns at most three, soonest first', () => {
    const people = ['a', 'b', 'c', 'd'].map(person)
    const occasions = [
      occasion('o4', 'd', '2026-07-30', 'none'),
      occasion('o1', 'a', '2026-06-16', 'none'),
      occasion('o3', 'c', '2026-07-10', 'none'),
      occasion('o2', 'b', '2026-06-25', 'none'),
    ]
    const thoughts = people.map((p) => thought(`t-${p.id}`, p.id, stamp))
    const out = resurfaceMoments(people, occasions, thoughts, [], now)
    expect(out.map((m) => m.occasion.id)).toEqual(['o1', 'o2', 'o3'])
  })
})

import type { GiftIdea, Occasion, Person, Thought } from '@/types'
import { daysBetween, nextOccurrence } from './dates'

export interface Moment {
  occasion: Occasion
  person: Person
  /** The past observation that surfaced for this moment. */
  thought: Thought
  giftIdea?: GiftIdea
  daysAway: number
}

const WINDOW_DAYS = 60
const MAX_MOMENTS = 3

/**
 * Ties an upcoming occasion to a thought you already had. Pure and deterministic:
 * the later swap to a smarter (or server-side) resurfacer only changes this function.
 */
export function resurfaceMoments(
  people: Person[],
  occasions: Occasion[],
  thoughts: Thought[],
  ideas: GiftIdea[],
  now: Date = new Date(),
): Moment[] {
  const moments: Moment[] = []
  for (const occasion of occasions) {
    const person = people.find((p) => p.id === occasion.personId)
    if (!person) continue
    const next = nextOccurrence(occasion.date, occasion.recurs, now)
    if (!next) continue
    const daysAway = daysBetween(now, next)
    if (daysAway > WINDOW_DAYS) continue

    const candidates = thoughts.filter((t) => t.personId === person.id)
    const score = (t: Thought) =>
      (t.occasionId === occasion.id ? 4 : 0) +
      (ideas.some((i) => i.sourceThoughtId === t.id) ? 2 : 0) +
      (t.giftIdeaId ? 1 : 0)
    const thought = [...candidates].sort(
      (a, b) => score(b) - score(a) || b.observedAt.localeCompare(a.observedAt),
    )[0]
    if (!thought) continue
    const giftIdea = ideas.find(
      (i) => i.sourceThoughtId === thought.id || i.id === thought.giftIdeaId,
    )
    moments.push({ occasion, person, thought, giftIdea, daysAway })
  }
  return moments.sort((a, b) => a.daysAway - b.daysAway).slice(0, MAX_MOMENTS)
}

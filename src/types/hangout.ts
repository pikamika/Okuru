import type { Entity, Id } from './common'

/** What a hangout did to what you thought you knew about someone. */
export type Reflection = 'learned' | 'confirmed' | 'surprised'

export interface Hangout extends Entity {
  personId: Id
  /** "Brunch", "Climbing", "Dinner at theirs". */
  title: string
  /** Date only, `YYYY-MM-DD`. */
  happenedAt: string
  reflection?: Reflection
  /** The one thing worth remembering. Also kept as a thought on the person. */
  takeaway?: string
  thoughtId?: Id
}

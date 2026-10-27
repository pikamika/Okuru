import type { Entity, Id, IsoDate } from './common'

export type ThoughtSource = 'typed' | 'voice' | 'share'

export interface Thought extends Entity {
  personId: Id
  body: string
  source: ThoughtSource
  /** When the thing was noticed (defaults to creation time). */
  observedAt: IsoDate
  occasionId?: Id
  giftIdeaId?: Id
}

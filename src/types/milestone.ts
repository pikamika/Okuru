import type { Entity, Id, IsoDate } from './common'
import type { OccasionKind } from './occasion'

export type MilestoneStatus = 'pending' | 'confirmed' | 'not_sure' | 'not_relevant'

/** A question we ask, never an assumption we make. */
export interface MilestoneSuggestion extends Entity {
  personId: Id
  sourceThoughtId: Id
  prompt: string
  proposedKind: OccasionKind
  proposedTitle: string
  status: MilestoneStatus
  /** The date the user confirmed. */
  answeredDate?: IsoDate
  occasionId?: Id
}

import type { Entity, Id, IsoDate } from './common'

export type OccasionKind = 'birthday' | 'anniversary' | 'milestone' | 'custom'

export interface Occasion extends Entity {
  personId: Id
  kind: OccasionKind
  title: string
  /** `YYYY-MM-DD`. When `yearKnown` is false the year is a placeholder and ignored. */
  date: IsoDate
  yearKnown: boolean
  recurs: 'yearly' | 'none'
}

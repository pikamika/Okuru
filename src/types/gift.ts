import type { Entity, Id, IsoDate } from './common'

export type GiftIdeaStatus = 'idea' | 'chosen' | 'given'

export interface GiftIdea extends Entity {
  personId: Id
  title: string
  note?: string
  sourceThoughtId?: Id
  status: GiftIdeaStatus
}

export type GiftProjectStatus = 'planning' | 'given'

export interface GiftProject extends Entity {
  personId: Id
  occasionId?: Id
  giftIdeaId?: Id
  title: string
  /** Minor units (cents). Single currency in V1. */
  budgetCents?: number
  notes: string
  status: GiftProjectStatus
  givenAt?: IsoDate
  /** How it landed: "really appreciated the handwritten card". Shown in gift history. */
  reaction?: string
}

export type ChecklistKind = 'buy' | 'note' | 'wrap' | 'ship' | 'custom'

export interface ChecklistItem extends Entity {
  projectId: Id
  kind: ChecklistKind
  label: string
  done: boolean
  dueDate?: IsoDate
  sortOrder: number
}

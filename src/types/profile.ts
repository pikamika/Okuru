import type { Entity, Id, IsoDate } from './common'

/** The signed-in user's own profile. One per account; email comes from sign-in, not here. */
export interface UserProfile {
  firstName?: string
  lastName?: string
  /** Four letters, e.g. "INFJ". Optional, and only ever a hint. */
  mbti?: string
  interests: string[]
  notes?: string
}

/** Someone in your notebook you're linked to. Shown on your profile only. */
export interface SelfConnection extends Entity {
  personId: Id
  /** "Best friend", "Climbing partner"... free text. */
  label?: string
  note?: string
}

/** Something you were given. The reverse of a gift project. */
export interface ReceivedGift extends Entity {
  title: string
  /** Either someone in your notebook or a typed name. */
  fromPersonId?: Id
  fromName?: string
  /** `YYYY-MM-DD`. */
  receivedAt?: IsoDate
  /** "Birthday", "Moving-in"... free text. */
  occasion?: string
  /** How it felt, or why it stuck with you. */
  note?: string
}

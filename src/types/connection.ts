import type { Entity, Id } from './common'

/**
 * A link between two people in your life: "same friend group", "sibling".
 * Stored once and shown on both profiles. Either `otherPersonId` (someone in Okuru) or
 * `otherName` (someone who isn't, yet) is set. A name-only entry can be promoted later.
 */
export interface Connection extends Entity {
  personId: Id
  otherPersonId?: Id
  otherName?: string
  /** "Sibling", "Same friend group"... free text; unset means "not sure yet". */
  label?: string
  note?: string
}

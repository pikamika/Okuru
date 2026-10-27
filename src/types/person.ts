import type { Entity } from './common'

export type PersonTagKind = 'size' | 'brand' | 'interest' | 'other'

/** A light, optional detail: "size 9 shoes", "likes Aesop", "ceramics". */
export interface PersonTag {
  kind: PersonTagKind
  label: string
}

export interface Person extends Entity {
  name: string
  /** Free text: "sister", "college friend". */
  relationship?: string
  tags: PersonTag[]
}

import type { Entity } from './common'

export type PersonTagKind = 'size' | 'brand' | 'interest' | 'other'

/** A light, optional detail: "size 9 shoes", "likes Aesop", "ceramics". */
export interface PersonTag {
  kind: PersonTagKind
  label: string
}

export interface Person extends Entity {
  name: string
  /** Several can be true at once: ["Family", "Close friend"]. Presets or free text. */
  relationships: string[]
  /** Anything specific worth remembering about who they are to you. */
  notes?: string
  /** Four letters, e.g. "INFJ". Optional, and only ever a hint. */
  mbti?: string
  tags: PersonTag[]
}

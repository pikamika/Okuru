import type { Entity, Id } from './common'

/** What a suggestion is for: the gift itself, or something to put inside / around it. */
export type SuggestionKind = 'gift' | 'content'

export interface Suggestion {
  id: Id
  kind: SuggestionKind
  text: string
  /** Why it fits this person, drawn from what you've noticed. */
  why?: string
}

export interface BrainstormMessage extends Entity {
  projectId: Id
  role: 'user' | 'assistant'
  text: string
  suggestions?: Suggestion[]
}

import type {
  BrainstormMessage,
  GiftIdea,
  GiftProject,
  Occasion,
  Person,
  Suggestion,
  Thought,
} from '@/types'

/** Everything the agent may know about the person when brainstorming. */
export interface BrainstormContext {
  person: Person
  project: GiftProject
  occasion?: Occasion
  thoughts: Thought[]
  ideas: GiftIdea[]
  /** People linked to this person, with the link label. */
  connections: { name: string; label?: string }[]
}

export interface AgentReply {
  text: string
  suggestions: Suggestion[]
}

/**
 * The seam for the gift-brainstorm agent. The mock in `./mock.ts` is scripted.
 * A real implementation calls a server endpoint that talks to a model (never from the
 * browser, so the API key stays private) and returns the same shape.
 */
export interface AgentService {
  brainstorm(
    context: BrainstormContext,
    history: BrainstormMessage[],
    userText: string,
  ): Promise<AgentReply>
}

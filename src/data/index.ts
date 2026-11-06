import type { Repositories } from './repositories'
import type { AgentService } from './agent'
import { mockAgent } from './agent/mock'
import { createMockRepositories } from './mock/repositories'

/**
 * The one place the data implementation is chosen.
 * To move to Supabase: build `createSupabaseRepositories()` and return it here.
 */
export const repositories: Repositories = createMockRepositories()

/**
 * The gift-brainstorm agent. Scripted for now; swap for a call to a server endpoint that
 * talks to a model, returning the same `AgentReply` shape.
 */
export const agent: AgentService = mockAgent

import type { Repositories } from './repositories'
import type { AgentService } from './agent'
import { mockAgent } from './agent/mock'
import { createMockRepositories } from './mock/repositories'
import { isSupabaseConfigured } from './supabase/client'
import { createSupabaseRepositories } from './supabase/repositories'

/**
 * The one place the data implementation is chosen. With `VITE_SUPABASE_URL` and
 * `VITE_SUPABASE_ANON_KEY` set it uses Supabase; otherwise local mock data.
 */
export const repositories: Repositories = isSupabaseConfigured
  ? createSupabaseRepositories()
  : createMockRepositories()

/**
 * The gift-brainstorm agent. Scripted for now; swap for a call to a server endpoint that
 * talks to a model, returning the same `AgentReply` shape.
 */
export const agent: AgentService = mockAgent

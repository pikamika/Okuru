import type { Repositories } from './repositories'
import { createMockRepositories } from './mock/repositories'

/**
 * The one place the data implementation is chosen.
 * To move to Supabase: build `createSupabaseRepositories()` and return it here.
 */
export const repositories: Repositories = createMockRepositories()

import type { Repositories } from '../repositories'
import type {
  BrainstormMessage,
  ChecklistItem,
  Connection,
  GiftIdea,
  GiftProject,
  MilestoneSuggestion,
  Occasion,
  Person,
  Thought,
} from '@/types'
import { supabase } from './client'

const toSnake = (s: string) => s.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`)
const toCamel = (s: string) => s.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase())

/** App objects use camelCase and `undefined`; the database uses snake_case and `null`. */
function toRow(input: object, clearUndefined: boolean): Record<string, unknown> {
  const row: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(input)) {
    if (v === undefined) {
      if (clearUndefined) row[toSnake(k)] = null
    } else row[toSnake(k)] = v
  }
  return row
}

function fromRow<T>(row: Record<string, unknown>): T {
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(row)) {
    if (k === 'user_id' || v === null) continue
    out[toCamel(k)] = v
  }
  return out as T
}

function check<T>({ data, error }: { data: T; error: { message: string } | null }): T {
  if (error) throw new Error(error.message)
  return data
}

type Row = Record<string, unknown>

function collection<T extends { id: string }>(table: string) {
  const mapAll = (rows: Row[] | null) => (rows ?? []).map((r) => fromRow<T>(r))
  return {
    async list(): Promise<T[]> {
      return mapAll(check(await supabase.from(table).select('*')))
    },
    async get(id: string): Promise<T | null> {
      const row = check(await supabase.from(table).select('*').eq('id', id).maybeSingle())
      return row ? fromRow<T>(row) : null
    },
    async create(input: object): Promise<T> {
      const row = check(await supabase.from(table).insert(toRow(input, false)).select().single())
      return fromRow<T>(row)
    },
    async update(id: string, patch: object): Promise<T> {
      const row = check(
        await supabase.from(table).update(toRow(patch, true)).eq('id', id).select().single(),
      )
      return fromRow<T>(row)
    },
    async remove(id: string): Promise<void> {
      check(await supabase.from(table).delete().eq('id', id))
    },
    /** Rows where `column` equals `value`. */
    async where(column: string, value: string): Promise<T[]> {
      return mapAll(check(await supabase.from(table).select('*').eq(column, value)))
    },
  }
}

export function createSupabaseRepositories(): Repositories {
  const people = collection<Person>('people')
  const thoughts = collection<Thought>('thoughts')
  const occasions = collection<Occasion>('occasions')
  const giftIdeas = collection<GiftIdea>('gift_ideas')
  const giftProjects = collection<GiftProject>('gift_projects')
  const checklist = collection<ChecklistItem>('checklist_items')
  const milestones = collection<MilestoneSuggestion>('milestone_suggestions')
  const connections = collection<Connection>('connections')
  const brainstorm = collection<BrainstormMessage>('brainstorm_messages')

  const newest = (a: Thought, b: Thought) => b.observedAt.localeCompare(a.observedAt)

  return {
    people,
    thoughts: {
      ...thoughts,
      async listByPerson(personId) {
        return (await thoughts.where('person_id', personId)).sort(newest)
      },
      async listRecent(limit) {
        const rows = check(
          await supabase
            .from('thoughts')
            .select('*')
            .order('observed_at', { ascending: false })
            .limit(limit),
        )
        return (rows ?? []).map((r) => fromRow<Thought>(r))
      },
    },
    occasions: { ...occasions, listByPerson: (id) => occasions.where('person_id', id) },
    giftIdeas: { ...giftIdeas, listByPerson: (id) => giftIdeas.where('person_id', id) },
    giftProjects: { ...giftProjects, listByPerson: (id) => giftProjects.where('person_id', id) },
    checklist: {
      ...checklist,
      async listByProject(projectId) {
        return (await checklist.where('project_id', projectId)).sort(
          (a, b) => a.sortOrder - b.sortOrder,
        )
      },
    },
    milestones: {
      ...milestones,
      async listPending() {
        return milestones.where('status', 'pending')
      },
    },
    connections: {
      ...connections,
      async listByPerson(personId) {
        const rows = check(
          await supabase
            .from('connections')
            .select('*')
            .or(`person_id.eq.${personId},other_person_id.eq.${personId}`),
        )
        return (rows ?? []).map((r) => fromRow<Connection>(r))
      },
    },
    brainstorm: {
      ...brainstorm,
      async listByProject(projectId) {
        return (await brainstorm.where('project_id', projectId)).sort((a, b) =>
          a.createdAt.localeCompare(b.createdAt),
        )
      },
    },
    settings: {
      async getOnboarded() {
        const row = check(await supabase.from('user_settings').select('onboarded').maybeSingle())
        return row?.onboarded ?? false
      },
      async setOnboarded(value) {
        const { data } = await supabase.auth.getSession()
        const userId = data.session?.user.id
        if (!userId) throw new Error('Not signed in')
        check(await supabase.from('user_settings').upsert({ user_id: userId, onboarded: value }))
      },
    },
  }
}

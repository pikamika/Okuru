import type { Crud } from '../repositories'
import type { Entity, Id } from '@/types'
import { newId, nowIso } from '@/lib/dates'
import { buildSeed, type Db } from './seed'

const KEY = 'okuru.mock.v1'

let cache: Db | null = null

function load(): Db {
  if (cache) return cache
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      cache = JSON.parse(raw) as Db
      return cache
    }
  } catch {
    /* fall through to seed */
  }
  cache = buildSeed()
  persist()
  return cache
}

function persist() {
  try {
    if (cache) localStorage.setItem(KEY, JSON.stringify(cache))
  } catch {
    /* storage full or blocked: keep working in memory */
  }
}

export function db(): Db {
  return load()
}

export function save() {
  persist()
}

/** Wipe local data; the next read re-seeds. Handy in dev. */
export function resetMockData() {
  cache = null
  try {
    localStorage.removeItem(KEY)
  } catch {
    /* ignore */
  }
}

type CollectionKey = {
  [K in keyof Db]: Db[K] extends Entity[] ? K : never
}[keyof Db]

/** Simulates network latency so loading states stay honest. */
const tick = () => new Promise<void>((r) => setTimeout(r, 40))

export function createCollection<T extends Entity>(
  key: CollectionKey,
): Crud<T, Omit<T, keyof Entity>> & { all(): T[] } {
  const all = () => db()[key] as unknown as T[]
  return {
    all,
    async list() {
      await tick()
      return [...all()]
    },
    async get(id: Id) {
      await tick()
      return all().find((x) => x.id === id) ?? null
    },
    async create(input) {
      await tick()
      const now = nowIso()
      const row = { ...input, id: newId(), createdAt: now, updatedAt: now } as unknown as T
      all().push(row)
      save()
      return row
    },
    async update(id, patch) {
      await tick()
      const rows = all()
      const i = rows.findIndex((x) => x.id === id)
      const current = rows[i]
      if (i < 0 || !current) throw new Error(`Not found: ${id}`)
      const next = { ...current, ...patch, updatedAt: nowIso() } as T
      rows[i] = next
      save()
      return next
    },
    async remove(id) {
      await tick()
      const rows = all()
      const i = rows.findIndex((x) => x.id === id)
      if (i >= 0) rows.splice(i, 1)
      save()
    },
  }
}

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { GiftIdea, GiftProject, Person, Thought } from '@/types'
import type { BrainstormContext } from '.'
import { mockAgent } from './mock'

const stamp = '2026-01-01T00:00:00.000Z'
const base = { createdAt: stamp, updatedAt: stamp }

const person: Person = {
  ...base,
  id: 'p',
  name: 'Priya',
  relationships: ['Friend'],
  mbti: 'INFJ',
  tags: [{ kind: 'interest', label: 'running' }],
}
const project: GiftProject = {
  ...base,
  id: 'g',
  personId: 'p',
  title: 'A gift',
  notes: '',
  status: 'planning',
}
const thought: Thought = {
  ...base,
  id: 't',
  personId: 'p',
  body: 'She keeps eyeing a running belt.',
  source: 'typed',
  observedAt: stamp,
}
const idea: GiftIdea = {
  ...base,
  id: 'i',
  personId: 'p',
  title: 'Running belt',
  status: 'idea',
  sourceThoughtId: 't',
}

const ctx = (over: Partial<BrainstormContext> = {}): BrainstormContext => ({
  person,
  project,
  thoughts: [],
  ideas: [],
  connections: [],
  ...over,
})

async function reply(context: BrainstormContext, text: string, userTurns = 1) {
  const history = Array.from({ length: userTurns }, () => ({
    ...base,
    id: crypto.randomUUID(),
    projectId: 'g',
    role: 'user' as const,
    text,
  }))
  const pending = mockAgent.brainstorm(context, history, text)
  await vi.advanceTimersByTimeAsync(1000)
  return pending
}

describe('mockAgent', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('opens with ideas grounded in what you noted', async () => {
    const r = await reply(ctx({ thoughts: [thought], ideas: [idea] }), 'Help me think')
    expect(r.suggestions[0]?.text).toBe('Running belt')
    expect(r.suggestions[0]?.why).toContain('running belt')
    expect(r.suggestions.length).toBeLessThanOrEqual(3)
    expect(r.text).toContain('INFJ')
  })

  it('says so when it knows very little', async () => {
    const r = await reply(ctx({ person: { ...person, mbti: undefined, tags: [] } }), 'Hi')
    expect(r.text).toContain('not have much about Priya')
    expect(r.suggestions.length).toBeGreaterThan(0)
  })

  it('routes by what you ask for', async () => {
    const c = ctx({ thoughts: [thought] })
    expect((await reply(c, 'what should I write inside?')).suggestions[0]?.kind).toBe('content')
    expect((await reply(c, 'something to do together')).suggestions).toHaveLength(3)
    expect((await reply(c, 'something handmade')).suggestions).toHaveLength(3)
  })

  it('uses the budget when one is set', async () => {
    const withBudget = ctx({ project: { ...project, budgetCents: 5000 } })
    expect((await reply(withBudget, 'keep it cheap')).text).toContain('$50')
  })

  it('offers directions on later turns instead of repeating itself', async () => {
    const r = await reply(ctx(), 'hmm not sure', 3)
    expect(r.suggestions).toEqual([])
    expect(r.text).toContain('Priya')
  })
})

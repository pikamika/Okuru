import { beforeEach, describe, expect, it } from 'vitest'
import { createMockRepositories } from './repositories'
import { resetMockData } from './store'

describe('mock repositories', () => {
  beforeEach(() => resetMockData())

  it('starts with sample people and not yet onboarded', async () => {
    const r = createMockRepositories()
    expect((await r.people.list()).length).toBeGreaterThan(0)
    expect(await r.settings.getOnboarded()).toBe(false)
  })

  it('creates, updates and removes a person', async () => {
    const r = createMockRepositories()
    const p = await r.people.create({ name: 'Such', relationships: ['Friend'], tags: [] })
    expect((await r.people.get(p.id))?.name).toBe('Such')
    await r.people.update(p.id, { name: 'Such Q' })
    expect((await r.people.get(p.id))?.name).toBe('Such Q')
    await r.people.remove(p.id)
    expect(await r.people.get(p.id)).toBeNull()
  })

  it('lists a person’s thoughts newest first', async () => {
    const r = createMockRepositories()
    const p = await r.people.create({ name: 'Such', relationships: [], tags: [] })
    const mk = (body: string, observedAt: string) =>
      r.thoughts.create({ personId: p.id, body, source: 'typed', observedAt })
    await mk('old', '2026-01-01T00:00:00.000Z')
    await mk('new', '2026-03-01T00:00:00.000Z')
    expect((await r.thoughts.listByPerson(p.id)).map((t) => t.body)).toEqual(['new', 'old'])
  })

  it('lists hangouts for one person, most recent first', async () => {
    const r = createMockRepositories()
    const a = await r.people.create({ name: 'A', relationships: [], tags: [] })
    const b = await r.people.create({ name: 'B', relationships: [], tags: [] })
    await r.hangouts.create({ personId: a.id, title: 'Brunch', happenedAt: '2026-02-01' })
    await r.hangouts.create({ personId: a.id, title: 'Hike', happenedAt: '2026-04-01' })
    await r.hangouts.create({ personId: b.id, title: 'Dinner', happenedAt: '2026-03-01' })
    expect((await r.hangouts.listByPerson(a.id)).map((h) => h.title)).toEqual(['Hike', 'Brunch'])
  })

  it('merges profile saves and keeps interests', async () => {
    const r = createMockRepositories()
    await r.profile.save({ firstName: 'Mika' })
    const saved = await r.profile.save({ interests: ['jazz'] })
    expect(saved).toMatchObject({ firstName: 'Mika', interests: ['jazz'] })
  })

  it('persists across a reload of the store', async () => {
    const r = createMockRepositories()
    await r.settings.setOnboarded(true)
    const raw = localStorage.getItem('okuru.mock.v1')
    expect(raw).toContain('"onboarded":true')
  })
})

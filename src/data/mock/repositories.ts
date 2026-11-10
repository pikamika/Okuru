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
  ReceivedGift,
  SelfConnection,
  Thought,
} from '@/types'
import { createCollection, db, save } from './store'

const byNewest = <T extends { observedAt: string }>(a: T, b: T) =>
  b.observedAt.localeCompare(a.observedAt)

export function createMockRepositories(): Repositories {
  const people = createCollection<Person>('people')
  const thoughts = createCollection<Thought>('thoughts')
  const occasions = createCollection<Occasion>('occasions')
  const giftIdeas = createCollection<GiftIdea>('giftIdeas')
  const giftProjects = createCollection<GiftProject>('giftProjects')
  const checklist = createCollection<ChecklistItem>('checklist')
  const milestones = createCollection<MilestoneSuggestion>('milestones')
  const connections = createCollection<Connection>('connections')
  const brainstorm = createCollection<BrainstormMessage>('brainstorm')
  const selfConnections = createCollection<SelfConnection>('selfConnections')
  const receivedGifts = createCollection<ReceivedGift>('receivedGifts')

  return {
    people,
    thoughts: {
      ...thoughts,
      async listByPerson(personId) {
        return (await thoughts.list()).filter((t) => t.personId === personId).sort(byNewest)
      },
      async listRecent(limit) {
        return (await thoughts.list()).sort(byNewest).slice(0, limit)
      },
    },
    occasions: {
      ...occasions,
      async listByPerson(personId) {
        return (await occasions.list()).filter((o) => o.personId === personId)
      },
    },
    giftIdeas: {
      ...giftIdeas,
      async listByPerson(personId) {
        return (await giftIdeas.list()).filter((g) => g.personId === personId)
      },
    },
    giftProjects: {
      ...giftProjects,
      async listByPerson(personId) {
        return (await giftProjects.list()).filter((g) => g.personId === personId)
      },
    },
    checklist: {
      ...checklist,
      async listByProject(projectId) {
        return (await checklist.list())
          .filter((c) => c.projectId === projectId)
          .sort((a, b) => a.sortOrder - b.sortOrder)
      },
    },
    milestones: {
      ...milestones,
      async listPending() {
        return (await milestones.list()).filter((m) => m.status === 'pending')
      },
    },
    connections: {
      ...connections,
      async listByPerson(personId) {
        return (await connections.list()).filter(
          (c) => c.personId === personId || c.otherPersonId === personId,
        )
      },
    },
    brainstorm: {
      ...brainstorm,
      async listByProject(projectId) {
        return (await brainstorm.list())
          .filter((m) => m.projectId === projectId)
          .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      },
    },
    profile: {
      async get() {
        return { ...db().profile }
      },
      async save(patch) {
        db().profile = { ...db().profile, ...patch }
        save()
        return { ...db().profile }
      },
    },
    selfConnections,
    receivedGifts,
    settings: {
      async getOnboarded() {
        return db().settings.onboarded
      },
      async setOnboarded(value) {
        db().settings.onboarded = value
        save()
      },
    },
  }
}

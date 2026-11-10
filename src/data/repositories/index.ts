import type {
  BrainstormMessage,
  ChecklistItem,
  Connection,
  GiftIdea,
  GiftProject,
  Id,
  MilestoneSuggestion,
  NewEntity,
  ReceivedGift,
  SelfConnection,
  UserProfile,
  Occasion,
  Person,
  Thought,
} from '@/types'

export interface Crud<T extends { id: Id }, N> {
  list(): Promise<T[]>
  get(id: Id): Promise<T | null>
  create(input: N): Promise<T>
  update(id: Id, patch: Partial<N>): Promise<T>
  remove(id: Id): Promise<void>
}

export type PeopleRepository = Crud<Person, NewEntity<Person>>

export interface ThoughtsRepository extends Crud<Thought, NewEntity<Thought>> {
  /** Newest observation first. */
  listByPerson(personId: Id): Promise<Thought[]>
  listRecent(limit: number): Promise<Thought[]>
}

export interface OccasionsRepository extends Crud<Occasion, NewEntity<Occasion>> {
  listByPerson(personId: Id): Promise<Occasion[]>
}

export interface GiftIdeasRepository extends Crud<GiftIdea, NewEntity<GiftIdea>> {
  listByPerson(personId: Id): Promise<GiftIdea[]>
}

export interface GiftProjectsRepository extends Crud<GiftProject, NewEntity<GiftProject>> {
  listByPerson(personId: Id): Promise<GiftProject[]>
}

export interface ChecklistRepository extends Crud<ChecklistItem, NewEntity<ChecklistItem>> {
  listByProject(projectId: Id): Promise<ChecklistItem[]>
}

export interface MilestonesRepository extends Crud<
  MilestoneSuggestion,
  NewEntity<MilestoneSuggestion>
> {
  listPending(): Promise<MilestoneSuggestion[]>
}

export interface ConnectionsRepository extends Crud<Connection, NewEntity<Connection>> {
  /** Connections where this person is either side. */
  listByPerson(personId: Id): Promise<Connection[]>
}

export interface BrainstormRepository extends Crud<
  BrainstormMessage,
  NewEntity<BrainstormMessage>
> {
  /** Oldest first. */
  listByProject(projectId: Id): Promise<BrainstormMessage[]>
}

export interface ProfileRepository {
  get(): Promise<UserProfile>
  save(patch: Partial<UserProfile>): Promise<UserProfile>
}

export type SelfConnectionsRepository = Crud<SelfConnection, NewEntity<SelfConnection>>
export type ReceivedGiftsRepository = Crud<ReceivedGift, NewEntity<ReceivedGift>>

export interface SettingsRepository {
  getOnboarded(): Promise<boolean>
  setOnboarded(value: boolean): Promise<void>
}

export interface Repositories {
  people: PeopleRepository
  thoughts: ThoughtsRepository
  occasions: OccasionsRepository
  giftIdeas: GiftIdeasRepository
  giftProjects: GiftProjectsRepository
  checklist: ChecklistRepository
  milestones: MilestonesRepository
  connections: ConnectionsRepository
  brainstorm: BrainstormRepository
  profile: ProfileRepository
  selfConnections: SelfConnectionsRepository
  receivedGifts: ReceivedGiftsRepository
  settings: SettingsRepository
}

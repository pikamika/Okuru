import type {
  ChecklistItem,
  GiftIdea,
  GiftProject,
  Id,
  MilestoneSuggestion,
  NewEntity,
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

export interface PeopleRepository extends Crud<Person, NewEntity<Person>> {}

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

export interface MilestonesRepository
  extends Crud<MilestoneSuggestion, NewEntity<MilestoneSuggestion>> {
  listPending(): Promise<MilestoneSuggestion[]>
}

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
  settings: SettingsRepository
}

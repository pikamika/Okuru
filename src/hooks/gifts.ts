import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { repositories as r } from '@/data'
import type { ChecklistItem, GiftIdea, GiftProject, NewEntity } from '@/types'
import { keys } from './keys'

export const useGiftIdeas = () =>
  useQuery({ queryKey: keys.giftIdeas, queryFn: () => r.giftIdeas.list() })

export const useGiftIdeasByPerson = (personId: string | undefined) =>
  useQuery({
    queryKey: keys.giftIdeasByPerson(personId ?? ''),
    queryFn: () => r.giftIdeas.listByPerson(personId!),
    enabled: !!personId,
  })

export function useCreateGiftIdea() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: NewEntity<GiftIdea>) => r.giftIdeas.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.giftIdeas }),
  })
}

export function useDeleteGiftIdea() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => r.giftIdeas.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.giftIdeas }),
  })
}

export const useGiftProjectsByPerson = (personId: string | undefined) =>
  useQuery({
    queryKey: keys.giftProjectsByPerson(personId ?? ''),
    queryFn: () => r.giftProjects.listByPerson(personId!),
    enabled: !!personId,
  })

export const useGiftProject = (id: string | undefined) =>
  useQuery({
    queryKey: keys.giftProject(id ?? ''),
    queryFn: () => r.giftProjects.get(id!),
    enabled: !!id,
  })

export function useCreateGiftProject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: NewEntity<GiftProject>) => r.giftProjects.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.giftProjects }),
  })
}

export function useUpdateGiftProject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<NewEntity<GiftProject>> }) =>
      r.giftProjects.update(id, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.giftProjects }),
  })
}

export const useChecklist = (projectId: string | undefined) =>
  useQuery({
    queryKey: keys.checklist(projectId ?? ''),
    queryFn: () => r.checklist.listByProject(projectId!),
    enabled: !!projectId,
  })

export function useCreateChecklistItem(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: NewEntity<ChecklistItem>) => r.checklist.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.checklist(projectId) }),
  })
}

export function useUpdateChecklistItem(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<NewEntity<ChecklistItem>> }) =>
      r.checklist.update(id, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.checklist(projectId) }),
  })
}

const DEFAULT_STEPS: Array<{ kind: ChecklistItem['kind']; label: string }> = [
  { kind: 'buy', label: 'Buy or make it' },
  { kind: 'note', label: 'Write a note' },
  { kind: 'wrap', label: 'Wrap it' },
  { kind: 'ship', label: 'Ship or hand it over' },
]

/** Creates a project with the four gentle default steps. */
export function useStartGiftProject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (
      input: Pick<GiftProject, 'personId' | 'title'> & Partial<NewEntity<GiftProject>>,
    ) => {
      const project = await r.giftProjects.create({ notes: '', status: 'planning', ...input })
      for (const [i, step] of DEFAULT_STEPS.entries()) {
        await r.checklist.create({ projectId: project.id, ...step, done: false, sortOrder: i })
      }
      return project
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.giftProjects }),
  })
}

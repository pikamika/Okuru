import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { repositories as r } from '@/data'
import { nowIso } from '@/lib/dates'
import type { NewEntity, Thought } from '@/types'
import { keys } from './keys'

export const useThoughts = () =>
  useQuery({ queryKey: keys.thoughts, queryFn: () => r.thoughts.list() })

export const useThoughtsByPerson = (personId: string | undefined) =>
  useQuery({
    queryKey: keys.thoughtsByPerson(personId ?? ''),
    queryFn: () => r.thoughts.listByPerson(personId!),
    enabled: !!personId,
  })

export function useCreateThought() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: Pick<Thought, 'personId' | 'body'> & Partial<NewEntity<Thought>>) =>
      r.thoughts.create({ source: 'typed', observedAt: nowIso(), ...input }),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.thoughts }),
  })
}

export function useUpdateThought() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<NewEntity<Thought>> }) =>
      r.thoughts.update(id, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.thoughts }),
  })
}

export function useDeleteThought() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => r.thoughts.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.thoughts }),
  })
}

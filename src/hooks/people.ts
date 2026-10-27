import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { repositories as r } from '@/data'
import type { NewEntity, Person } from '@/types'
import { keys } from './keys'

export const usePeople = () =>
  useQuery({
    queryKey: keys.people,
    queryFn: async () => (await r.people.list()).sort((a, b) => a.name.localeCompare(b.name)),
  })

export const usePerson = (id: string | undefined) =>
  useQuery({
    queryKey: keys.person(id ?? ''),
    queryFn: () => r.people.get(id!),
    enabled: !!id,
  })

export function useCreatePerson() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: Pick<Person, 'name'> & Partial<NewEntity<Person>>) =>
      r.people.create({ tags: [], ...input }),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.people }),
  })
}

export function useUpdatePerson() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<NewEntity<Person>> }) =>
      r.people.update(id, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.people }),
  })
}

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { repositories as r } from '@/data'
import type { NewEntity, Occasion } from '@/types'
import { keys } from './keys'

export const useOccasions = () =>
  useQuery({ queryKey: keys.occasions, queryFn: () => r.occasions.list() })

export const useOccasionsByPerson = (personId: string | undefined) =>
  useQuery({
    queryKey: keys.occasionsByPerson(personId ?? ''),
    queryFn: () => r.occasions.listByPerson(personId!),
    enabled: !!personId,
  })

export function useCreateOccasion() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: NewEntity<Occasion>) => r.occasions.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.occasions }),
  })
}

export function useDeleteOccasion() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => r.occasions.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.occasions }),
  })
}

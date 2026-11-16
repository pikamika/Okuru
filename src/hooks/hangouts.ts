import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { repositories as r } from '@/data'
import type { Hangout, NewEntity } from '@/types'
import { keys } from './keys'

export const useHangoutsByPerson = (personId: string | undefined) =>
  useQuery({
    queryKey: keys.hangoutsByPerson(personId ?? ''),
    queryFn: () => r.hangouts.listByPerson(personId!),
    enabled: !!personId,
  })

/**
 * Logs a hangout. When it carries a takeaway, the takeaway is also kept as a thought on that
 * person, so it resurfaces like anything else you've noticed.
 */
export function useLogHangout() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: Omit<NewEntity<Hangout>, 'thoughtId'>) => {
      const takeaway = input.takeaway?.trim()
      const thought = takeaway
        ? await r.thoughts.create({
            personId: input.personId,
            body: takeaway,
            source: 'typed',
            // Date-only hangouts are anchored at midday so time zones can't push them a day over.
            observedAt: new Date(`${input.happenedAt}T12:00:00`).toISOString(),
          })
        : undefined
      return r.hangouts.create({ ...input, thoughtId: thought?.id })
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: keys.hangouts })
      void qc.invalidateQueries({ queryKey: keys.thoughts })
    },
  })
}

export function useDeleteHangout() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => r.hangouts.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.hangouts }),
  })
}

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { repositories as r } from '@/data'
import type { MilestoneSuggestion, NewEntity } from '@/types'
import { keys } from './keys'

export const usePendingMilestones = () =>
  useQuery({ queryKey: keys.milestones, queryFn: () => r.milestones.listPending() })

export function useAnswerMilestone() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      suggestion,
      answer,
    }: {
      suggestion: MilestoneSuggestion
      answer: { status: 'not_sure' | 'not_relevant' } | { status: 'confirmed'; date: string }
    }) => {
      if (answer.status !== 'confirmed') {
        return r.milestones.update(suggestion.id, { status: answer.status })
      }
      const occasion = await r.occasions.create({
        personId: suggestion.personId,
        kind: suggestion.proposedKind,
        title: suggestion.proposedTitle,
        date: answer.date,
        yearKnown: true,
        recurs: 'none',
      })
      const patch: Partial<NewEntity<MilestoneSuggestion>> = {
        status: 'confirmed',
        answeredDate: answer.date,
        occasionId: occasion.id,
      }
      return r.milestones.update(suggestion.id, patch)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.milestones })
      qc.invalidateQueries({ queryKey: keys.occasions })
    },
  })
}

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { agent, repositories as r } from '@/data'
import type { BrainstormContext } from '@/data/agent'
import { keys } from './keys'

export const useBrainstormMessages = (projectId: string | undefined) =>
  useQuery({
    queryKey: keys.brainstorm(projectId ?? ''),
    queryFn: () => r.brainstorm.listByProject(projectId!),
    enabled: !!projectId,
  })

/** Saves what the user said, asks the agent, saves its reply. */
export function useSendBrainstormMessage(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ text, context }: { text: string; context: BrainstormContext }) => {
      await r.brainstorm.create({ projectId, role: 'user', text })
      await qc.invalidateQueries({ queryKey: keys.brainstorm(projectId) })
      const history = await r.brainstorm.listByProject(projectId)
      const reply = await agent.brainstorm(context, history, text)
      await r.brainstorm.create({ projectId, role: 'assistant', ...reply })
    },
    onSettled: () => qc.invalidateQueries({ queryKey: keys.brainstorm(projectId) }),
  })
}

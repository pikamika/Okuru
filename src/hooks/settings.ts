import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { repositories as r } from '@/data'
import { keys } from './keys'

export const useOnboarded = () =>
  useQuery({ queryKey: keys.onboarded, queryFn: () => r.settings.getOnboarded() })

export function useSetOnboarded() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (value: boolean) => r.settings.setOnboarded(value),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.onboarded }),
  })
}

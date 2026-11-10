import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { repositories as r } from '@/data'
import type { NewEntity, ReceivedGift, SelfConnection, UserProfile } from '@/types'
import { keys } from './keys'

export const useProfile = () => useQuery({ queryKey: keys.profile, queryFn: () => r.profile.get() })

export function useUpdateProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (patch: Partial<UserProfile>) => r.profile.save(patch),
    onSuccess: (profile) => qc.setQueryData(keys.profile, profile),
  })
}

export const useSelfConnections = () =>
  useQuery({ queryKey: keys.selfConnections, queryFn: () => r.selfConnections.list() })

export function useCreateSelfConnection() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: NewEntity<SelfConnection>) => r.selfConnections.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.selfConnections }),
  })
}

export function useUpdateSelfConnection() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<NewEntity<SelfConnection>> }) =>
      r.selfConnections.update(id, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.selfConnections }),
  })
}

export function useDeleteSelfConnection() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => r.selfConnections.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.selfConnections }),
  })
}

export const useReceivedGifts = () =>
  useQuery({ queryKey: keys.receivedGifts, queryFn: () => r.receivedGifts.list() })

export function useCreateReceivedGift() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: NewEntity<ReceivedGift>) => r.receivedGifts.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.receivedGifts }),
  })
}

export function useDeleteReceivedGift() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => r.receivedGifts.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.receivedGifts }),
  })
}

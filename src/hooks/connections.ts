import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { repositories as r } from '@/data'
import type { Connection, NewEntity } from '@/types'
import { keys } from './keys'

export const useConnectionsByPerson = (personId: string | undefined) =>
  useQuery({
    queryKey: keys.connectionsByPerson(personId ?? ''),
    queryFn: () => r.connections.listByPerson(personId!),
    enabled: !!personId,
  })

export function useCreateConnection() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: NewEntity<Connection>) => r.connections.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.connections }),
  })
}

export function useUpdateConnection() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<NewEntity<Connection>> }) =>
      r.connections.update(id, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.connections }),
  })
}

export function useDeleteConnection() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => r.connections.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.connections }),
  })
}

/** Turns a name-only connection into a real person in your notebook, keeping the link. */
export function usePromoteConnection() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (connection: Connection) => {
      if (!connection.otherName) return null
      const person = await r.people.create({
        name: connection.otherName,
        relationships: [],
        tags: [],
      })
      await r.connections.update(connection.id, {
        otherPersonId: person.id,
        otherName: undefined,
      })
      return person
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.connections })
      qc.invalidateQueries({ queryKey: keys.people })
    },
  })
}

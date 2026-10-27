import { useMemo } from 'react'
import { resurfaceMoments } from '@/lib/moments'
import { useGiftIdeas } from './gifts'
import { useOccasions } from './occasions'
import { usePeople } from './people'
import { useThoughts } from './thoughts'

export function useMoments() {
  const people = usePeople()
  const occasions = useOccasions()
  const thoughts = useThoughts()
  const ideas = useGiftIdeas()
  const isLoading = people.isLoading || occasions.isLoading || thoughts.isLoading || ideas.isLoading
  const moments = useMemo(
    () =>
      resurfaceMoments(
        people.data ?? [],
        occasions.data ?? [],
        thoughts.data ?? [],
        ideas.data ?? [],
      ),
    [people.data, occasions.data, thoughts.data, ideas.data],
  )
  return { moments, isLoading }
}

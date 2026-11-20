import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it } from 'vitest'
import { repositories as r } from '@/data'
import { resetMockData } from '@/data/mock/store'
import { useLogHangout } from './hangouts'

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
    {children}
  </QueryClientProvider>
)

describe('useLogHangout', () => {
  beforeEach(() => resetMockData())

  it('keeps a takeaway as a thought and links it to the hangout', async () => {
    const person = await r.people.create({ name: 'Such', relationships: [], tags: [] })
    const { result } = renderHook(() => useLogHangout(), { wrapper })
    await act(() =>
      result.current.mutateAsync({
        personId: person.id,
        title: 'Brunch',
        happenedAt: '2026-05-10',
        reflection: 'learned',
        takeaway: '  Only drinks black coffee  ',
      }),
    )
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const [hangout] = await r.hangouts.listByPerson(person.id)
    const [thought] = await r.thoughts.listByPerson(person.id)
    expect(thought?.body).toBe('Only drinks black coffee')
    expect(hangout?.thoughtId).toBe(thought?.id)
    expect(new Date(thought!.observedAt).getDate()).toBe(10)
  })

  it('does not invent a thought when there is no takeaway', async () => {
    const person = await r.people.create({ name: 'Such', relationships: [], tags: [] })
    const { result } = renderHook(() => useLogHangout(), { wrapper })
    await act(() =>
      result.current.mutateAsync({ personId: person.id, title: 'Walk', happenedAt: '2026-05-10' }),
    )
    expect(await r.thoughts.listByPerson(person.id)).toEqual([])
    expect((await r.hangouts.listByPerson(person.id))[0]?.thoughtId).toBeUndefined()
  })
})

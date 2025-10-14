import React from 'react'
import { renderHook, act, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useResource } from '@/lib/hooks/useResource'

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

type TestItem = { id: string; value: string }
type Input = { value: string }

const createWrapper = (client: QueryClient) => {
  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  )
  return Wrapper
}

describe('useResource', () => {
  let queryClient: QueryClient
  let resources: TestItem[]

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    resources = [
      { id: '1', value: 'a' },
      { id: '2', value: 'b' },
    ]

    // jsdom does not define confirm by default
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(global as unknown as { confirm: (msg: string) => boolean }).confirm = jest.fn(() => true)
  })

  const setup = () =>
    renderHook(() =>
      useResource<TestItem, Input>({
        resourceName: 'item',
        queryKey: ['items'],
        getResources: async () => resources,
        createResource: async (data: Input) => {
          const created: TestItem = { id: 'new-id', value: data.value }
          resources = [created, ...resources]
          return created
        },
        updateResource: async (id: string, data: Input) => {
          const updated: TestItem = { id, value: data.value }
          resources = resources.map(r => (r.id === id ? updated : r))
          return updated
        },
        deleteResource: async (id: string) => {
          resources = resources.filter(r => r.id !== id)
        },
      })
    , { wrapper: createWrapper(queryClient) })

  it('fetches initial resources', async () => {
    const { result } = setup()
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.resources.map(r => r.id)).toEqual(['1', '2'])
  })

  it('creates a resource and updates cache', async () => {
    const { result } = setup()

    await act(async () => {
      const ok = await result.current.handleCreate({ value: 'c' })
      expect(ok).toBe(true)
    })

    const cached = queryClient.getQueryData<TestItem[]>(['items'])
    expect(cached && cached.length).toBe(3)
    expect(cached && cached[0].value).toBe('c')
  })

  it('updates a resource and clears selection', async () => {
    const { result } = setup()

    act(() => {
      result.current.setSelectedResource({ id: '2', value: 'b' })
    })

    await act(async () => {
      const ok = await result.current.handleUpdate({ value: 'bb' })
      expect(ok).toBe(true)
    })

    const cached = queryClient.getQueryData<TestItem[]>(['items'])
    expect(cached && cached.find(r => r.id === '2')?.value).toBe('bb')
    expect(result.current.selectedResource).toBeUndefined()
  })

  it('deletes a resource and updates cache', async () => {
    const { result } = setup()

    await act(async () => {
      await result.current.handleDelete('1')
    })

    const cached = queryClient.getQueryData<TestItem[]>(['items'])
    expect(cached && cached.find(r => r.id === '1')).toBeUndefined()
  })

  it('manipulates cache directly (add/update/remove)', () => {
    const { result } = setup()

    act(() => {
      result.current.addResourceToCache({ id: '3', value: 'c' })
    })
    let cached = queryClient.getQueryData<TestItem[]>(['items'])
    expect(cached && cached.find(r => r.id === '3')?.value).toBe('c')

    act(() => {
      result.current.updateResourceInCache({ id: '3', value: 'cc' })
    })
    cached = queryClient.getQueryData<TestItem[]>(['items'])
    expect(cached && cached.find(r => r.id === '3')?.value).toBe('cc')

    act(() => {
      result.current.removeResourceFromCache('3')
    })
    cached = queryClient.getQueryData<TestItem[]>(['items'])
    expect(cached && cached.find(r => r.id === '3')).toBeUndefined()
  })
})



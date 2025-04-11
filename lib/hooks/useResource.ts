import { useState } from 'react'
import { toast } from 'sonner'
import { 
  useQuery, 
  useMutation, 
  useQueryClient,
  QueryKey 
} from '@tanstack/react-query'

interface Resource {
  id: string
}

interface UseResourceOptions<T extends Resource, N> {
  resourceName: string
  queryKey: QueryKey
  getResources: () => Promise<T[]>
  createResource: (data: N) => Promise<T>
  updateResource: (id: string, data: N) => Promise<T>
  deleteResource: (id: string) => Promise<void>
}

export function useResource<T extends Resource, N>({
  resourceName,
  queryKey,
  getResources,
  createResource,
  updateResource,
  deleteResource,
}: UseResourceOptions<T, N>) {
  const [selectedResource, setSelectedResource] = useState<T | undefined>()
  const queryClient = useQueryClient()

  // Query for fetching resources
  const { data: resources = [], isLoading } = useQuery({
    queryKey,
    queryFn: getResources,
  })

  // Mutation for creating resource
  const createMutation = useMutation({
    mutationFn: createResource,
    onSuccess: (newResource) => {
      queryClient.setQueryData(queryKey, (old: T[] = []) => [newResource, ...old])
      toast.success(`${resourceName} created successfully`)
    },
    onError: (error) => {
      toast.error(`Failed to create ${resourceName}`)
      console.error(error)
    }
  })

  // Mutation for updating resource
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: N }) => 
      updateResource(id, data),
    onSuccess: (updatedResource) => {
      queryClient.setQueryData(queryKey, (old: T[] = []) => 
        old.map(r => r.id === updatedResource.id ? updatedResource : r)
      )
      setSelectedResource(undefined)
      toast.success(`${resourceName} updated successfully`)
    },
    onError: (error) => {
      toast.error(`Failed to update ${resourceName}`)
      console.error(error)
    }
  })

  // Mutation for deleting resource
  const deleteMutation = useMutation({
    mutationFn: deleteResource,
    onSuccess: (_, deletedId) => {
      queryClient.setQueryData(queryKey, (old: T[] = []) => 
        old.filter(r => r.id !== deletedId)
      )
      toast.success(`${resourceName} deleted successfully`)
    },
    onError: (error) => {
      toast.error(`Failed to delete ${resourceName}`)
      console.error(error)
    }
  })

  async function handleCreate(data: N) {
    try {
      await createMutation.mutateAsync(data)
      return true
    } catch {
      return false
    }
  }

  async function handleUpdate(data: N) {
    if (!selectedResource) return false
    try {
      await updateMutation.mutateAsync({ id: selectedResource.id, data })
      return true
    } catch {
      return false
    }
  }

  async function handleDelete(id: string) {
    if (!confirm(`Are you sure you want to delete this ${resourceName}?`)) return
    await deleteMutation.mutateAsync(id)
  }

  return {
    resources,
    isLoading,
    selectedResource,
    setSelectedResource,
    handleCreate,
    handleUpdate,
    handleDelete,
  }
}
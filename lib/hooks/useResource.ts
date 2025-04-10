import { useState } from 'react'
import { toast } from 'sonner'

interface Resource {
  id: string
}

interface UseResourceOptions<T extends Resource, N> {
  resourceName: string
  getResources: () => Promise<T[]>
  createResource: (data: N) => Promise<T>
  updateResource: (id: string, data: N) => Promise<T>
  deleteResource: (id: string) => Promise<void>
}

export function useResource<T extends Resource, N>({
  resourceName,
  getResources,
  createResource,
  updateResource,
  deleteResource,
}: UseResourceOptions<T, N>) {
  const [resources, setResources] = useState<T[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedResource, setSelectedResource] = useState<T | undefined>()

  async function loadResources() {
    setIsLoading(true)
    try {
      const data = await getResources()
      setResources(data)
    } catch (error) {
      toast.error(`Failed to load ${resourceName}`)
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleCreate(data: N) {
    try {
      const newResource = await createResource(data)
      setResources(prev => [newResource, ...prev])
      toast.success(`${resourceName} created successfully`)
      return true
    } catch (error) {
      toast.error(`Failed to create ${resourceName}`)
      console.error(error)
      return false
    }
  }

  async function handleUpdate(data: N) {
    if (!selectedResource) return false

    try {
      const updatedResource = await updateResource(selectedResource.id, data)
      setResources(prev => prev.map(r => r.id === updatedResource.id ? updatedResource : r))
      setSelectedResource(undefined)
      toast.success(`${resourceName} updated successfully`)
      return true
    } catch (error) {
      toast.error(`Failed to update ${resourceName}`)
      console.error(error)
      return false
    }
  }

  async function handleDelete(id: string): Promise<void> {
    if (!confirm(`Are you sure you want to delete this ${resourceName}?`)) return

    try {
      await deleteResource(id)
      setResources(prev => prev.filter(r => r.id !== id))
      toast.success(`${resourceName} deleted successfully`)
    } catch (error) {
      toast.error(`Failed to delete ${resourceName}`)
      console.error(error)
    }
  }

  return {
    resources,
    isLoading,
    selectedResource,
    setSelectedResource,
    loadResources,
    handleCreate,
    handleUpdate,
    handleDelete,
  }
} 
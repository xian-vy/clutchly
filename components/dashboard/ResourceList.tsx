import { ReactNode } from 'react'

interface ResourceListProps<T> {
  resources: T[]
  isLoading: boolean
  renderItem: (item: T) => ReactNode
  emptyMessage?: string
}

export function ResourceList<T>({
  resources,
  isLoading,
  renderItem,
  emptyMessage = 'No items found'
}: ResourceListProps<T>) {
  if (isLoading) {
    return <div>Loading...</div>
  }

  if (resources.length === 0) {
    return <div>{emptyMessage}</div>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {resources.map((resource, index) => (
        <div key={index}>
          {renderItem(resource)}
        </div>
      ))}
    </div>
  )
} 
'use client'

import { useGroupedReptileSelect } from '@/lib/hooks/useGroupedReptileSelect'
import { Reptile } from '@/lib/types/reptile'

interface SheddingFiltersProps {
  reptiles: Reptile[]
  selectedReptileId: string
  timeRange: '3m' | '6m' | '1y' | 'all'
  onReptileChange: (reptileId: string) => void
  onTimeRangeChange: (range: '3m' | '6m' | '1y' | 'all') => void
}

export function SheddingFilters({
  reptiles,
  selectedReptileId,
  timeRange,
  onReptileChange,
  onTimeRangeChange,
}: SheddingFiltersProps) {
  const { ReptileSelect } = useGroupedReptileSelect({ filteredReptiles: reptiles })

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
      <div className="w-full sm:w-[270px]">
        <ReptileSelect
          value={selectedReptileId}
          onValueChange={onReptileChange}
          placeholder="Select a reptile"
        />
      </div>
      <select
        className="h-9 rounded-md border border-input bg-background px-3 text-sm"
        value={timeRange}
        onChange={(e) => onTimeRangeChange(e.target.value as '3m' | '6m' | '1y' | 'all')}
      >
        <option value="3m">Last 3 months</option>
        <option value="6m">Last 6 months</option>
        <option value="1y">Last year</option>
        <option value="all">All time</option>
      </select>
    </div>
  )
} 
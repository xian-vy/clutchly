'use client'

import { useGroupedReptileBySpeciesSelect } from '@/lib/hooks/useGroupedReptileBySpeciesSelect'
import { Reptile } from '@/lib/types/reptile'

interface SheddingFiltersProps {
  reptiles: Reptile[]
  selectedReptileId: string
  timeRange: '1m' | '3m' | '6m' | '1y'
  onReptileChange: (reptileId: string) => void
  onTimeRangeChange: (range: '1m' | '3m' | '6m' | '1y') => void
}

export function SheddingFilters({
  reptiles,
  selectedReptileId,
  timeRange,
  onReptileChange,
  onTimeRangeChange,
}: SheddingFiltersProps) {
  const { ReptileSelect } = useGroupedReptileBySpeciesSelect({ filteredReptiles: reptiles })

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
        onChange={(e) => onTimeRangeChange(e.target.value as '1m' | '3m' | '6m' | '1y')}
      >
        <option value="1m">Last month</option>
        <option value="3m">Last 3 months</option>
        <option value="6m">Last 6 months</option>
        <option value="1y">Last year</option>
      </select>
    </div>
  )
} 
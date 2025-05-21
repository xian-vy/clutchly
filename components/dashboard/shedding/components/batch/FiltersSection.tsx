import { Filter,  } from 'lucide-react'
import { Room } from '@/lib/types/location'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface FilterState {
  room: string
  rack: string
  ageGroup: string
}

interface Props {
  filters: FilterState
  setFilters: (filters: FilterState) => void
  rooms?: Room[]
  racks?: { id: string; name: string }[]
  ageGroups: { id: string; label: string }[]
}

export function FiltersSection({ filters, setFilters, rooms, racks, ageGroups }: Props) {
  return (
    <div className="space-y-2 3xl:space-y-3 border rounded-xl p-2 md:p-3 xl:p-4">
      <div className="flex items-center gap-1 text-sm 2xl:text-base font-medium">
        <Filter className="h-4 w-4" />
        <h3>Filters</h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-2 gap-6">
        {/* Location Filters */}
        <div className="space-y-3">

          <div className="grid grid-cols-2 gap-4 ">
            <Select
              value={filters.room}
              onValueChange={(value) => {
                setFilters({ ...filters, room: value, rack: 'all' })
              }}
            >
              <SelectTrigger className='w-full'>
                <SelectValue placeholder="Select room" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Rooms</SelectItem>
                {rooms?.map((room) => (
                  <SelectItem key={room.id} value={room.id}>
                    {room.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.rack}
              onValueChange={(value) => setFilters({ ...filters, rack: value })}
              disabled={filters.room === 'all'}
            >
              <SelectTrigger className='w-full'>
                <SelectValue placeholder="Select rack" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Racks</SelectItem>
                {racks?.map((rack) => (
                  <SelectItem key={rack.id} value={rack.id}>
                    {rack.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Age Group Filter */}
        <div className="space-y-3">

          <Select
            value={filters.ageGroup}
            onValueChange={(value) => setFilters({ ...filters, ageGroup: value })}
          >
            <SelectTrigger className='w-full'>
              <SelectValue placeholder="Select age group" />
            </SelectTrigger>
            <SelectContent>
              {ageGroups.map((group) => (
                <SelectItem key={group.id} value={group.id}>
                  {group.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
} 
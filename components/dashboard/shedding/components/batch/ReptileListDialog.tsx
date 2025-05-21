import { ListCheck, ListX, Search } from 'lucide-react'
import { UseFormReturn } from 'react-hook-form'
import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ReptileWithLocation, FormData } from './types'
import { useScreenSize } from '@/lib/hooks/useScreenSize'

interface Props {
  form: UseFormReturn<FormData>
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  filteredReptiles: ReptileWithLocation[]
  trigger: React.ReactNode
}

export function ReptileListDialog({
  form,
  isOpen,
  onOpenChange,
  filteredReptiles,
  trigger
}: Props) {
  const size = useScreenSize()
  const [searchQuery, setSearchQuery] = useState('')

  // Filter reptiles based on search query
  const searchFilteredReptiles = useMemo(() => {
    if (!searchQuery.trim()) return filteredReptiles

    const query = searchQuery.toLowerCase().trim()
    return filteredReptiles.filter(reptile => {
      const searchableText = [
        reptile.name,
        reptile.reptile_code,
        reptile.location?.rack.room.name,
        reptile.location?.rack.name
      ].filter(Boolean).join(' ').toLowerCase()

      return searchableText.includes(query)
    })
  }, [filteredReptiles, searchQuery])

  // Handle select all for search filtered reptiles
  const handleSelectAllFiltered = () => {
    const currentIds = form.watch('reptile_ids')
    const newIds = searchFilteredReptiles
      .map(r => r.id)
      .filter(id => !currentIds.includes(id))
    form.setValue('reptile_ids', [...currentIds, ...newIds])
  }

  // Handle deselect all for search filtered reptiles
  const handleDeselectAllFiltered = () => {
    const currentIds = form.watch('reptile_ids')
    const filteredIds = searchFilteredReptiles.map(r => r.id)
    form.setValue(
      'reptile_ids',
      currentIds.filter(id => !filteredIds.includes(id))
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl md:max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Select Reptiles</DialogTitle>
        </DialogHeader>
        <div className="space-y-2 sm:space-y-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, code, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>

          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              {searchFilteredReptiles.length} reptiles found
              {searchQuery && ` matching "${searchQuery}"`}
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSelectAllFiltered}
              >
                <ListCheck className="h-4 w-4" />
                {size !== "mobile" && <span>Select Filtered</span>}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDeselectAllFiltered}
              >
                <ListX className="h-4 w-4" />
                {size !== "mobile" && <span>Deselect Filtered</span>}
              </Button>
            </div>
          </div>

          <ScrollArea className="h-[50vh] rounded-md border p-4">
            <div className="space-y-2">
              {searchFilteredReptiles?.map((reptile) => (
                <div
                  key={reptile.id}
                  className="flex items-center space-x-2"
                >
                  <Checkbox
                    id={`dialog-${reptile.id}`}
                    checked={form.watch('reptile_ids').includes(reptile.id)}
                    onCheckedChange={(checked) => {
                      const currentIds = form.watch('reptile_ids')
                      if (checked) {
                        form.setValue('reptile_ids', [...currentIds, reptile.id])
                      } else {
                        form.setValue(
                          'reptile_ids',
                          currentIds.filter((id: string) => id !== reptile.id)
                        )
                      }
                    }}
                  />
                  <label
                    htmlFor={`dialog-${reptile.id}`}
                    className="text-xs sm:text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {reptile.name}
                    {reptile.reptile_code ? ` (${reptile.reptile_code})` : ''}
                    {reptile.location
                      ? ` - ${reptile.location.rack.room.name} > ${reptile.location.rack.name}`
                      : ''}
                  </label>
                </div>
              ))}
              {searchFilteredReptiles.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No reptiles found matching your search
                </p>
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
} 
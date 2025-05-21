import { Expand, ListCheck, ListX } from 'lucide-react'
import { UseFormReturn } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useScreenSize } from '@/lib/hooks/useScreenSize'
import { FormData, ReptileWithLocation } from './types'
import { ReptileListDialog } from './ReptileListDialog'

interface Props {
  form: UseFormReturn<FormData>
  filteredReptiles: ReptileWithLocation[]
  isDialogOpen: boolean
  onDialogOpenChange: (open: boolean) => void
  onSelectAll: () => void
  onDeselectAll: () => void
}

export function ReptileSelection({
  form,
  filteredReptiles,
  isDialogOpen,
  onDialogOpenChange,
  onSelectAll,
  onDeselectAll,
}: Props) {
  const size = useScreenSize()

  return (
    <div className="space-y-2 border rounded-xl p-2 md:p-3 xl:p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm 2xl:text-base font-medium">
          <p className="text-sm text-muted-foreground">
            {filteredReptiles.length} reptiles found
          </p>
        </div>
        <div className="flex gap-2">
          <ReptileListDialog
            form={form}
            isOpen={isDialogOpen}
            onOpenChange={onDialogOpenChange}
            filteredReptiles={filteredReptiles}
            trigger={
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex items-center gap-1.5"
              >
                <Expand className="h-4 w-4" />
                {size !== "mobile" && <span>View Full List</span>}
              </Button>
            }
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onSelectAll}
          >
            <ListCheck className="h-4 w-4" />
            {size !== "mobile" && <span>Select All</span>}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onDeselectAll}
          >
            <ListX className="h-4 w-4" />
            {size !== "mobile" && <span>Deselect All</span>}
          </Button>
        </div>
      </div>

      <FormField
        control={form.control}
        name="reptile_ids"
        render={() => (
          <FormItem>
            <FormControl>
              <ScrollArea className="h-[100px] rounded-md border p-4">
                <div className="space-y-2">
                  {filteredReptiles?.map((reptile) => (
                    <div
                      key={reptile.id}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={reptile.id}
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
                        htmlFor={reptile.id}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {reptile.name}
                        {reptile.reptile_code ? ` (${reptile.reptile_code})` : ''}
                        {reptile.location
                          ? ` - ${reptile.location.rack.room.name} > ${reptile.location.rack.name}`
                          : ''}
                      </label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
} 
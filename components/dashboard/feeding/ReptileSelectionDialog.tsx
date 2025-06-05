import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { useSpeciesStore } from "@/lib/stores/speciesStore"
import { Reptile } from "@/lib/types/reptile"
import { useMemo, useState } from "react"
import { differenceInMonths } from "date-fns"

interface ReptileSelectionDialogProps {
  reptiles: Reptile[]
  selectedReptiles: { target_type: string; target_id: string }[]
  onSelectionChange: (selection: { target_type: string; target_id: string }[]) => void
  trigger?: React.ReactNode
}

export function ReptileSelectionDialog({
  reptiles,
  selectedReptiles,
  onSelectionChange,
  trigger
}: ReptileSelectionDialogProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSpecies, setSelectedSpecies] = useState<string | null>(null)
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<string | null>(null)
  const { species } = useSpeciesStore()

  // Helper function to determine age group
  const getAgeGroup = (reptile: Reptile) => {
    if (!reptile.hatch_date) return "unknown"
    const months = differenceInMonths(new Date(), new Date(reptile.hatch_date))
    if (months < 3) return "hatchling"
    if (months < 6) return "juvenile"
    if (months < 12) return "subadult"
    return "adult"
  }

  // Filter reptiles based on search and filters
  const filteredReptiles = useMemo(() => {
    return reptiles.filter(reptile => {
      const matchesSearch = searchQuery === "" || 
        reptile.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reptile.reptile_code?.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesSpecies = !selectedSpecies || 
        reptile.species_id.toString() === selectedSpecies

      const matchesAgeGroup = !selectedAgeGroup || 
        getAgeGroup(reptile) === selectedAgeGroup

      return matchesSearch && matchesSpecies && matchesAgeGroup
    })
  }, [reptiles, searchQuery, selectedSpecies, selectedAgeGroup])

  // Group reptiles by species
  const groupedReptiles = useMemo(() => {
    return species.map(speciesItem => ({
      label: speciesItem.name,
      items: filteredReptiles
        .filter(reptile => reptile.species_id.toString() === speciesItem.id.toString())
        .map(reptile => ({
          value: reptile.id,
          label: reptile.name,
          ageGroup: getAgeGroup(reptile),
          reptile
        }))
    })).filter(group => group.items.length > 0)
  }, [species, filteredReptiles])

  // Helper function to check if a reptile is selected
  const isReptileSelected = (reptileId: string) => {
    return selectedReptiles.some(target => 
      target.target_type === 'reptile' && target.target_id === reptileId
    )
  }

  // Helper function to toggle reptile selection
  const toggleReptileSelection = (reptileId: string) => {
    const exists = isReptileSelected(reptileId)
    
    if (exists) {
      onSelectionChange(
        selectedReptiles.filter(target => 
          !(target.target_type === 'reptile' && target.target_id === reptileId)
        )
      )
    } else {
      onSelectionChange([
        ...selectedReptiles,
        { target_type: 'reptile', target_id: reptileId }
      ])
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="w-full justify-between">
            {selectedReptiles.length === 0 
              ? "Select reptiles..." 
              : `${selectedReptiles.length} reptile${selectedReptiles.length > 1 ? 's' : ''} selected`}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="lg:max-w-2xl xl:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Select Reptiles</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="space-y-2">
            <Label>Search</Label>
            <Input
              placeholder="Search by name or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Species</Label>
            <Select
              value={selectedSpecies || "all"}
              onValueChange={(value) => setSelectedSpecies(value === "all" ? null : value)}
            >
              <SelectTrigger className="w-[100px] sm:w-[150px] xl:w-[180px] truncate overflow-hidden">
                <SelectValue placeholder="All Species" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Species</SelectItem>
                {species.map((s) => (
                  <SelectItem key={s.id} value={s.id.toString()}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Age Group</Label>
            <Select
              value={selectedAgeGroup || "all"}
              onValueChange={(value) => setSelectedAgeGroup(value === "all" ? null : value)}
            >
              <SelectTrigger className="w-[100px] sm:w-[150px] xl:w-[180px]">
                <SelectValue placeholder="All Ages" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ages</SelectItem>
                <SelectItem value="hatchling">Hatchling (&lt;3 months)</SelectItem>
                <SelectItem value="juvenile">Juvenile (3-6 months)</SelectItem>
                <SelectItem value="subadult">Subadult (6-12 months)</SelectItem>
                <SelectItem value="adult">Adult (&gt;12 months)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <ScrollArea className="h-[400px] pr-4">
          {groupedReptiles.map((group) => (
            <div key={group.label} className="mb-4">
              <h3 className="font-medium mb-2">{group.label}</h3>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-0 sm:gap-2">
                {group.items.map((item) => (
                  <div
                    key={item.value}
                    className="flex group items-center space-x-2 p-2 rounded-md cursor-pointer"
                  >
                    <Checkbox
                      id={`reptile-${item.value}`}
                      checked={isReptileSelected(item.value)}
                      onCheckedChange={() => toggleReptileSelection(item.value)}
                    />
                    <label
                      htmlFor={`reptile-${item.value}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      <div className="flex flex-col">
                        <span>{item.label}</span>
                        <span className="text-xs text-muted-foreground">
                          {item.reptile.reptile_code && `Code: ${item.reptile.reptile_code}`}
                          {item.reptile.reptile_code && " • "}
                          {item.ageGroup.charAt(0).toUpperCase() + item.ageGroup.slice(1)}
                        </span>
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </ScrollArea>

        <div className="flex justify-end space-x-2 mt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={() => setOpen(false)}>
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 
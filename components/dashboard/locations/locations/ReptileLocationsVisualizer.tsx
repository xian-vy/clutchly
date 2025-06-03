'use client';

import { useState, useEffect } from 'react';
import { Room, Rack, Location } from '@/lib/types/location';
import { NewReptile, Reptile } from '@/lib/types/reptile';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, LayoutGrid } from 'lucide-react';
import { createReptile, deleteReptile, getReptiles, updateReptile } from '@/app/api/reptiles/reptiles';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useSpeciesStore } from '@/lib/stores/speciesStore';
import { useMorphsStore } from '@/lib/stores/morphsStore';
import { useGroupedReptileSelect } from '@/lib/hooks/useGroupedReptileSelect';
import { useResource } from '@/lib/hooks/useResource';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

interface ReptileLocationsVisualizerProps {
  selectedRoom?: Room | null;
  selectedRack?: Rack | null;
  startLevel: number;
  endLevel: number;
  positionsPerLevel: number;
  locations: Location[];
}

export function ReptileLocationsVisualizer({
  selectedRoom,
  selectedRack,
  startLevel,
  endLevel,
  positionsPerLevel,
  locations
}: ReptileLocationsVisualizerProps) {
  const [levels, setLevels] = useState<number[]>([]);
  const [positions, setPositions] = useState<number[]>([]);
  const {species} = useSpeciesStore()
  const {morphs} = useMorphsStore()
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEnclosure, setSelectedEnclosure] = useState<string|null>(null);
  const queryClient = useQueryClient();

  const {
    resources: reptiles,
    isLoading: reptilesLoading,
    selectedResource: selectedReptile,
    setSelectedResource: setSelectedReptile,
    handleUpdate,
  } = useResource<Reptile, NewReptile>({
    resourceName: 'Reptile',
    queryKey: ['reptiles'],
    getResources: getReptiles,
    createResource: createReptile,
    updateResource: updateReptile,
    deleteResource: deleteReptile,
  })

  const reptileWithNoEnclosure = reptiles.filter(reptile => !reptile.location_id);
  const { ReptileSelect } = useGroupedReptileSelect({filteredReptiles: reptileWithNoEnclosure});
  // Filter locations for current room and rack
  const filteredLocations = locations.filter(
    loc => loc.room_id === selectedRoom?.id && loc.rack_id === selectedRack?.id
  );


const updateReptileLocation = async () => {
  const reptile = reptiles.find(r => r.id === selectedReptile?.id);
  if (!reptile) {
    console.error(`Reptile with ID ${selectedReptile} not found.`);
    return;
  }
  if (!selectedEnclosure) {
    console.error('No enclosure selected.');
    return;
  }
  const updatedReptile: NewReptile = {
    ...reptile,
    location_id: selectedEnclosure
  };
  try {
    const toastId = toast.loading("Assigning reptile to enclosure...");
    const success = await handleUpdate(updatedReptile);
    if (success) {
      // Invalidate all reptile queries to ensure all components get updated data
      await queryClient.invalidateQueries({ queryKey: ['reptiles'] });
      toast.success("Reptile assigned to enclosure.", {
        id: toastId
      });
    } else {
      toast.error("Failed to assign reptile to enclosure.", {
        id: toastId
      });
    }
  } catch (error) {
    console.error('Error updating reptile location:', error);
    toast.error("Failed to assign reptile to enclosure.");
  }
}

const handleEnclosureClick = async (locationId: string | null) => {
    setSelectedEnclosure(locationId);
    setIsDialogOpen(true);
};
  useEffect(() => {
    if (startLevel > 0 && endLevel >= startLevel) {
      const levelArray = [];
      for (let i = startLevel; i <= endLevel; i++) {
        levelArray.push(i);
      }
      // Reverse the array to show bottom level first
      setLevels(levelArray.reverse());
    } else {
      setLevels([]);
    }
  }, [startLevel, endLevel]);
  useEffect(() => {
    if (positionsPerLevel > 0) {
      const posArray = [];
      for (let i = 1; i <= positionsPerLevel; i++) {
        posArray.push(i);
      }
      setPositions(posArray);
    } else {
      setPositions([]);
    }
  }, [positionsPerLevel]);

  const getReptileInLocation = (locationId: string): Reptile | undefined => {
    return reptiles.find(reptile => reptile.location_id === locationId);
  };

  const totalLocations = levels.length * positions.length;

  if (!selectedRoom || !selectedRack) {
    return (
      <Card className="border-dashed border-2">
        <CardContent className="flex items-center justify-center min-h-[200px] text-muted-foreground">
          Please select a room and rack to see visualization
        </CardContent>
      </Card>
    );
  }

  if (reptilesLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center min-h-[200px]">
          <div className="flex items-center gap-2">
            <LayoutGrid className="h-5 w-5 animate-spin" />
            <span>Loading reptiles...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm sm:text-base md:text-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LayoutGrid className="h-4 w-4" />
            <span>{selectedRack.name}</span>
          </div>
          <Badge variant="outline" className="ml-auto !text-xs">
            {totalLocations} {totalLocations === 1 ? 'enclosure' : 'enclosures'}
          </Badge>
        </CardTitle>
        <div className="text-sm text-muted-foregroundflex flex-col">
          <div className="flex items-center gap-1 mb-1">
            <Building2 className="h-3.5 w-3.5" /> 
            <span>{selectedRoom.name}</span>
            <span className="mx-1">›</span>
            <span>{selectedRack.name}</span>
          </div>
          <div className="text-xs">
            {selectedRack.type} • {selectedRack.rows} levels
            {selectedRack.columns ? ` × ${selectedRack.columns} columns` : ''}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className='pl-0'>
        <div className="overflow-x-auto">
          <div className="min-w-max">
            <div className="grid grid-flow-col gap-4 mb-2">
              <div className="w-18 text-center font-medium"></div>
              {positions.map(position => (
                <div key={`header-${position}`} className="text-center text-xs font-medium">
                  Position {position}
                </div>
              ))}
            </div>
            
            <div className="space-y-4 max-h-[450px] overflow-y-auto">
              {levels.map(level => (
                <div key={`level-${level}`} className="grid grid-flow-col gap-2 md:gap-3 xl:gap-4 items-center">
                  <div className="w-14 sm:w-16 lg:w-20 xl:w-24  text-right font-medium text-[0.7rem] sm:text-xs">
                    Level {level}
                  </div>
                  
                  {positions.map(position => {
                    const location = filteredLocations.find(
                      loc => Number(loc.shelf_level) === level && 
                            Number(loc.position) === position
                    );
                    const reptile = location ? getReptileInLocation(location.id) : null;
                    const isOccupied = !!reptile;
                    const speciesName = species.find(species => species.id.toString() === reptile?.species_id.toString())?.name || "Unknown Species";
                    const morphName = morphs.find(morph => morph.id.toString() === reptile?.morph_id.toString())?.name || "Unknown Morph";
                    return (
                      <TooltipProvider key={`cell-${level}-${position}`}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div 
                              className={`
                                h-14 rounded-md border-1 flex items-center justify-center 
                                ${isOccupied ? 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-950' : 'bg-green-50 dark:bg-primary/5 border-green-200 dark:border-green-950 '}
                                ${isOccupied ? 'text-red-800' : 'text-green-800'} 
                                transition-colors hover:bg-opacity-80
                              `}
                            >
                              <div onClick={() => handleEnclosureClick(location ? location.id : null)} className="cursor-pointer flex flex-col items-center ">
                                <span className="text-[0.7rem] sm:text-xs font-medium text-black dark:text-white text-center  w-18 truncate">
                                  {reptile ? reptile.name : `L${level}-P${position}`}
                                </span>
                                <Badge 
                                  variant="outline"
                                  className={`${!isOccupied ? " text-green-800 dark:text-white" : ""}`}
                                >
                                  {isOccupied ? "Occupied" : "Available"}
                                </Badge>
                              </div>
                            </div>
                          </TooltipTrigger>
                          {reptile && (
                            <TooltipContent>
                              <div className="text-sm">
                                <p className="font-medium">{reptile.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  { `L${level}-P${position}`}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {speciesName} • {morphName}
                                </p>
                              </div>
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TooltipProvider>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className='sm:max-w-[300px]'>
      <DialogTitle>Assign Reptile to Location</DialogTitle>

        <ReptileSelect 
          onValueChange={(value)=>{
            setSelectedReptile(reptiles.find(reptile => reptile.id === value))
          }}
        />
        <Button
          variant="outline"
          onClick={() => {
            updateReptileLocation();
            setIsDialogOpen(false);
          }}>Assign</Button>
      </DialogContent>
    </Dialog>

    </>
  );
}
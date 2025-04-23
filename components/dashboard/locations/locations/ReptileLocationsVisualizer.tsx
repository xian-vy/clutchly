'use client';

import { useState, useEffect } from 'react';
import { Room, Rack, Location } from '@/lib/types/location';
import { Reptile } from '@/lib/types/reptile';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, LayoutGrid } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getReptiles } from '@/app/api/reptiles/reptiles';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useSpeciesStore } from '@/lib/stores/speciesStore';
import { useMorphsStore } from '@/lib/stores/morphsStore';

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
  const { data: reptiles = [], isLoading: isLoadingReptiles } = useQuery<Reptile[]>({
    queryKey: ['reptiles'],
    queryFn: getReptiles,
  });





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

  if (isLoadingReptiles) {
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
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LayoutGrid className="h-5 w-5" />
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
            
            <div className="space-y-4 max-h-[350px] overflow-y-auto">
              {levels.map(level => (
                <div key={`level-${level}`} className="grid grid-flow-col gap-2 md:gap-3 xl:gap-4 items-center">
                  <div className="w-24  text-right font-medium text-xs">
                    Level {level}
                  </div>
                  
                  {positions.map(position => {
                    const location = locations.find(
                      loc => loc.shelf_level.toString() === level.toString() && 
                            loc.position.toString() === position.toString()
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
                              <div className="flex flex-col items-center ">
                                <span className="text-xs font-medium text-black dark:text-white text-center  w-18 truncate">
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
  );
} 
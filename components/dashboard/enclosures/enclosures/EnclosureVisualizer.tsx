'use client';

import { useState, useEffect } from 'react';
import { Room, Rack } from '@/lib/types/location';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {  Building2, LayoutGrid } from 'lucide-react';

interface LocationsVisualizerProps {
  selectedRoom?: Room | null;
  selectedRack?: Rack | null;
  startLevel: number;
  endLevel: number;
  positionsPerLevel: number;
  isShowingOccupied?: boolean;
}

export function EnclosureVisualizer({
  selectedRoom,
  selectedRack,
  startLevel,
  endLevel,
  positionsPerLevel,
  isShowingOccupied = false
}: LocationsVisualizerProps) {
  const [levels, setLevels] = useState<number[]>([]);
  const [positions, setPositions] = useState<number[]>([]);

  useEffect(() => {
    if (startLevel > 0 && endLevel >= startLevel) {
      const levelArray = [];
      for (let i = startLevel; i <= endLevel; i++) {
        levelArray.push(i);
      }
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

  return (
    <Card className='!pb-0'>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LayoutGrid className="h-5 w-5 text-primary" />
            <span>Rack Visualization</span>
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
      
      <CardContent className='pl-0  max-w-[325px] sm:max-w-[700px]'>
        <div className="overflow-x-auto">
          <div className="min-w-max">
            <div className="grid grid-flow-col gap-4 mb-2">
              <div className="w-18 text-center font-medium"></div>
              {positions.map(position => (
                <div key={`header-${position}`} className="text-center text-xs  w-[100px] font-medium text-muted-foreground">
                  Position {position}
                </div>
              ))}
            </div>
            
            <div className="space-y-4 max-h-[200px] 2xl:max-h-[270px]  3xl:!max-h-[420px] overflow-y-auto">
              {levels
              .map(level => (
                <div key={`level-${level}`} className="grid grid-flow-col gap-2 md:gap-3 xl:gap-4 items-center text-muted-foreground">
                  <div className="w-18 text-right font-medium text-xs">
                    Level {level}
                  </div>
                  
                  {positions.map(position => (
                    <div 
                      key={`cell-${level}-${position}`}
                      className={`
                        h-16 w-[120px] 3xl:!w-[150px] rounded-md border-1 flex items-center justify-center  border-input bg-background hover:border-primary `}
                    >
                      <div className="flex flex-col items-center">
                        <span className="text-xs font-medium text-black dark:text-white">
                          L{level}-P{position}
                        </span>
                        <Badge variant={isShowingOccupied ? "destructive" : "outline"} className={` ${!isShowingOccupied ? "text-muted-foreground" : ""} `}>
                          {isShowingOccupied ? "Occupied" : "Available"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
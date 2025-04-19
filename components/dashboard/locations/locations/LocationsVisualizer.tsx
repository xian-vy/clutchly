'use client';

import { useState, useEffect } from 'react';
import { Room, Rack } from '@/lib/types/location';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Building2 } from 'lucide-react';

interface LocationsVisualizerProps {
  selectedRoom?: Room | null;
  selectedRack?: Rack | null;
  startLevel: number;
  endLevel: number;
  positionsPerLevel: number;
  isShowingOccupied?: boolean;
}

export function LocationsVisualizer({
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
      setLevels(levelArray);
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
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            <span>Location Visualization</span>
          </div>
          <Badge variant="outline" className="ml-auto">
            {totalLocations} {totalLocations === 1 ? 'location' : 'locations'}
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
      
      <CardContent>
        <div className="mt-4 overflow-x-auto">
          <div className="min-w-max">
            <div className="grid grid-flow-col gap-4 mb-2">
              <div className="w-20 text-center font-medium"></div>
              {positions.map(position => (
                <div key={`header-${position}`} className="text-center text-sm font-medium">
                  Position {position}
                </div>
              ))}
            </div>
            
            <div className="space-y-4">
              {levels.map(level => (
                <div key={`level-${level}`} className="grid grid-flow-col gap-4 items-center">
                  <div className="w-20 text-right font-medium text-sm">
                    Level {level}
                  </div>
                  
                  {positions.map(position => (
                    <div 
                      key={`cell-${level}-${position}`}
                      className={`
                        h-16 rounded-md border-2 flex items-center justify-center 
                        ${isShowingOccupied ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'} 
                        transition-colors hover:bg-opacity-80
                      `}
                    >
                      <div className="flex flex-col items-center">
                        <span className="text-xs font-medium text-black">
                          L{level}-P{position}
                        </span>
                        <Badge variant={isShowingOccupied ? "destructive" : "outline"} className={`mt-1 ${!isShowingOccupied ? "bg-green-100 text-green-800 hover:bg-green-100" : ""} `}>
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
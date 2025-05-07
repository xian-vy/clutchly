'use client';

import { useState, useEffect } from 'react';
import { Reptile } from '@/lib/types/reptile';
import { generateMockReptiles, mockMorphs } from './mockLineageData';
import FlowChart from '../dashboard/breeding/lineage/components/FlowChart';
import { Card, CardContent } from '@/components/ui/card';

const PedigreeFeatureCard = () => {
  const [mockReptiles, setMockReptiles] = useState<Reptile[]>([]);
  
  useEffect(() => {
    // Generate mock data when component mounts
    setMockReptiles(generateMockReptiles());
  }, []);

  return (
    <Card className="overflow-hidden border-0  bg-background/10">
      <CardContent className="p-0">
        <div className="w-full h-[600px] lg:h-[1000px] overflow-hidden">
          {mockReptiles.length > 0 && (
            <FlowChart 
              reptileId="BP000009"
              reptiles={mockReptiles} 
              isFeature={true}
              morphs={mockMorphs}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PedigreeFeatureCard;
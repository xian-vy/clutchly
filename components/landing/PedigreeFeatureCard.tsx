'use client';

import { useState, useEffect } from 'react';
import { Reptile } from '@/lib/types/reptile';
import { generateMockReptiles } from './mockLineageData';
import FlowChart from '../dashboard/breeding/lineage/components/FlowChart';
import { Card, CardContent } from '@/components/ui/card';

const PedigreeFeatureCard = () => {
  const [mockReptiles, setMockReptiles] = useState<Reptile[]>([]);
  
  useEffect(() => {
    // Generate mock data when component mounts
    setMockReptiles(generateMockReptiles());
  }, []);

  return (
    <Card className="overflow-hidden  border-0 bg-background/10">
      <CardContent className="p-0">
        <div className="w-full h-[500px] overflow-hidden">
          {mockReptiles.length > 0 && (
            <FlowChart 
              reptileId="root-reptile" 
              reptiles={mockReptiles} 
              isFeature={true}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PedigreeFeatureCard;
'use client';

import { useState, useEffect } from 'react';
import { Reptile } from '@/lib/types/reptile';
import { generateMockReptiles } from './mockLineageData';
import FlowChart from '../dashboard/breeding/lineage/components/FlowChart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dna } from 'lucide-react';

const PedigreeFeatureCard = () => {
  const [mockReptiles, setMockReptiles] = useState<Reptile[]>([]);
  
  useEffect(() => {
    // Generate mock data when component mounts
    setMockReptiles(generateMockReptiles());
  }, []);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Dna className="h-5 w-5 text-primary" />
          <CardTitle className="text-xl">Pedigree Analysis</CardTitle>
        </div>
        <CardDescription>
          Track complete lineage history with interactive pedigree trees
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="w-full h-[500px] overflow-hidden">
          {mockReptiles.length > 0 && (
            <FlowChart 
              reptileId="root-reptile" 
              reptiles={mockReptiles} 
              isFeature
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PedigreeFeatureCard;
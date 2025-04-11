'use client';

import { MorphsTab } from '@/components/dashboard/reptiles/morphs/MorphsTab';
import { ReptilesTab } from '@/components/dashboard/reptiles/reptiles/ReptilesTab';
import { SpeciesTab } from '@/components/dashboard/reptiles/species/SpeciesTab';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings } from 'lucide-react';

export default function ReptilesPage() {
  return (
    <div className="container mx-auto">
        <div className="flex items-center justify-between w-full">
            <h1 className="text-3xl font-bold mb-6">Reptile Management</h1>
            <Button variant="primary">
              <Settings className="h-4 w-4" />
              Options
            </Button>
        </div>
      <Tabs defaultValue="reptiles" className="space-y-6">
        <div className="flex flex-col w-full">
            <TabsList>
              <TabsTrigger value="reptiles">Reptiles</TabsTrigger>
              <TabsTrigger value="species">Species</TabsTrigger>
              <TabsTrigger value="morphs">Morphs</TabsTrigger>
            </TabsList>
            <hr className='mt-[1px]'/>
        </div>
    
        <TabsContent value="reptiles">
          <ReptilesTab />
        </TabsContent>

        <TabsContent value="species">
          <SpeciesTab />
        </TabsContent>

        <TabsContent value="morphs">
          <MorphsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
} 
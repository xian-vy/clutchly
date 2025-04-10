'use client';

import { MorphsTab } from '@/components/dashboard/reptiles/morphs/MorphsTab';
import { ReptilesTab } from '@/components/dashboard/reptiles/reptiles/ReptilesTab';
import { SpeciesTab } from '@/components/dashboard/reptiles/species/SpeciesTab';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ReptilesPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Reptile Management</h1>

      <Tabs defaultValue="reptiles" className="space-y-6">
        <TabsList>
          <TabsTrigger value="reptiles">Reptiles</TabsTrigger>
          <TabsTrigger value="species">Species</TabsTrigger>
          <TabsTrigger value="morphs">Morphs</TabsTrigger>
        </TabsList>

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
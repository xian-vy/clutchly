import { MorphsTab } from '@/components/dashboard/reptiles/morphs/MorphsTab';
import { ReptilesTab } from '@/components/dashboard/reptiles/reptiles/ReptilesTab';
import { SpeciesTab } from '@/components/dashboard/reptiles/species/SpeciesTab';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings } from 'lucide-react';

export default async function ReptilesPage() {

  return (
    <div className="container mx-auto">
        <div className="flex items-center justify-between w-full  mb-6">
            <h1 className="text-lg sm:text-xl 2xl:text-2xl 3xl:text-3xl font-bold">Reptile Management</h1>
            <Button variant="outline">
              <Settings className="h-4 w-4" />
              Options
            </Button>
        </div>
      <Tabs defaultValue="reptiles" className="space-y-6">
        <div className="flex flex-col w-full">
            <TabsList>
              <TabsTrigger value="reptiles">Reptiles</TabsTrigger>
              <TabsTrigger value="morphs">Morphs</TabsTrigger>
              <TabsTrigger value="species">Species</TabsTrigger>
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
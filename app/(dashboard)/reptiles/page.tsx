import { MorphsTab } from '@/components/dashboard/reptiles/morphs/MorphsTab';
import { ReptileReportsTab } from '@/components/dashboard/reptiles/reptiles/ReptileReportsTab';
import { ReptilesTab } from '@/components/dashboard/reptiles/reptiles/ReptilesTab';
import { SpeciesTab } from '@/components/dashboard/reptiles/species/SpeciesTab';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings } from 'lucide-react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default async function ReptilesPage() {
  return (
    <ProtectedRoute pageName='Reptiles'>
      <div className="container mx-auto">
        <div className="flex items-center justify-between w-full mb-3 lg:mb-4 xl:mb-6">
          <h1 className="text-lg sm:text-xl 2xl:text-2xl text-foreground/85 dark:text-foreground/95  font-bold">Reptile Management</h1>
          <Button size="sm" variant="outline">
            <Settings className="h-4 w-4" />
            Options
          </Button>
        </div>
        <Tabs defaultValue="reptiles" className="space-y-2 md:space-y-3 xl:space-y-6">
          <div className="flex flex-col w-full">
            <TabsList>
              <TabsTrigger value="reptiles">Reptiles</TabsTrigger>
              <TabsTrigger value="morphs">Morphs</TabsTrigger>
              <TabsTrigger value="species">Species</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
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

          <TabsContent value='reports'>
            <ReptileReportsTab />
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  )
} 
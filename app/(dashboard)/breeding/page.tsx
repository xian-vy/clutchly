import { BreedingProjectsTab } from '@/components/dashboard/breeding/breeding/BreedingProjectsTab'
import Lineage from '@/components/dashboard/breeding/lineage/Lineage'
import { BreedingReportsTab } from '@/components/dashboard/breeding/reports/BreedingReportsTab'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Settings } from 'lucide-react'

export default async function BreedingPage() {
  return (
    <div className="container mx-auto">
      <div className="flex items-center justify-between w-full">
        <h1 className="text-3xl font-bold mb-6">Breeding Management</h1>
        <Button variant="outline">
          <Settings className="h-4 w-4" />
          Options
        </Button>
      </div>

        <Tabs defaultValue="projects" className="space-y-6">
         <div className="flex flex-col w-full">
              <TabsList>
                <TabsTrigger value="projects">Projects</TabsTrigger>
                <TabsTrigger value="lineage">Lineage</TabsTrigger>
                <TabsTrigger value="reports">Reports</TabsTrigger>
               </TabsList>
               <hr className='mt-[1px]'/>
          </div>
          <TabsContent value="projects">
            <BreedingProjectsTab />
          </TabsContent>
          
          <TabsContent value="lineage" >
            <div className="text-center text-muted-foreground">
              <Lineage />
            </div>
          </TabsContent>
          
          <TabsContent value="reports">
            <div className="text-center text-muted-foreground py-8">
              <BreedingReportsTab />
            </div>
          </TabsContent>
        </Tabs>
    </div>
  )
} 
import { BreedingProjectsTab } from '@/components/dashboard/breeding/BreedingProjectsTab'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function BreedingPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Breeding Management</h1>
      </div>

        <Tabs defaultValue="projects" className="w-full">
          <TabsList className="w-full justify-start border-b rounded-none">
            <TabsTrigger value="projects">Breeding Projects</TabsTrigger>
            <TabsTrigger value="lineage">Lineage</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>
          
          <TabsContent value="projects" className="p-4">
            <BreedingProjectsTab />
          </TabsContent>
          
          <TabsContent value="lineage" className="p-4">
            <div className="text-center text-muted-foreground py-8">
              Lineage tracking coming soon
            </div>
          </TabsContent>
          
          <TabsContent value="reports" className="p-4">
            <div className="text-center text-muted-foreground py-8">
              Breeding reports coming soon
            </div>
          </TabsContent>
        </Tabs>
    </div>
  )
} 
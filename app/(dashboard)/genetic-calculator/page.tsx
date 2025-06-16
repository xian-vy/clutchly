
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import GeneticCalculatorTab from '@/components/dashboard/genetic-calculator/GeneticCalculatorTab';
import GeneticHistoryTab from '@/components/dashboard/genetic-calculator/GeneticHistoryTab';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings } from 'lucide-react';

export default async function GeneticCalculatorPage() {
  return (
  <ProtectedRoute pageName='Breeding'>
    <div className="container mx-auto">
      <div className="flex items-center justify-between w-full mb-3 lg:mb-4 xl:mb-6">
        <h1 className="text-lg sm:text-xl 2xl:text-2xl text-foreground/85 dark:text-foreground/95  font-bold">Genetic Calculator</h1>
        <Button size="sm" variant="outline">
          <Settings className="h-4 w-4" />
          Options
        </Button>
      </div>
      <Tabs defaultValue="calc" className="space-y-2 md:space-y-3 xl:space-y-6">
       <div className="flex flex-col w-full">
            <TabsList >
              <TabsTrigger value="calc">Calculator</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>
            <hr className='mt-[1px]'/>
        </div>
        <TabsContent value="calc">
          <GeneticCalculatorTab />
        </TabsContent>
        
        <TabsContent value="history">
          <GeneticHistoryTab />
        </TabsContent>
      </Tabs>
    </div>
    </ProtectedRoute>
  );
} 
import { CatalogTab } from '@/components/dashboard/catalog/CatalogTab';
import { CatalogSettings } from '@/components/dashboard/catalog/CatalogSettings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function CatalogPage() {
  return (
    <div className="container mx-auto">
    <div className="mb-3 lg:mb-4 xl:mb-6">
        <h1 className="text-lg sm:text-xl 2xl:text-2xl 3xl:!text-3xl font-bold">Reptile Catalog</h1>
        <p className="text-sm md:text-base text-muted-foreground mt-1">
          Create catalogs for your featured reptiles and share in socials
        </p>
    </div>
    
      
      <Tabs defaultValue="entries" className="space-y-2 md:space-y-3 xl:space-y-6">
        <div className="flex flex-col w-full">
          <TabsList>
            <TabsTrigger value="entries">Entries</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          <hr className='mt-[1px]'/>
        </div>
        
        <TabsContent value="entries">
          <CatalogTab />
        </TabsContent>
        
        <TabsContent value="settings">
          <CatalogSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
} 
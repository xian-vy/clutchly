import { ProfileTab } from '@/components/dashboard/settings/ProfileTab';
import DownloadTab from '@/components/backup';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings } from 'lucide-react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default async function SettingsPage() {

  return (
    <ProtectedRoute pageName="settings">
    <div className="container mx-auto">
        <div className="flex items-center justify-between w-full mb-3 lg:mb-4 xl:mb-6">
            <h1 className="text-lg sm:text-xl 2xl:text-2xl text-foreground/85 dark:text-foreground/95  font-bold">Settings</h1>
            <Button size="sm" variant="outline">
              <Settings className="h-4 w-4" />
              Options
            </Button>
        </div>
      <Tabs defaultValue="organization" className="space-y-2 md:space-y-3">
        <div className="flex flex-col w-full">
            <TabsList>
              <TabsTrigger value="organization">Organization</TabsTrigger>
              <TabsTrigger value="backup">Backup</TabsTrigger>
            </TabsList>
            <hr className='mt-[1px]'/>
        </div>
    
        <TabsContent value="organization">
            <ProfileTab />
        </TabsContent>

        <TabsContent value="backup">
                <DownloadTab />
         </TabsContent>

      </Tabs>
    </div>
    </ProtectedRoute>
  )
} 
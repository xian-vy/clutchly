import AccessControlTab from '@/components/dashboard/users/AccessControlTab';
import UsersTab from '@/components/dashboard/users/UsersTab';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings } from 'lucide-react';

export default async function UsersPage() {

  return (
    <div className="container mx-auto">
        <div className="flex items-center justify-between w-full mb-3 lg:mb-4 xl:mb-6">
            <h1 className="text-lg sm:text-xl 2xl:text-2xl font-bold">User Management</h1>
            <Button size="sm" variant="outline">
              <Settings className="h-4 w-4" />
              Options
            </Button>
        </div>
      <Tabs defaultValue="users" className="space-y-2 md:space-y-3">
        <div className="flex flex-col w-full">
            <TabsList>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="access">Access Control</TabsTrigger>
            </TabsList>
            <hr className='mt-[1px]'/>
        </div>
    
        <TabsContent value="users">
            <UsersTab />
        </TabsContent>
        <TabsContent value="access">
            <AccessControlTab />
        </TabsContent>

      </Tabs>
    </div>
  )
} 
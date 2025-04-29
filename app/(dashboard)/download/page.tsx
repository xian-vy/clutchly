
import { BackupClient } from '../../../components/download/DownloadData'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import DownloadHistory from '@/components/download/DownloadHistory'
import { backupTypes } from '@/lib/types/download'
import { getLastBackupTimes } from '@/app/api/download/download'

export default async function BackupPage() {
  
  const lastBackups = await getLastBackupTimes()

  const lastBackupTimes = lastBackups?.reduce((acc, backup) => {
    acc[backup.backup_type] = new Date(backup.created_at)
    return acc
  }, {} as Record<string, Date>) || {}


  return (
    <div className="container mx-auto">
      <div className="mb-3 lg:mb-4 xl:mb-6">
        <h1 className="text-lg sm:text-xl 2xl:text-2xl 3xl:!text-3xl font-bold">Download Data</h1>
        <p className="text-muted-foreground mt-1">
          Download your data with advanced filtering options
        </p>
      </div>

      <Tabs defaultValue="download" className="space-y-2 md:space-y-3 xl:space-y-6">
         <div className="flex flex-col w-full">
              <TabsList>
                <TabsTrigger value="download">Download</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
               </TabsList>
               <hr className='mt-[1px]'/>
          </div>
          <TabsContent value="download">
              <div className="grid gap-6 md:grid-cols-2 3xl:grid-cols-3">
                {backupTypes.map((type) => (
                  <div key={type.id} className="rounded-lg border bg-card">
                    <div className="p-6">
                      <div className="mb-4">
                        <h3 className="font-semibold">{type.label}</h3>
                        <p className="text-sm text-muted-foreground">{type.description}</p>
                      </div>
                      <BackupClient 
                        type={type}
                        lastBackup={lastBackupTimes[type.id]}
                      />
                    </div>
                  </div>
                ))}
              </div>
          </TabsContent>
          
          <TabsContent value="history">
              <DownloadHistory />
          </TabsContent>
        </Tabs>        
        

      
    </div>
  )
} 
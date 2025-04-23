import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { BackupClient } from '../../../components/download/DownloadData'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import DownloadHistory from '@/components/download/DownloadHistory'
import { backupTypes } from '@/lib/types/download'

export default async function BackupPage() {
  const supabase = createServerComponentClient({ cookies })
  
  const { data: lastBackups } = await supabase
    .from('backup_logs')
    .select('backup_type, created_at')
    .order('created_at', { ascending: false })

  const lastBackupTimes = lastBackups?.reduce((acc, backup) => {
    acc[backup.backup_type] = new Date(backup.created_at)
    return acc
  }, {} as Record<string, Date>) || {}


  return (
    <div className="container mx-auto">
      <div className="mb-8">
        <h1 className="text-lg sm:text-xl 2xl:text-2xl 3xl:text-3xl font-bold">Download Data</h1>
        <p className="text-muted-foreground mt-1">
          Download your data with advanced filtering options
        </p>
      </div>

      <Tabs defaultValue="download" className="space-y-6">
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
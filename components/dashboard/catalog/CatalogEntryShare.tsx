import { getOrganization } from '@/app/api/organizations/organizations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { APP_NAME, APP_URL } from '@/lib/constants/app';
import { Organization } from '@/lib/types/organizations';
import { useQuery } from '@tanstack/react-query';
import { Copy, Share2Icon } from 'lucide-react';
import React, { useState } from 'react'
import { toast } from 'sonner';
import ShareURLDialog from './components/ShareURLDialog';

const CatalogEntryShare = () => {
  const [openShareDialog, setOpenShareDialog] = useState(false);

    const { data: organization } = useQuery<Organization>({
        queryKey: ['organization2'],
        queryFn: getOrganization
      })
      const userProfile = Array.isArray(organization) ? organization[0] : organization;
    
  return (
        <div className="flex items-center gap-2 w-full">
                <Input
                  readOnly
                  value={`clutchly.vercel.app/c/${userProfile?.full_name || 'your-organization'}`}
                  className="bg-muted w-full sm:w-[300px] h-8"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    navigator.clipboard.writeText(`${APP_URL}/c/${userProfile?.full_name || 'your-organization'}`);
                    toast.success('URL copied to clipboard');
                  }}
                  className='h-8'
                >
                  <Copy className=" h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setOpenShareDialog(true)}
                  className='h-8'
                >
                  <Share2Icon className=" h-4 w-4" />
                </Button>
                            
              <ShareURLDialog orgName={userProfile?.full_name || APP_NAME} open={openShareDialog} onClose={() => setOpenShareDialog(false)} />
        </div>
        
  )
}

export default CatalogEntryShare

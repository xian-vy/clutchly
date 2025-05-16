import { getProfile } from '@/app/api/profiles/profiles';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { APP_URL } from '@/lib/constants/app';
import { Profile } from '@/lib/types/profile';
import { useQuery } from '@tanstack/react-query';
import { Copy, Share2Icon } from 'lucide-react';
import React from 'react'
import { toast } from 'sonner';

const CatalogEntryShare = () => {
    const { data: profile } = useQuery<Profile>({
        queryKey: ['profile2'],
        queryFn: getProfile
      })
      const userProfile = Array.isArray(profile) ? profile[0] : profile;
    
  return (
        <div className="flex items-center gap-2">
                <Input
                  readOnly
                  value={`${APP_URL}/${userProfile?.full_name || 'your-profile'}`}
                  className="bg-muted w-full sm:w-[300px]"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    navigator.clipboard.writeText(`${APP_URL}/${userProfile?.full_name || 'your-profile'}`);
                    toast.success('URL copied to clipboard');
                  }}
                >
                  <Copy className=" h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                >
                  <Share2Icon className=" h-4 w-4" />
                </Button>
        </div>
        
  )
}

export default CatalogEntryShare

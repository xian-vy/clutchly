'use client';

import { Button } from '@/components/ui/button';
import {
  Eye,
  PlusIcon
} from 'lucide-react';
import CatalogEntryShare from './CatalogEntryShare';
import { APP_URL } from '@/lib/constants/app';
import { Profile } from '@/lib/types/profile';
import { useQuery } from '@tanstack/react-query';
import { getProfile } from '@/app/api/profiles/profiles';
import { useScreenSize } from '@/lib/hooks/useScreenSize';


interface CatalogHeaderProps {
    onAddNew: () => void;
    isAdmin?: boolean;

  }
  
const CatalogActions = ({isAdmin,onAddNew  } : CatalogHeaderProps) => {
  const s = useScreenSize();
  const { data } = useQuery<Profile>({
    queryKey: ['profile2'],
    queryFn: getProfile,
  }); 

  const profile = Array.isArray(data) ? data[0] : data;

  return (
    <div className="flex flex-row items-center justify-between gap-2">
            <CatalogEntryShare />
            <div className="flex items-center gap-2">
                {isAdmin && (
                    <Button  onClick={() => window.open(`${APP_URL}/catalog/${profile ? profile.full_name.trim() : "notfound"}`, '_blank')} variant="outline" size="sm" className="h-8">
                      <Eye className="h-3.5 w-3.5" />
                      {s !== "mobile" && "View Site"}
                    </Button>
                )}

                {isAdmin && (
                    <Button onClick={onAddNew} size="sm" className="h-8">
                    <PlusIcon className="h-3.5 w-3.5" />
                    {s !== "mobile" && "Add Reptile"}
                    </Button>
                )}
            </div>
  </div>
  )
}

export default CatalogActions

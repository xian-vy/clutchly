'use client';

import { Button } from '@/components/ui/button';
import {
  ArrowUpDown,
  Eye,
  PlusIcon
} from 'lucide-react';
import CatalogEntryShare from './CatalogEntryShare';
import { APP_URL } from '@/lib/constants/app';
import { Profile } from '@/lib/types/profile';
import { useQuery } from '@tanstack/react-query';
import { getProfile } from '@/app/api/profiles/profiles';

type ViewMode = 'grid' | 'list';

interface CatalogHeaderProps {
    onAddNew: () => void;
    isAdmin?: boolean;
    viewMode? : ViewMode;
    onViewModeChange: (mode: ViewMode) => void;
  }
  
const CatalogHeader = ({isAdmin,onAddNew ,viewMode,onViewModeChange } : CatalogHeaderProps) => {

  const { data } = useQuery<Profile>({
    queryKey: ['profile2'],
    queryFn: getProfile,
  }); 

  const profile = Array.isArray(data) ? data[0] : data;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CatalogEntryShare />
            <div className="flex items-center gap-2">

            {isAdmin && (
                <Button  onClick={() => window.open(`${APP_URL}/catalog/${profile ? profile.full_name.trim() : "notfound"}`, '_blank')} variant="outline" size="sm" className="h-8">
                  <Eye className="h-3.5 w-3.5" />
                  View Site
                </Button>
            )}

            {isAdmin && 1 !== 1 && (
                <Button variant="outline" size="sm" className="h-8 gap-1" onClick={()=>onViewModeChange(viewMode === 'grid' ? 'list' : 'grid')}>
                <ArrowUpDown className="h-3.5 w-3.5" />
                <span>{viewMode === 'grid' ? 'List' : 'Grid'}</span>
                </Button>
            )}
            
            {isAdmin && (
                <Button onClick={onAddNew} size="sm" className="h-8">
                <PlusIcon className="h-3.5 w-3.5" />
                Add Reptile
                </Button>
            )}

            </div>
  </div>
  )
}

export default CatalogHeader

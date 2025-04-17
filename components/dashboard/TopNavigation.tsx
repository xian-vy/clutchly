'use client';

import { Button } from '@/components/ui/button';
import {
    Crown
} from 'lucide-react';
import { Badge } from '../ui/badge';

const TopNavigation = () => {
  return (
    <div className="h-16 border-b border-border flex items-center justify-between px-4 lg:px-6 lg:ml-0">
        <div className="flex items-center gap-3 2xl:gap-5 ml-auto">
             <Badge variant="default" className="flex items-center gap-1 font-medium bg-primary dark:bg-slate-800/50 text-white dark:text-primary">
                <Crown className="h-3 w-3" />
                 Premium
             </Badge>
        </div>
    </div>
  )
}

export default TopNavigation
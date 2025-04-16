'use client';

import { Button } from '@/components/ui/button';
import {
    Crown,
    Menu,
    X
} from 'lucide-react';
import { useState } from 'react';
import { Badge } from '../ui/badge';

const TopNavigation = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  return (
    <div className="h-16 border-b border-border flex items-center justify-between px-4 lg:px-6">
        <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
            {isSidebarOpen ? (
            <X className="h-6 w-6" />
            ) : (
            <Menu className="h-6 w-6" />
            )}
        </Button>

        <div className="flex items-center gap-3 2xl:gap-5 ml-auto">
             <Badge variant="default" className="flex items-center gap-1 font-medium bg-slate-100 dark:bg-slate-800/50 text-primary">
                <Crown className="h-3 w-3" />
                 Premium
             </Badge>
            
        </div>
    </div>
  )
}

export default TopNavigation
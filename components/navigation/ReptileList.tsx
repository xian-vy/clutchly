import { getReptiles } from '@/app/api/reptiles/reptiles';
import { Reptile } from '@/lib/types/reptile';
import { useQuery } from '@tanstack/react-query';
import { useVirtualizer } from '@tanstack/react-virtual';
import React, { useRef, useState } from 'react'
import { Button } from '../ui/button';
import {  CircleHelp, Funnel, Loader2, Mars, PanelRightClose, PanelRightOpen, Plus,  Search,  Venus,  } from 'lucide-react';
import { Input } from '../ui/input';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';
import useSidebarAnimation from '@/lib/hooks/useSidebarAnimation';
import { Skeleton } from '../ui/skeleton';
import { ReptileSidebarFilterDialog, SidebarReptileFilters } from './ReptileSidebarFilterDialog';
import { useSidebarStore } from '@/lib/stores/sidebarStore';
const AddNewShortcut = dynamic(() => import('./AddNewShortcut'), 
 {
  loading: () => <div className="absolute inset-0 z-50 flex items-center justify-center">
    <Loader2 className="animate-spin w-4 h-4 text-primary" />
  </div>,
 }
)

const ReptileDetailsDialog = dynamic(
    () => import('../dashboard/reptiles/reptiles/ReptileDetailsDialog').then(mod => mod.ReptileDetailsDialog),
    {
      loading: () => <div className="absolute inset-0 z-50 flex items-center justify-center">
        <Loader2 className="animate-spin w-4 h-4 text-primary" />
      </div>,
    }
  );

const ReptileList = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [openAddNew, setOpenAddNew] = useState(false);
    const isCollapsed = useSidebarStore((s) => s.isCollapsed);
    const setIsCollapsed = useSidebarStore((s) => s.setIsCollapsed);
    const [selectedReptile, setSelectedReptile] = useState<Reptile | null>(null);
    const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
    const [filters, setFilters] = useState<SidebarReptileFilters>({});
    useSidebarAnimation({ isCollapsed }); 
  const { data: reptiles = [], isLoading } = useQuery<Reptile[]>({
    queryKey: ['reptiles'],
    queryFn: getReptiles,
  });

  // Filtering logic for sidebar (5 filters)
  const filteredReptiles = reptiles
    .filter(reptile => {
      // Search filter (matches name or reptile_code)
      if (
        searchQuery &&
        !(
          reptile.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (reptile.reptile_code && reptile.reptile_code.toLowerCase().includes(searchQuery.toLowerCase()))
        )
      ) {
        return false;
      }
      // Species filter
      if (filters.species?.length && !filters.species.includes(reptile.species_id?.toString())) {
        return false;
      }
      // Morph filter
      if (filters.morphs?.length && !filters.morphs.includes(reptile.morph_id?.toString())) {
        return false;
      }
      // Sex filter
      if (filters.sex?.length && !filters.sex.includes(reptile.sex)) {
        return false;
      }
      // Status filter
      if (filters.status?.length && !filters.status.includes(reptile.status)) {
        return false;
      }
      // Breeder filter
      if (filters.isBreeder !== null && filters.isBreeder !== undefined) {
        if (filters.isBreeder !== !!reptile.is_breeder) {
          return false;
        }
      }
      return true;
    })
    .sort((a, b) => a.name.localeCompare(b.name)); // Sort by name descending

  // Count active filters
  const activeFilterCount = [
    filters.species?.length,
    filters.morphs?.length,
    filters.sex?.length,
    filters.status?.length,
    (filters.isBreeder !== null && filters.isBreeder !== undefined) ? 1 : 0
  ].filter(Boolean).length;

  // Virtualization setup
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: filteredReptiles.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 32, // Estimated height of each reptile item
    overscan: 5, // Number of items to render outside the visible area
  });

  return (
    <div className={cn("hidden lg:block bg-background border-r border-sidebar-border z-20",
        isCollapsed ? 'w-0' : 'ml-[54px]  w-[250px] 3xl:!w-[290px] h-screen overflow-hidden transition-all duration-300 ease-in-out',
    )}>
        <div className={cn("flex flex-col h-full p-4 pt-16 gap-4",
        isCollapsed ? 'opacity-0' : 'opacity-100'
        )}>
            <Button size="sm" onClick={()=> setOpenAddNew(true)}  className="w-full">
              <span className="text-xs 3xl:text-sm">Add New Reptile</span>
              <Plus  className="ml-2 h-3 w-3" />
            </Button>
            {/* Search input */}
            <div className="relative ">
            <Search className="absolute left-3 top-3 h-3.5 w-3.5 text-muted-foreground" />
            <Input
                type="text"
                placeholder={`Search from ${filteredReptiles.length} reptiles`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-9 text-sm bg-sidebar-accent/50 placeholder:text-xs 3xl:placeholder:text-[0.8rem]"
            />
            
            <div className="absolute right-3 top-3 flex items-center gap-1">
              <Funnel 
                className="h-3.5 w-3.5 text-muted-foreground cursor-pointer" 
                onClick={() => setIsFilterDialogOpen(true)}
              />
              {activeFilterCount > 0 && (
                <span className="ml-1 bg-primary text-white dark:text-black rounded-full px-1.5 py-0.5 text-[10px] font-bold">{activeFilterCount}</span>
              )}
            </div>
            </div>

            {/* Virtualized reptiles list */}
            <div 
                ref={parentRef}
                className="h-[calc(80vh)] 3xl:!h[calc(85vh)] overflow-y-auto
                  [scrollbar-color:var(--color-sidebar-scrollbar)_var(--color-background)]     
                "
            >
                <div
                    style={{
                        height: isLoading ? undefined : `${rowVirtualizer.getTotalSize()}px`,
                        width: '100%',
                        position: 'relative',
                    }}
                >
                    {isLoading ? (
                      Array.from({ length: 30 }).map((_, idx) => (
                        <div key={idx} className="flex items-center mb-1 px-2 py-1.5">
                          <Skeleton className="h-4 rounded mr-2 w-full" />
                        </div>
                      ))
                    ) : (
                      rowVirtualizer.getVirtualItems().map((virtualRow) => {
                        const reptile = filteredReptiles[virtualRow.index];
                        return (
                            <div
                                key={reptile.id}
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: `${virtualRow.size}px`,
                                    transform: `translateY(${virtualRow.start}px)`,
                                }}
                                onClick={() => {
                                    setSelectedReptile(reptile);
                                    setOpenAddNew(false); 
                                }}
                            >
                                <button
                                    className={cn(
                                        'w-full flex items-center px-2 py-1.5 gap-1.5 rounded-md text-xs cursor-pointer transition-colors max-w-[200px] 3xl:max-w-[220px]',
                                        'text-sidebar-foreground hover:bg-sidebar-accent'
                                    )}
                                >
                                    <div className="">
                                        {reptile.sex === 'male' ? (
                                        <Mars className="h-3.5 3xl:h-4 w-3.5 3xl:w-4 text-blue-400 shrink-0"/>
                                        ) : reptile.sex === 'female' ? (
                                        <Venus className="h-3.5 3xl:h-4 w-3.5 3xl:w-4 text-red-500 shrink-0"/>
                                        ) :(
                                        <CircleHelp className="h-3.5 3xl:h-4 w-3.5 3xl:w-4 text-muted-foreground shrink-0"/>
                                        )}
                                    </div>
                                    <span className="truncate text-[0.8rem] 3xl:text-sm">{reptile.name}</span>
                                </button>
                            </div>
                        );
                      })
                    )}
                </div>
            </div>
        </div>

         {/* Collapse toggle button */}
          <button
            className={cn("hidden lg:flex !border-0 shadow-none absolute  translate-x-1/2 cursor-pointer bg-background z-30",
            isCollapsed ? '-right-18 top-17' : 'right-0 top-17',
            )}
            onClick={() => setIsCollapsed(!isCollapsed)}>
            {isCollapsed ? (
                <PanelRightClose strokeWidth={1.5} className="!h-5 !w-5 text-foreground/75" />  
            ) : (
                <PanelRightOpen strokeWidth={1.5}  className="!h-5 !w-5 text-foreground/65" />
            )}
        </button>

        {openAddNew &&  <AddNewShortcut open={openAddNew} setOpen={setOpenAddNew} />}  
        {selectedReptile && (
            <ReptileDetailsDialog 
                open={!!selectedReptile}
                onOpenChange={() => setSelectedReptile(null)}
                reptileId={selectedReptile.id.toString()}
                reptiles={reptiles}
            />
        )}
        {/* Sidebar Filter Dialog */}
        <ReptileSidebarFilterDialog
          open={isFilterDialogOpen}
          onOpenChange={setIsFilterDialogOpen}
          onApplyFilters={setFilters}
          currentFilters={filters}
        />
    </div>
  )
}

export default ReptileList

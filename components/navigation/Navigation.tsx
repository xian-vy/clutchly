'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import React, { useState, useTransition, useMemo } from 'react';
import AccountAvatar from './AccountAvatar';
import { useTheme } from 'next-themes';
import { TopLoader } from '../ui/TopLoader';
import { useUpcomingFeedings } from '@/lib/hooks/useUpcomingFeedings';
import { isToday } from 'date-fns';
import useSidebarAnimation from '@/lib/hooks/useSidebarAnimation';
import { Badge } from '../ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ScrollArea } from '../ui/scroll-area';
import { NAV_ITEMS, NavItem } from '@/lib/constants/navigation';
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Dot, Loader2, Menu } from 'lucide-react';
import dynamic from 'next/dynamic'
import { APP_NAME } from '@/lib/constants/app';
import useAccessControl from '@/lib/hooks/useAccessControl';
import { Skeleton } from '../ui/skeleton';
import { logout } from '@/app/auth/logout/actions';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { OrganizationSetupDialog } from '../organization/OrganizationSetupDialog';
import { User } from '@/lib/types/users';
import { getCurrentUser } from '@/app/api/organizations/organizations';

const AddNewShortcut = dynamic(() => import('./AddNewShortcut'), 
 {
  loading: () => <div className="absolute inset-0 z-50 flex items-center justify-center">
    <Loader2 className="animate-spin w-4 h-4 text-primary" />
  </div>,
 }
)

export function Navigation() {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { theme } = useTheme();
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  useSidebarAnimation({ isCollapsed }); 
  const [openSection, setOpenSection] = useState<string | null>(null);
  const { 
    upcomingFeedings, 
  } = useUpcomingFeedings();
  const [dialogToOpen, setDialogToOpen] = React.useState<"Reptile" | "Sale" | "Expense" | null>(null)
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<User>({
    queryKey: ['user'],
    queryFn: getCurrentUser,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    retry: 1, // Only retry once on failure
    retryDelay: 1000, // Wait 1 second before retrying
  }); 

  const { filterNavItems, isLoading: accessLoading } = useAccessControl(data);

  // Filter navigation items based on access
  const accessibleNavItems = useMemo(() => {
    if (isLoading || accessLoading) return []; // Return empty array while loading
    return filterNavItems(NAV_ITEMS);
  }, [filterNavItems, isLoading, accessLoading]);

  // Group accessible items by section
  const groupedNavItems = useMemo(() => {
    if (isLoading || accessLoading) {
      return {
        '': Array(10).fill(null) 
      };
    }
    return accessibleNavItems.reduce((acc: Record<string, NavItem[]>, item: NavItem) => {
      const section = item.section || '';
      if (!acc[section]) {
        acc[section] = [];
      }
      acc[section].push(item);
      return acc;
    }, {});
  }, [accessibleNavItems, isLoading, accessLoading]);

  const todayFeedings = upcomingFeedings.filter(feeding => isToday(feeding.date));
  const pendingTodayFeedings = todayFeedings.filter(feeding => !feeding.isCompleted);
  const hasPendingFeedings = pendingTodayFeedings.length > 0;
  const handleNavigation = (href: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    if (href !== pathname) {
      startTransition(() => {
        router.push(href);
      });
    }
  };

  const toggleCollapsible = (name: string) => {
    setOpenSection(current => current === name ? null : name);
  };
  const handleAddNew =(type : "Reptile" | "Sale" | "Expense") => {
    setDialogToOpen(type)
  }

  
  const handleLogout = async () => {
    try {
        setIsLoggingOut(true);
        // Invalidate all queries first
        await queryClient.invalidateQueries();
        // Then clear the cache
        queryClient.clear();
        await logout();
        window.location.reload();
        setIsLoggingOut(false);
    } catch (error) {
        console.error('Logout failed:', error);
    } 
};

  return (
    <>
    { isPending  && <TopLoader />}
    { isLoggingOut  && <TopLoader />}

      {/* Mobile menu button */}
      <Button
        variant="outline"
        size="icon"
        className="fixed top-4 left-4 z-40 lg:hidden"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        <Menu className="h-4 w-4" />
      </Button>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed flex flex-col h-[100dvh] inset-y-0 left-0 z-40 bg-sidebar border-r border-sidebar-border transform transition-all duration-200 ease-in-out lg:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full",
          isCollapsed ? "w-16" : "w-[19rem] 3xl:w-[22rem]"
        )}
      >
        <div className={cn(
          "flex h-18 items-center border-b border-sidebar-border py-2.5",
          isCollapsed ? "justify-center px-2" : "gap-2 px-4 2xl:px-5"
        )}>
          <Image
            src={theme === 'dark'? '/logo_dark.png' : '/logo_light.png'}
            width={37}
            height={37}
            alt="clutchly"
            className="rounded-full"
          />
          {!isCollapsed && (
            <div className="flex flex-col items-start">
               <span className="font-semibold text-base text-sidebar-foreground">{APP_NAME}</span>
               <span className="text-xs font-medium text-muted-foreground">Reptile Husbandry Management</span>
            </div>
          )}
        </div>
        <ScrollArea className='h-full'>
          <nav className="px-3 2xl:px-4 space-y-3  3xl:!space-y-6 pt-2 3xl:!pt-4 flex-1">
            {Object.entries(groupedNavItems).map(([section, items]) => (
              <div key={section} className="space-y-1">
                {!isCollapsed && section && (
                  <h2 className="mb-2 px-3 text-xs sm:text-[0.8rem] 3xl:!text-sm font-semibold text-sidebar-foreground/60">
                    {section}
                  </h2>
                )}
                {items.map((item, index) => {
                  if (isLoading || accessLoading) {
                    return (
                      <div
                        key={`skeleton-${section}-${index}`}
                        className={cn(
                          'relative flex items-center gap-3 rounded-lg py-3 3xl:!py-4',
                          isCollapsed ? 'justify-center px-1.5' : 'px-2.5'
                        )}
                      >
                        <Skeleton className="h-7 w-7 rounded-full" />
                        {!isCollapsed && <Skeleton className="h-6 flex-1" />}
                      </div>
                    );
                  }

                  const Icon = item.icon;
                  if ('items' in item) {
                    return (
                      <Collapsible 
                        key={item.name} 
                        className="space-y-2"
                        open={openSection === item.name}
                      >
                        <CollapsibleTrigger
                          className={cn(
                            'relative flex w-full items-center  gap-3 rounded-lg text-[0.8rem] 3xl:!text-sm font-medium transition-colors cursor-pointer py-2 3xl:py-2.5',
                            isCollapsed ? 'justify-center px-2' : 'px-3',
                            'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                          )}
                          onClick={() => toggleCollapsible(item.name)}
                        >
                          <div className="flex items-center gap-3 flex-1">
                              <Icon className={`w-4  h-4  ${item.name === 'Reptiles' || item.name === 'Sales' ? 'stroke-[0.012rem]' : ''}`} />
                              {!isCollapsed &&<span>{item.name}</span>}
                          </div>
                          {!isCollapsed && (
                            openSection === item.name ? <ChevronUp className="!h-3 !w-3" /> : <ChevronDown className="!h-3 !w-3" />
                          )}
                          
                        </CollapsibleTrigger>
                        <CollapsibleContent className={`space-y-1 ${isCollapsed ? "" : "border-l pl-5 ml-5"}`}>
                          {item.items && item.items.map((subItem: NavItem) => (
                            <p
                              key={subItem.href}
                              onClick={   
                                 subItem.action ?
                                 ()=> handleAddNew(subItem.type as "Reptile" | "Sale" | "Expense")
                                : handleNavigation(subItem.href!)
                              }
                              className={cn(
                                'relative flex items-center  gap-3 rounded-lg text-[0.8rem] 3xl:!text-sm font-medium transition-colors cursor-pointer py-2 3xl:py-2.5',
                                isCollapsed ? 'justify-center px-2' : 'pl-3 pr-3',
                                pathname === subItem.href
                                  ? 'bg-primary dark:bg-slate-800/50 text-white dark:text-primary'
                                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                              )}
                            >
                              {/* <subItem.icon className="w-4 h-4" /> */}
                              <Dot className="h-4 w-4" />
                              {!isCollapsed && subItem.name}
                            </p>
                          ))}
                        </CollapsibleContent>
                      </Collapsible>
                    );
                  }

                  return (
                    <p
                      key={item.href}
                      onClick={handleNavigation(item.href!)}
                      className={cn(
                        'relative flex items-center gap-3 rounded-lg text-[0.8rem] 3xl:!text-sm font-medium transition-colors cursor-pointer py-2 3xl:py-2.5',
                        isCollapsed ? 'justify-center px-2' : 'px-3',
                        pathname === item.href
                          ? 'bg-primary dark:bg-slate-800/50 text-white dark:text-primary'
                          : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                      )}
                    >
                      <Icon className={`w-4  h-4  ${item.name === 'Reptiles' && 'stroke-[0.012rem]'}`} />
                      {!isCollapsed && item.name}
                      {hasPendingFeedings && item.name === 'Feeding' && !isCollapsed && (
                        <Badge className='absolute right-3 text-xs font-medium'>
                          {pendingTodayFeedings.length}
                        </Badge>
                      )}
                    </p>
                  );
                })}
              </div>
            ))}
          </nav>
        </ScrollArea>

        <AccountAvatar  isCollapsed={isCollapsed} onLogout={handleLogout} user={data} isLoading={isLoading}/>

        {/* Collapse toggle button */}
        <Button
          variant="outline"
          size="sm"
          className="hidden w-8 h-8 lg:flex !border absolute right-0 top-12 translate-x-1/2 rounded-full  border-sidebar-border !bg-white dark:!bg-background hover:text-foreground"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? (
            <ChevronRight className="!h-3 !w-3" />
          ) : (
            <ChevronLeft className="!h-3 !w-3" />
          )}
        </Button>
       {dialogToOpen && <AddNewShortcut type={dialogToOpen} />}
       <OrganizationSetupDialog isLoggingOut={isLoggingOut}  isUserLoading={isLoading} user={data}/>
      </div>
    </>
  );
}
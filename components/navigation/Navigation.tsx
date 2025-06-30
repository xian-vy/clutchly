'use client';

import { cn } from '@/lib/utils';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect, useMemo, useState, useTransition } from 'react';
import AccountAvatar from './components/AccountAvatar';
import { TopLoader } from '../ui/TopLoader';
import { ScrollArea } from '../ui/scroll-area';
import { NAV_ITEMS, NavItem } from '@/lib/constants/navigation';
import ReptileList from './components/ReptileList';
import { OrganizationSetupDialog } from '../organization/OrganizationSetupDialog';
import useAccessControl from '@/lib/hooks/useAccessControl';
import { useSidebarStore } from '@/lib/stores/sidebarStore';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { Skeleton } from '../ui/skeleton';
import { useAuthStore } from '@/lib/stores/authStore';

export function Navigation() {
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const {theme} = useTheme();
  const { user,  fetchUserAndOrg, isLoading, isLoggingOut, logoutUser } = useAuthStore();
  const { filterNavItems, isLoading: accessLoading } = useAccessControl(user);

 useEffect(() => {
  fetchUserAndOrg()
  }, [fetchUserAndOrg]);

  const accessibleNavItems = useMemo(() => {
    if (isLoading || accessLoading) return []; 
    return filterNavItems(NAV_ITEMS);
  }, [filterNavItems, isLoading, accessLoading]);

  // Group accessible items by section
  const groupedNavItems = useMemo(() => {
    if (isLoading || accessLoading) {
      return {};
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

  
  const handleNavigation = (href: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    if (href !== pathname) {
      startTransition(() => {
        router.push(href);
      });
    }
  };

  const mobileSidebarOpen = useSidebarStore((s) => s.mobileSidebarOpen);
  const closeSidebar = useSidebarStore((s) => s.closeSidebar);

  return (
    <>
       { isPending  && <TopLoader />}
       { isLoggingOut  && <TopLoader />}

      {/* Desktop sidebar/reptile list */}
      <div className="hidden lg:flex fixed left-0 top-0 h-screen z-20">
        {/* Overlay sidebar */}
        <div className={cn(
          "absolute h-full left-0 top-0 bg-sidebar border-r border-sidebar-border z-30 flex flex-col transition-all duration-200 group/sidebar",
          isDropdownOpen ? "w-[240px]" : "w-[54px] hover:w-[240px]"
        )}>
          {/* Navigation section */}
          <ScrollArea className="flex-1 py-2 pt-14 3xl:pt-16">
            <nav className="space-y-1 px-3">
              {/* Render nav items grouped by section, with a divider between each section */}
              {(isLoading || accessLoading) ? (
                // Skeletons for nav items loading
                Array.from({ length: 14 }).map((_, idx) => (
                  <div key={idx} className="flex items-center gap-3 mb-1 p-1.5">
                    <Skeleton className={cn("w-5 h-5", isDropdownOpen ? "" : "opacity-0 group-hover/sidebar:opacity-100")} />
                  </div>
                ))
              ) : (
                Object.values(groupedNavItems).map((items, idx, arr) => (
                  <React.Fragment key={idx}>
                    {items.map((item) => {
                      const Icon = item.icon;
                      const isActive = pathname === item.href;
                      return (
                        <button
                          key={item.href}
                          onClick={handleNavigation(item.href || '')}
                          className={cn(
                            'w-full p-2 rounded-md transition-colors flex items-center gap-3 cursor-pointer ',
                            isActive
                            ? 'text-primary group-hover/sidebar:bg-primary/10 group-hover/sidebar:text-primary'
                            : 'text-sidebar-foreground/80 hover:bg-sidebar-accent'                        )}
                        >
                          <Icon className={cn("w-4 h-4 ",
                            isActive ? 'text-primary' : 'text-sidebar-foreground/80'
                          )} />
                          <span className={cn(
                            "text-sm font-medium truncate transition-opacity duration-200",
                            isDropdownOpen ? "opacity-100" : "opacity-0 group-hover/sidebar:opacity-100"
                          )}>
                            {item.name}
                          </span>
                        </button>
                      );
                    })}
                    {/* Divider between sections, except after the last section */}
                    {idx < arr.length - 1 && (
                      <div className="my-1 3xl:my-2.5 border-t border-sidebar-border w-[30px] group-hover/sidebar:w-full" />
                    )}
                  </React.Fragment>
                ))
              )}
            </nav>
          </ScrollArea>

          {/* Bottom avatar */}
          <div className="h-16 flex items-center px-2 border-t border-sidebar-border">
            <AccountAvatar 
              onLogout={logoutUser} 
              user={user} 
              isLoading={isLoading}
              onDropdownOpenChange={setIsDropdownOpen}
            />
          </div>
        </div>

        {/* Permanent reptile list panel */}
         <ReptileList />

         <OrganizationSetupDialog isLoggingOut={isLoggingOut}  isUserLoading={isLoading} user={user}/>

      </div>

      {/* Mobile sidebar/reptile list overlay */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50" onClick={closeSidebar} />
          {/* Sidebar panel */}
          <div className="relative bg-sidebar border-r border-sidebar-border w-[80vw] max-w-xs h-full z-50 flex flex-col animate-slide-in-left">

           <div className="flex items-center gap-2 p-3">
                    <Image
                      src={theme === 'dark' ? '/logo_dark.png' : '/logo_light.png'}
                      width={30}
                      height={30}
                      alt="clutchly"
                      className="rounded-full "
                    />
                    <span className='font-semibold text-base text-foreground/90'>Clutchly</span>
             </div>

            {/* Navigation section (reuse desktop nav) */}
              <nav className="flex-1 space-y-1 px-3 overflow-y-auto">
                {(isLoading || accessLoading) ? (
                  Array.from({ length: 6 }).map((_, idx) => (
                    <div key={idx} className="flex items-center gap-3 mb-1">
                      <Skeleton className="w-4 h-4" />
                      <Skeleton className="h-4 rounded w-24 opacity-100" />
                    </div>
                  ))
                ) : (
                  Object.values(groupedNavItems).map((items, idx, arr) => (
                    <React.Fragment key={idx}>
                      {items.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                          <button
                            key={item.href}
                            onClick={handleNavigation(item.href || '')}
                            className={cn(
                              'w-full p-2 rounded-md transition-colors flex items-center gap-3 cursor-pointer ',
                              isActive
                              ? 'text-primary bg-primary/10 '
                              : 'text-sidebar-foreground hover:bg-sidebar-accent'                        )}
                          >
                            <Icon className={cn("w-4 h-4 ",
                              isActive ? 'text-primary' : 'text-sidebar-foreground/80'
                            )} />
                            <span className={cn(
                              "text-sm font-medium truncate transition-opacity duration-300 opacity-100"
                            )}>
                              {item.name}
                            </span>
                          </button>
                        );
                      })}
                      {idx < arr.length - 1 && (
                        <div className="my-1 3xl:my-2 border-t border-sidebar-border" />
                      )}
                    </React.Fragment>
                  ))
                )}
              </nav>
            {/* Bottom avatar */}
            <div className="h-16 flex items-center px-2 border-t border-sidebar-border">
              <AccountAvatar 
                onLogout={logoutUser} 
                user={user} 
                isLoading={isLoading}
                onDropdownOpenChange={setIsDropdownOpen}
              />
            </div>
            {/* Reptile list for mobile */}
            <div className="border-t border-sidebar-border">
              <ReptileList />
            </div>
            <OrganizationSetupDialog isLoggingOut={isLoggingOut}  isUserLoading={isLoading} user={user}/>
          </div>
        </div>
      )}
    </>
  );
}

export default Navigation;
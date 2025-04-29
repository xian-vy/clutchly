'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ChevronUp,
    Dna,
    DollarSign,
    Download,
    Heart,
    LayoutDashboard,
    LineChart,
    Menu,
    Package,
    Plus,
    Rat,
    Settings,
} from 'lucide-react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import React, { useState, useTransition } from 'react';
import AccountAvatar from './AccountAvatar';
import { useTheme } from 'next-themes';
import { TopLoader } from '../ui/TopLoader';
import { VscSnake } from "react-icons/vsc";
import { useUpcomingFeedings } from '@/lib/hooks/useUpcomingFeedings';
import { isToday } from 'date-fns';
import useSidebarAnimation from '@/lib/hooks/useSidebarAnimation';
import { Badge } from '../ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ScrollArea } from '../ui/scroll-area';

interface NavItem {
  name: string;
  href?: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  items?: NavItem[];
  section?: string;
}

const navItems: NavItem[] = [
  {
    name: 'Overview',
    href: '/overview',
    icon: LayoutDashboard,
  },
  {
    section: 'Main',
    name: 'Sales',
    icon: DollarSign,
    items: [
      {
        name: 'Add New',
        href: '/sales/new',
        icon: Plus,
      },
      {
        name: 'All Sales',
        href: '/sales',
        icon: DollarSign,
      },
    ],
  },
  {
    section: 'Main',
    name: 'Reptiles',
    icon: VscSnake,
    items: [
      {
        name: 'Add New',
        href: '/reptiles/new',
        icon: Plus,
      },
      {
        name: 'All Reptiles',
        href: '/reptiles',
        icon: VscSnake,
      },
    ],
  },
  {
    section: 'Main',
    name: 'Breeding',
    href: '/breeding',
    icon: Dna,
  },
  {
    section: 'Health & Growth',
    name: 'Enclosures',
    href: '/housing',
    icon: Package
  },
  {
    section: 'Health & Growth',
    name: 'Health',
    href: '/health',
    icon: Heart,
  },
  {
    section: 'Health & Growth',
    name: 'Growth',
    href: '/growth',
    icon: LineChart,
  },
  {
    section: 'Health & Growth',
    name: 'Feeding',
    href: '/feeding',
    icon: Rat,
  },
  {
    section: 'System',
    name: 'Download',
    href: '/download',
    icon: Download,
  },
  {
    section: 'System',
    name: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

// Group items by section
const groupedNavItems = navItems.reduce((acc, item) => {
  const section = item.section || '';
  if (!acc[section]) {
    acc[section] = [];
  }
  acc[section].push(item);
  return acc;
}, {} as Record<string, NavItem[]>);

export function Navigation() {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { theme } = useTheme();
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  useSidebarAnimation({ isCollapsed }); 
  const [openCollapsible, setOpenCollapsible] = useState<Record<string, boolean>>({});
  const { 
    upcomingFeedings, 
  } = useUpcomingFeedings();

  const todayFeedings = upcomingFeedings.filter(feeding => isToday(feeding.date));

  const handleNavigation = (href: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    if (href !== pathname) {
      startTransition(() => {
        router.push(href);
      });
    }
  };
  const toggleCollapsible = (name: string) => {
    setOpenCollapsible(prevState => ({
      ...prevState,
      [name]: !prevState[name],
    }));
  };

  return (
    <>
    { isPending && <TopLoader />}

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
          "fixed flex flex-col h-[100vh] inset-y-0 left-0 z-40 bg-sidebar border-r border-sidebar-border transform transition-all duration-200 ease-in-out lg:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full",
          isCollapsed ? "w-16" : "w-[18rem] 3xl:w-[20rem]"
        )}
      >
        <div className={cn(
          "flex h-16 items-center border-b border-sidebar-border ",
          isCollapsed ? "justify-center px-2" : "gap-2 px-4 2xl:px-5"
        )}>
          <Image
            src={theme === 'dark'? '/logo_dark.png' : '/logo_light.png'}
            width={35}
            height={35}
            alt="lutchly"
            className="rounded-full"
          />
          {!isCollapsed && (
            <span className="font-semibold text-lg text-sidebar-foreground">Clutchly</span>
          )}
        </div>
        <ScrollArea className='h-[85vh]'>
          <nav className="p-3 2xl:p-4 space-y-4 2xl:space-y-5 pt-2 flex-1">
            {Object.entries(groupedNavItems).map(([section, items]) => (
              <div key={section} className="space-y-1">
                {!isCollapsed && (
                  <h2 className="mb-2 px-3 text-xs lg:text-sm font-semibold text-sidebar-foreground/60">
                    {section}
                  </h2>
                )}
                {items.map((item) => {
                  const Icon = item.icon;
                  if ('items' in item) {
                    return (
                      <Collapsible key={item.name} className="space-y-1">
                        <CollapsibleTrigger
                          className={cn(
                            'relative flex w-full items-center  gap-3 rounded-lg text-sm font-medium transition-colors cursor-pointer py-2 3xl:py-2.5',
                            isCollapsed ? 'justify-center px-2' : 'px-3',
                            'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                          )}
                          onClick={() => toggleCollapsible(item.name)}
                        >
                          <div className="flex items-center gap-3 flex-1">
                              <Icon className={`w-4.5 3xl:w-5 h-4.5 3xl:h-5 ${item.name === 'Reptiles' && 'stroke-[0.012rem]'}`} />
                              {!isCollapsed &&<span>{item.name}</span>}
                          </div>
                          {!isCollapsed && (
                            openCollapsible[item.name] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                          )}
                          
                        </CollapsibleTrigger>
                        <CollapsibleContent className="space-y-1">
                          {item.items && item.items.map((subItem) => (
                            <p
                              key={subItem.href}
                              onClick={handleNavigation(subItem.href!)}
                              className={cn(
                                'relative flex items-center  gap-3 rounded-lg text-sm font-medium transition-colors cursor-pointer py-2 3xl:py-2.5',
                                isCollapsed ? 'justify-center px-2' : 'pl-9 pr-3',
                                pathname === subItem.href
                                  ? 'bg-primary dark:bg-slate-800/50 text-white dark:text-primary'
                                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                              )}
                            >
                              <subItem.icon className="w-4 h-4" />
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
                        'relative flex items-center gap-3 rounded-lg text-sm font-medium transition-colors cursor-pointer py-2 3xl:py-2.5',
                        isCollapsed ? 'justify-center px-2' : 'px-3',
                        pathname === item.href
                          ? 'bg-primary dark:bg-slate-800/50 text-white dark:text-primary'
                          : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                      )}
                    >
                      <Icon className={`w-4.5 3xl:w-5 h-4.5 3xl:h-5 ${item.name === 'Reptiles' && 'stroke-[0.012rem]'}`} />
                      {!isCollapsed && item.name}
                      {todayFeedings.length > 0 && item.name === 'Feeding' && !isCollapsed && (
                        <Badge className='absolute right-3 text-xs font-medium'>
                          {todayFeedings.length}
                        </Badge>
                      )}
                    </p>
                  );
                })}
              </div>
            ))}
          </nav>
        </ScrollArea>

        <AccountAvatar isCollapsed={isCollapsed}/>

        {/* Collapse toggle button */}
        <Button
          variant="outline"
          size="icon"
          className="hidden lg:flex !border absolute right-0 top-11 translate-x-1/2 rounded-full  border-sidebar-border !bg-white dark:!bg-background hover:text-foreground"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>
    </>
  );
}
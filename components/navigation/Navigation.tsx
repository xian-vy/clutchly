'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
    ChevronLeft,
    ChevronRight,
    DatabaseBackup,
    Dna,
    Heart,
    LayoutDashboard,
    LineChart,
    Menu,
    Package,
    Rat,
    Settings,
} from 'lucide-react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useTransition } from 'react';
import AccountAvatar from './AccountAvatar';
import { useTheme } from 'next-themes';
import { TopLoader } from '../ui/TopLoader';
import { VscSnake } from "react-icons/vsc";

const navItems = [
  {
    name: 'Overview',
    href: '/overview',
    icon: LayoutDashboard,
  },
  {
    name: 'Reptiles',
    href: '/reptiles',
    icon: VscSnake,
  },
  {
    name : "Housing",
    href : '/housing',
    icon : Package
  },
  {
    name: 'Health',
    href: '/health',
    icon: Heart,
  },
  {
    name: 'Growth',
    href: '/growth',
    icon: LineChart,
  },
  {
    name: 'Breeding',
    href: '/breeding',
    icon: Dna,
  },
  {
    name: 'Feeding',
    href: '/feeding',
    icon: Rat,
  },
  {
    name: 'Backup',
    href: '/backup',
    icon: DatabaseBackup,
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

export function Navigation() {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { theme } = useTheme();
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  // Update CSS variable when sidebar is collapsed/expanded
  useEffect(() => {
    // First set the transition on the document
    document.documentElement.classList.add('sidebar-transitioning');
    
    // Then update the CSS variable
    document.documentElement.style.setProperty(
      '--sidebar-width', 
      isCollapsed ? '4rem' : '16rem'
    );
    
    // Update for 3xl screens
    document.documentElement.style.setProperty(
      '--sidebar-width-3xl', 
      isCollapsed ? '4rem' : '18rem'
    );
    
    // Remove the transition class after the transition completes
    const timer = setTimeout(() => {
      document.documentElement.classList.remove('sidebar-transitioning');
    }, 250);
    
    return () => clearTimeout(timer);
  }, [isCollapsed]);

  const handleNavigation = (href: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    if (href !== pathname) {
      startTransition(() => {
        router.push(href);
      });
    }
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
          isCollapsed ? "w-16" : "w-64 3xl:w-72"
        )}
      >
        <div className={cn(
          "flex h-16 items-center border-b border-sidebar-border ",
          isCollapsed ? "justify-center px-2" : "gap-2 px-4"
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

        <nav className="p-3 space-y-1 pt-5 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <p
                key={item.href}
                onClick={handleNavigation(item.href)}
                className={cn(
                  'flex items-center gap-3 rounded-lg text-sm font-medium transition-colors cursor-pointer  py-2 3xl:py-2.5',
                  isCollapsed ? 'justify-center px-2' : 'px-3',
                  pathname === item.href
                    ? 'bg-primary dark:bg-slate-800/50 text-white dark:text-primary'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                )}
              >
                <Icon className={`w-4.5 3xl:w-5 h-4.5 3xl:h-5 ${item.name === 'Reptiles' && 'stroke-[0.012rem]' }`} />
                {!isCollapsed && item.name}
              </p>
            );
          })}
        </nav>

        <AccountAvatar isCollapsed={isCollapsed}/>

        {/* Collapse toggle button */}
        <Button
          variant="outline"
          size="icon"
          className="!border absolute right-0 top-11 translate-x-1/2 rounded-full  border-sidebar-border !bg-white dark:!bg-background hover:text-foreground"
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
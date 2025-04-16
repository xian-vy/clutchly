'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
    ChevronLeft,
    ChevronRight,
    Dna,
    Heart,
    LayoutDashboard,
    LineChart,
    Settings,
    Turtle
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const navItems = [
  {
    name: 'Overview',
    href: '/overview',
    icon: LayoutDashboard,
  },
  {
    name: 'Herps',
    href: '/reptiles',
    icon: Turtle,
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
    name: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

export function Navigation() {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <>
       {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 bg-sidebar border-r border-sidebar-border transform transition-all duration-200 ease-in-out lg:translate-x-0 lg:static",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full",
          isCollapsed ? "w-16" : "w-64 3xl:w-72"
        )}
      >
        <div className={cn(
          "flex h-16 items-center border-b border-sidebar-border",
          isCollapsed ? "justify-center px-2" : "gap-2 px-4"
        )}>
          <Turtle className="w-6 h-6 text-primary" />
          {!isCollapsed && (
            <span className="font-semibold text-lg text-sidebar-foreground">Clutchly</span>
          )}
        </div>

        <nav className="p-3 space-y-1 pt-5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg text-sm font-medium transition-colors',
                  isCollapsed ? 'justify-center px-2 py-2' : 'px-3 py-2',
                  pathname === item.href
                    ? 'bg-sidebar-primary text-primary-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                )}
              >
                <Icon className="w-5 h-5" />
                {!isCollapsed && item.name}
              </Link>
            );
          })}
        </nav>

        {/* Collapse toggle button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-0 top-10 translate-x-1/2 rounded-full border border-sidebar-border bg-background"
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
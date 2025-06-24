'use client';

import { SubscriptionBadge } from '@/components/subscription/SubscriptionBadge';
import { InstallDialog } from '@/components/navigation/InstallDialog';
import { HelpDialog } from '@/components/navigation/HelpDialog';
import { ContactDialog } from '@/components/navigation/ContactDialog';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { Menu } from 'lucide-react';
import { useSidebarStore } from '@/lib/stores/sidebarStore';

const TopNavigation = () => {
  const { theme } = useTheme();
  const openSidebar = useSidebarStore((s) => s.openSidebar);

  return (
    <div className="h-12 border-b border-border flex items-center justify-between px-2 sm:pl-4 fixed left-0 w-full bg-background/90 z-40">
      <div className="flex items-center gap-2  ">
        <button
          className="block lg:hidden  p-2 rounded focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label="Open sidebar menu"
          onClick={openSidebar}
        >
          <Menu className="w-6 h-6" />
        </button>
        <Image
          src={theme === 'dark' ? '/logo_dark.png' : '/logo_light.png'}
          width={30}
          height={30}
          alt="clutchly"
          className="rounded-full hidden lg:block"
        />
        <span className='font-semibold hidden lg:block text-sm md:text-base text-foreground/90'>Clutchly</span>
      </div>
      <div className="flex items-center gap-3 md:gap-5 2xl:gap-6 ">
        <ContactDialog />
        <InstallDialog />
        <HelpDialog />
        <SubscriptionBadge />
      </div>
    </div>
  )
}

export { TopNavigation };
export default TopNavigation;
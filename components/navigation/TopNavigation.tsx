'use client';

import { SubscriptionBadge } from '@/components/subscription/SubscriptionBadge';
import { InstallDialog } from '@/components/navigation/InstallDialog';
import { HelpDialog } from '@/components/navigation/HelpDialog';
import { ContactDialog } from '@/components/navigation/ContactDialog';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { Building2, ChevronsUpDown, Menu, User } from 'lucide-react';
import { useSidebarStore } from '@/lib/stores/sidebarStore';
import { useQuery } from '@tanstack/react-query';
import { getCurrentUser, getOrganization } from '@/app/api/organizations/organizations';
import { Skeleton } from '../ui/skeleton';
import { Organization } from '@/lib/types/organizations';

const TopNavigation = () => {
  const { theme } = useTheme();
  const openSidebar = useSidebarStore((s) => s.openSidebar);

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['user2'],
    queryFn: getCurrentUser,
  });
  
  const { data: organization,isLoading: orgLoading  } = useQuery<Organization>({
    queryKey: ['organization2'],
    queryFn: getOrganization,
  });

  const userName = user?.full_name;
  const orgName = organization?.full_name

  return (
    <div className="h-12 border-b border-border flex items-center justify-between px-2 sm:pl-4 fixed left-0 w-full bg-background/90 z-40">
      <div className="flex items-center gap-3">
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
          <div className="hidden lg:flex items-center gap-3 3xl:gap-4">
              <span className='text-muted-foreground/60 text-xs'>/</span>
              {userLoading ? (
                <Skeleton className='w-20 rounded-md h-4' />
              ) : (
                <span className='flex items-center gap-2 font-medium text-[0.8rem] 3xl:!text-sm text-foreground/75 capitalize'>
                  <Building2 className='inline-block w-3.5 h-3.5' />
                  {orgName}
                </span>
              )}
              <span className='text-muted-foreground/60 text-xs'>/</span>
              {orgLoading ? (
                <Skeleton className='w-20 rounded-md h-4' />
              ) : (
                <span className='flex items-center gap-2 font-medium text-[0.8rem] 3xl:!text-sm text-foreground/75 capitalize'>
                  <User className='inline-block w-3.5 h-3.5' />
                  {userName}
                </span>
              )}
              <ChevronsUpDown className='inline-block w-3.5 h-3.5 text-foreground/75'  />
          </div>
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
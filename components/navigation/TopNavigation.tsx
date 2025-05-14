'use client';

import { SubscriptionBadge } from '@/components/subscription/SubscriptionBadge';
import { InstallDialog } from '@/components/navigation/InstallDialog';
import { HelpDialog } from '@/components/navigation/HelpDialog';
import { ContactDialog } from '@/components/navigation/ContactDialog';

const TopNavigation = () => {
  return (
    <div className="h-16 border-b border-border flex items-center justify-end pr-2 ">
        <div className="flex items-center gap-3 md:gap-5 2xl:gap-6 ">
            <ContactDialog />
            <InstallDialog />
            <HelpDialog />
            <SubscriptionBadge />
        </div>
    </div>
  )
}

export default TopNavigation
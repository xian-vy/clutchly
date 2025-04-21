'use client';

import { SubscriptionBadge } from '@/components/subscription/SubscriptionBadge';
import { InstallDialog } from '@/components/navigation/InstallDialog';
import { HelpDialog } from '@/components/navigation/HelpDialog';
import { FeedbackDialog } from '@/components/navigation/FeedbackDialog';

const TopNavigation = () => {
  return (
    <div className="h-16 border-b border-border flex items-center justify-between ">
        <div className="flex items-center gap-3 md:gap-5 2xl:gap-6 ml-auto">
            <FeedbackDialog />
            <InstallDialog />
            <HelpDialog />
            <SubscriptionBadge />
        </div>
    </div>
  )
}

export default TopNavigation
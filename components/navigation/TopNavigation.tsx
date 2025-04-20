'use client';

import { SubscriptionBadge } from '@/components/subscription/SubscriptionBadge';
import { InstallDialog } from '@/components/navigation/InstallDialog';
import { HelpDialog } from '@/components/navigation/HelpDialog';

const TopNavigation = () => {
  return (
    <div className="h-16 border-b border-border flex items-center justify-between px-4 lg:px-6 lg:ml-0">
        <div className="flex items-center gap-3 2xl:gap-5 ml-auto">
            <button className="text-sm text-muted-foreground hover:text-primary transition">
                Feedback
            </button>
            <InstallDialog />
            <HelpDialog />
            <SubscriptionBadge />
        </div>
    </div>
  )
}

export default TopNavigation
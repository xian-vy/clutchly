'use client';

import { useSubscription } from '@/lib/hooks/useSubscription';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Crown, Clock, Sparkles, Zap, ExternalLink } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export function SubscriptionBadge() {
  const {
    subscription,
    isLoading,
    isPremium,
    isTrialing,
    trialDaysLeft,
    trialEndDate
  } = useSubscription();

  if (isLoading) {
    return <Badge variant="outline" className="animate-pulse">Loading...</Badge>;
  }

  // If subscription data isn't available yet
  if (!subscription) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {isPremium ? (
          <Badge 
            variant="default" 
            className="flex items-center gap-1.5 font-medium bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-white cursor-pointer transition-all duration-300 py-1.5 pl-1.5 pr-2.5 shadow-sm hover:shadow group"
          >
            <span className="bg-white/20 p-1 rounded-full backdrop-blur-sm">
              <Crown className="h-3 w-3" />
            </span>
            <span className="group-hover:scale-105 transition-transform">Premium</span>
          </Badge>
        ) : isTrialing ? (
          <Badge 
            variant="outline" 
            className="flex items-center gap-1.5 font-medium border-amber-500/70 bg-amber-500/10 text-amber-600 dark:text-amber-400 cursor-pointer transition-all duration-300 hover:bg-amber-500/15 hover:border-amber-500 py-1.5 pl-1.5 pr-2.5 group"
          >
            <span className="bg-amber-500/20 p-1 rounded-full">
              <Clock className="h-3 w-3" />
            </span>
            <span className="group-hover:scale-105 transition-transform">Trial ({trialDaysLeft} days left)</span>
          </Badge>
        ) : (
          <Badge 
            variant="outline" 
            className="flex items-center gap-1.5 font-medium border-primary/30 hover:border-primary/60 cursor-pointer transition-all hover:bg-primary/5 py-1.5 pl-1.5 pr-2.5 group"
          >
            <span className="bg-primary/10 p-1 rounded-full">
              <Sparkles className="h-3 w-3" />
            </span>
            <span className="group-hover:scale-105 transition-transform">Free Plan</span>
          </Badge>
        )}
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-72" align="end">
        <div className="px-3 pt-3 pb-2">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Subscription
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Manage your subscription and premium features
          </p>
        </div>
        <DropdownMenuSeparator />
        
        <div className="px-3 py-3">
          <div className="mb-4 space-y-3">
            {isPremium && (
              <div className="bg-gradient-to-r from-amber-500/20 to-yellow-500/20 rounded-lg p-3 border border-amber-500/30">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold flex items-center gap-2">
                    <Crown className="h-4 w-4 text-amber-500" />
                    Premium Plan
                  </span>
                  <Badge className="bg-amber-500 text-white hover:bg-amber-600">Active</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1.5">
                  Enjoy all premium features with unlimited access
                </p>
              </div>
            )}
            
            {isTrialing && (
              <div className="rounded-lg border p-3 bg-gradient-to-r from-muted/30 to-muted/10">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold flex items-center gap-2">
                    <Clock className="h-4 w-4 text-amber-500" />
                    Trial Status
                  </span>
                  <Badge variant="outline" className="border-amber-500/50 text-amber-500">
                    {trialDaysLeft} days left
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1.5">
                  Your trial ends on {trialEndDate}
                </p>
                
                <div className="mt-3">
                  <div className="flex justify-between mb-1.5">
                    <span className="text-xs text-muted-foreground">Progress</span>
                    <span className="text-xs text-muted-foreground">{trialDaysLeft}/14 days</span>
                  </div>
                  <Progress value={(trialDaysLeft / 14) * 100} className="h-1.5" />
                </div>
              </div>
            )}
            
            <div className="rounded-lg border p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  Current Plan
                </span>
                <span className="text-sm font-medium text-primary">{subscription.plan}</span>
              </div>
              <div className="mt-2 grid gap-1">
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">Status</span>
                  <span className="text-xs capitalize">{subscription.status}</span>
                </div>
                
                {subscription.current_period_end && (
                  <div className="flex justify-between">
                    <span className="text-xs text-muted-foreground">Renews</span>
                    <span className="text-xs">
                      {new Date(subscription.current_period_end).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuGroup>
          {!isPremium && (
            <div className="px-3 py-2">
              <Button variant="default" className="w-full bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-white">
                <Crown className="mr-2 h-3.5 w-3.5" />
                Upgrade to Premium
              </Button>
            </div>
          )}
          
          <DropdownMenuItem className="cursor-pointer flex items-center px-3 py-2 focus:bg-muted/50">
            <ExternalLink className="mr-2 h-4 w-4" />
            <span className="flex-1">View All Plans</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 
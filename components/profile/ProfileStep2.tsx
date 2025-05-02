'use client';

import { Building, Home, Trophy, Medal } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ProfileFormValues } from './ProfileSetupDialog';
import { FormField } from '@/components/ui/form';

interface ProfileStep2Props {
  form: UseFormReturn<ProfileFormValues>;
  onNext: () => void;
  onPrev: () => void;
}

export function ProfileStep2({ form, onNext, onPrev }: ProfileStep2Props) {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <p className="text-sm font-medium">
          Select your account type
        </p>
        <FormField
          control={form.control}
          name="account_type"
          render={({ field }) => (
            <div className="grid grid-cols-1 gap-3">
              <AccountTypeCard 
                title="Keeper"
                description="Manage personal collection"
                icon={<Home className="h-7 w-7 mb-2 text-primary" />}
                selected={field.value === 'keeper'}
                onClick={() => field.onChange('keeper')}
              />
              
              <AccountTypeCard 
                title="Breeder"
                description="Track breeding projects and genetics"
                icon={<Trophy className="h-7 w-7 mb-2 text-primary" />}
                selected={field.value === 'breeder'}
                onClick={() => field.onChange('breeder')}
              />
              
              <AccountTypeCard 
                title="Facility"
                description="Manage multiple collections and teams"
                icon={<Building className="h-7 w-7 mb-2 text-primary" />}
                selected={field.value === 'facility'}
                onClick={() => field.onChange('facility')}
              />
            </div>
          )}
        />
      </div>
      
      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onPrev}
          className="flex-1 py-6 border-primary/20 hover:border-primary/40 font-medium text-base"
        >
          Back
        </Button>
        
        <Button 
          type="button" 
          className="flex-1 py-6 transition-all bg-primary hover:bg-primary/90 text-white font-medium text-base"
          onClick={onNext}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}

// Helper component for account type selection
function AccountTypeCard({ 
  title, 
  description, 
  icon, 
  selected, 
  onClick 
}: { 
  title: string; 
  description: string;
  icon: React.ReactNode; 
  selected: boolean; 
  onClick: () => void;
}) {
  return (
    <Card 
      className={cn(
        "cursor-pointer border-2 transition-all hover:shadow-md p-1",
        selected 
          ? "border-primary bg-primary/5" 
          : "border-border hover:border-primary/30"
      )}
      onClick={onClick}
    >
      <CardContent className="flex items-center p-4">
        <div className={cn(
          "flex items-center justify-center w-14 h-14 rounded-full mr-4",
          selected ? "bg-primary/10" : "bg-muted"
        )}>
          {icon}
        </div>
        <div className="flex-1">
          <div className="text-lg font-medium flex items-center">
            {title}
            {selected && <Medal className="h-4 w-4 ml-2 text-primary" />}
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
} 
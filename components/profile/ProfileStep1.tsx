'use client';

import { User, Turtle, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { UseFormReturn } from 'react-hook-form';
import { ProfileFormValues } from './ProfileSetupDialog';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

interface ProfileStep1Props {
  form: UseFormReturn<ProfileFormValues>;
  onNext: () => void;
}

export function ProfileStep1({ form, onNext }: ProfileStep1Props) {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="full_name"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel className="text-sm font-medium flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              Profile Name
            </FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder="Enter your name"
                className="w-full transition-all border-input/50 focus:border-primary/50 text-base py-6"
                autoFocus
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="collection_size"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel className="text-sm font-medium flex items-center gap-2">
              <Turtle className="h-4 w-4 text-primary" />
              Approximate Collection Size
            </FormLabel>
            <FormControl>
              <Input
                type="number"
                min="0"
                placeholder="Number of animals"
                className="w-full transition-all border-input/50 focus:border-primary/50 text-base py-6"
                value={field.value || ''}
                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
              />
            </FormControl>
            <p className="text-xs text-muted-foreground">
              This helps us personalize your experience
            </p>
          </FormItem>
        )}
      />
      
      <Button
        type="button"
        onClick={onNext}
        className="w-full mt-4 py-6 transition-all bg-primary hover:bg-primary/90 text-white font-medium text-base"
      >
        Continue
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
} 
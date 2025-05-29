'use client';

import { AccessProfileWithControls, CreateAccessProfile } from '@/lib/types/access';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Page } from '@/lib/types/pages';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  access_controls: z.array(z.object({
    page_id: z.string(),
    is_enabled: z.boolean(),
  })),
});

interface AccessProfileFormProps {
  profile?: AccessProfileWithControls | null;
  org_id: string | undefined;  
  onSubmit:  (data: CreateAccessProfile) => void;
  onCancel: () => void;
  pages: Page[];
}

export function AccessProfileForm({ profile, org_id, onSubmit, onCancel, pages }: AccessProfileFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: profile?.name || '',
      description: profile?.description || '',
      access_controls: pages.map(page => {
        const existingControl = profile?.access_controls?.find(control => control.page_id === page.id);
        return {
          page_id: page.id,
          is_enabled: existingControl ? (existingControl.can_view || existingControl.can_edit || existingControl.can_delete) : false,
        };
      }),
    },
  });


  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      
      const fullAccessControls = pages.map(page => {
        const control = values.access_controls.find(c => c.page_id === page.id);
        const isEnabled = control?.is_enabled || false;
        console.log(`Page ${page.name}: isEnabled = ${isEnabled}`);
        return {
          page_id: page.id,
          can_view: isEnabled,
          can_edit: isEnabled,
          can_delete: isEnabled,
        };
      });

      const submitData = {
        ...values,
        access_controls: fullAccessControls,
        org_id: org_id || profile?.org_id || '',
      };

       await onSubmit(submitData);
    } catch (error) {
      console.error('Error in form submission:', error);
    } finally {
      setIsSubmitting(false);
    }
  };


  


  return (
    <Form {...form}>
      <form 
        className="space-y-6"
        noValidate
        onSubmit={form.handleSubmit(handleSubmit)}
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter profile name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Enter profile description" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <FormLabel>Access Controls</FormLabel>
          <ScrollArea className="h-[300px] rounded-md border p-4">
            <div className="space-y-4">
              {pages.map((page) => (
                <div key={page.id} className="space-y-2">
                  <FormField
                    control={form.control}
                    name={`access_controls.${pages.findIndex(p => p.id === page.id)}.is_enabled`}
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-medium">{page.name}</FormLabel>
                      </FormItem>
                    )}
                  />
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        <div className="flex justify-end space-x-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {profile ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              profile ? 'Update Profile' : 'Create Profile'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
} 
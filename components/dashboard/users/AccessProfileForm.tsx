'use client';

import { AccessProfileWithControls, CreateAccessProfile } from '@/lib/types/access';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Page } from '@/app/api/users/access';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';

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
  onSubmit: (data: CreateAccessProfile) => void;
  onCancel: () => void;
  pages: Page[];
}

export function AccessProfileForm({ profile, org_id, onSubmit, onCancel, pages }: AccessProfileFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: profile?.name || '',
      description: profile?.description || '',
      access_controls: profile?.access_controls 
        ? profile.access_controls.map(control => ({
            page_id: control.page_id,
            is_enabled: control.can_view || control.can_edit || control.can_delete,
          }))
        : pages.map(page => ({
            page_id: page.id,
            is_enabled: false,
          })),
    },
  });

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    // Only include enabled pages in the access controls
    const fullAccessControls = values.access_controls
      .filter(control => control.is_enabled)
      .map(control => ({
        page_id: control.page_id,
        can_view: true,
        can_edit: true,
        can_delete: true,
      }));

    onSubmit({
      ...values,
      access_controls: fullAccessControls,
      org_id: org_id || profile?.org_id || '',
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
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
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {profile ? 'Update' : 'Create'} Profile
          </Button>
        </div>
      </form>
    </Form>
  );
} 
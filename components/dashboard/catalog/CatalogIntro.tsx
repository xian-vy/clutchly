'use client';

import React from 'react';

import { getCatalogSettings, updateCatalogSettings } from '@/app/api/catalog';
import { Button } from '@/components/ui/button';
import { Card, CardContent,  } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { CatalogSettings as CatalogSettingsType } from '@/lib/types/catalog';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Save } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const formSchema = z.object({
  bio: z.string().nullable(),
  show_bio: z.boolean(),
  layout_type: z.enum(['grid', 'list']),
});

type FormValues = z.infer<typeof formSchema>;

export function CatalogIntro() {
  const { data: settings, isLoading } = useQuery<CatalogSettingsType>({
    queryKey: ['catalog-settings'],
    queryFn: getCatalogSettings,
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bio: settings?.bio || null,
      show_bio: settings?.show_bio || false,
      layout_type: settings?.layout_type || 'grid',
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  // Update form when settings are loaded
  useEffect(() => {
    if (settings) {
      form.reset({
        bio: settings.bio,
        show_bio: settings.show_bio,
        layout_type: settings.layout_type,
      });
    }
  }, [form, settings]);

  async function onSubmit(values: FormValues) {
    try {
      await updateCatalogSettings(values);
      toast.success('Settings updated successfully');
    } catch (error) {
      console.error('Failed to update settings:', error);
      toast.error('Failed to update settings');
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center py-6">
          <Loader2 className="h-4 w-4 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className='p-0 border-0'>
     
      <CardContent className='px-0'>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bio / Introduction</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Tell visitors about your collection..."
                            {...field}
                            value={field.value || ''}
                            className='w-full min-h-[60px]'
                            maxLength={1000}
                          />
                        </FormControl>
                  
                      </FormItem>
                    )}
                  />

            
                  <Button size="sm" type="submit" disabled={isSubmitting} className='float-right'>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Save 
                      </>
                    )}
                  </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
} 
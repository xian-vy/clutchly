'use client';


import { updateCatalogSettings } from '@/app/api/catalog';
import { getProfile } from '@/app/api/profiles/profiles';
import { Button } from '@/components/ui/button';
import { Card, CardContent, } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { CatalogSettings } from '@/lib/types/catalog';
import { Profile } from '@/lib/types/profile';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, Pencil, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const formSchema = z.object({
  bio: z.string().nullable(),
  show_bio: z.boolean(),
  layout_type: z.enum(['grid', 'list']),
});

type FormValues = z.infer<typeof formSchema>;
interface Props {
  settings : CatalogSettings;
  isLoading : boolean;
}
export function CatalogIntro({settings,isLoading} : Props) {
  const [isEditing, setIsEditing] = useState(false);
  const queryClient = useQueryClient();

  const { data } = useQuery<Profile>({
    queryKey: ['profile2'],
    queryFn: getProfile,
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
      await queryClient.invalidateQueries({ queryKey: ['catalog-entries'] });
      toast.success('Settings updated successfully');
      setIsEditing(false);
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
  const profile = Array.isArray(data) ? data[0] : data;

  const handleCancel = () => {
    form.reset({
      bio: settings?.bio,
      show_bio: settings?.show_bio,
      layout_type: settings?.layout_type,
    });
    setIsEditing(false);
  };

  return (
    <div className="bg-muted/30 border-b px-4 py-12 flex flex-col items-center text-center gap-2 sm:gap-3 md:gap-4">
      <div className="">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight capitalize">{profile ? profile.full_name : "--"}&apos;s Collection</h1>
        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl">
          A curated showcase of exceptional reptile collections
        </p>
      </div>
      <Card className='p-0 border-0 w-full'>
        <CardContent className='px-0'>
          {!isEditing ? (
            <div className="flex items-center justify-center">
              <p className="text-center  ">{settings?.bio || 'Add your Bio/Intro here !'}</p>
              <Button
                variant="ghost"
                size="icon"
                className=""
                onClick={() => setIsEditing(true)}
              >
                <Pencil className="h-3 w-3 text-foreground/70" />
              </Button>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
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
                <div className="flex justify-end gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    type="button"
                    onClick={handleCancel}
                  >
                    Cancel
                  </Button>
                  <Button size="sm" type="submit" disabled={isSubmitting}>
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
                </div>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
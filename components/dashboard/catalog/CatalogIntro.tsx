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
import { Loader2, MapPin, Pencil, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { useTheme } from 'next-themes'
import Image from 'next/image';
import { CatalogIntroContact } from './CatalogIntroContact';
import { AboutSettingsDialog } from './CatalogIntroAbout';

const formSchema = z.object({
  bio: z.string().nullable(),
  show_bio: z.boolean(),
  layout_type: z.enum(['grid', 'list']),
  address: z.string().nullable(),
});

type FormValues = z.infer<typeof formSchema>;
interface Props {
  settings : CatalogSettings;
  isLoading : boolean;
}
export function CatalogIntro({settings,isLoading} : Props) {
  const [isEditing, setIsEditing] = useState(false);
  const queryClient = useQueryClient();
  const { theme } = useTheme()
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  const [isAboutDialogOpen, setIsAboutDialogOpen] = useState(false);

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
      address: settings?.address || null,
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
        address: settings.address,
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
    <div className="bg-muted/30 border-b px-4 py-6  flex flex-col items-start md:items-center text-center  gap-3 md:gap-4 ">

      <div className="flex justify-between items-center w-full">
            <div className="flex gap-1 sm:gap-2 items-center justify-center ">
              <Image 
                  src={theme === 'dark'? '/logo_dark.png' : '/logo_light.png'} 
                  width={35} 
                  height={35}   
                  alt="clutchly" 
                  className="rounded-full" 
                />
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight capitalize">{profile ? profile.full_name : "--"}</h1>
            </div>
            <div className="flex items-center gap-3 sm:gap-4">
                    <span onClick={() => setIsAboutDialogOpen(true)} className='text-sm cursor-pointer font-medium'>About</span>
                    <span onClick={() => setIsContactDialogOpen(true)} className='text-sm cursor-pointer font-medium'>Contact</span>
            </div>
        </div>
      <Card className='p-0 border-0 w-full  '>
        <CardContent className='flex flex-col items-start text-start gap-3 md:gap-4 px-0 bg-muted/30'>
          {!isEditing ? (
            <div className="flex items-start justify-center">
              <p className="text-start  text-sm md:text-base max-w-3xl">{settings?.bio || 'Add your Bio/Intro here !'}</p>
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
                          className='w-full min-h-[60px] mt-3'
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
          <div className="flex items-start justify-start gap-1 sm:gap-1.5  w-full">
        
            {!isEditing ? (
              <div className="flex items-start justify-start w-full">
                <div className="flex items-center gap-2 max-w-2xl">
                    <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                    <p className="text-start text-[0.8rem] md:text-sm">
                      {settings?.address || 'Add your address here!'}
                    </p>
                </div>
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
                <form onSubmit={form.handleSubmit(onSubmit)} className="w-full mt-3">
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormControl>
                          <Textarea
                            placeholder="Enter your address..."
                            {...field}
                            value={field.value || ''}
                            className='w-full min-h-[60px] '
                            maxLength={500}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end gap-2 mt-2">
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
           </div>

        </CardContent>
      </Card>

      <CatalogIntroContact
        open={isContactDialogOpen}
        onOpenChange={setIsContactDialogOpen}
        settings={settings}
      />

    <AboutSettingsDialog
      open={isAboutDialogOpen}
      onOpenChange={setIsAboutDialogOpen}
      settings={settings}
    />
    </div>
  );
}
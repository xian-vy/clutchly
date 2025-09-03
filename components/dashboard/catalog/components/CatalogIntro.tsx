'use client';
import { updateCatalogSettings } from '@/app/api/catalog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { CatalogSettings } from '@/lib/types/catalog';
import { zodResolver } from '@hookform/resolvers/zod';
import {  useQueryClient } from '@tanstack/react-query';
import { Loader2, Pencil, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { useTheme } from 'next-themes'
import Image from 'next/image';
import { CatalogIntroContact } from './CatalogIntroContact';
import { AboutSettingsDialog } from './CatalogIntroAbout';
import { cn, toTitleCase } from '@/lib/utils';
import { MinProfileInfo } from '@/lib/types/organizations';
import ShareURLDialog from './ShareURLDialog';
import { APP_NAME } from '@/lib/constants/app';
import { API_UPLOAD_LOGO } from '@/lib/constants/api';
import { CACHE_KEYS } from '@/lib/constants/cache_keys';

const formSchema = z.object({
  bio: z.string().nullable(),
  show_bio: z.boolean(),
  layout_type: z.enum(['grid', 'list']),
  address: z.string().nullable(),
});

type FormValues = z.infer<typeof formSchema>;
interface Props {
  settings : CatalogSettings | null;
  isLoading : boolean;
  isAdmin: boolean;
  organization : MinProfileInfo
}
export function CatalogIntro({settings,isLoading,isAdmin,organization} : Props) {
  const [isEditing, setIsEditing] = useState(false);
  const queryClient = useQueryClient();
  const { theme } = useTheme()
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  const [isAboutDialogOpen, setIsAboutDialogOpen] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [logoTimestamp, setLogoTimestamp] = useState(Date.now());
  const [openShareDialog, setOpenShareDialog] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bio: settings?.bio ?? '', 
      show_bio: settings?.show_bio || false,
      layout_type: settings?.layout_type || 'grid',
      address: settings?.address ?? '', 
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
      await queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.CATALOG_ENTRIES] });
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

  const handleCancel = () => {
    form.reset({
      bio: settings?.bio,
      show_bio: settings?.show_bio,
      layout_type: settings?.layout_type,
    });
    setIsEditing(false);
  };



  const handleLogoUpload = async (file: File) => {
    setLogoError(null);
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setLogoError('Only JPEG, PNG, and WebP images are allowed.');
      toast.error('Only JPEG, PNG, and WebP images are allowed.');
      return;
    }
    if (file.size > 300 * 1024) {
      setLogoError('Logo must be less than 300KB.');
      toast.error('Logo must be less than 300KB.');
      return;
    }
    setLogoUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch(API_UPLOAD_LOGO, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data?.imageUrl) {
        setLogoTimestamp(Date.now()); // Update timestamp when logo changes
        await queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.CATALOG_ENTRIES] });
        toast.success('Logo uploaded!');
      } else {
        setLogoError(data?.error || 'Failed to upload logo.');
        toast.error(data?.error || 'Failed to upload logo.');
      }
    } catch {
      setLogoError('Failed to upload logo.');
      toast.error('Failed to upload logo.');
    } finally {
      setLogoUploading(false);
      const fileInput = document.getElementById('logo-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    }
  };

  const getLogoUrl = (url: string | null | undefined) => {
    if (!url) return theme === 'dark' ? '/logo_dark.png' : '/logo_light.png';
    return `${url}?t=${logoTimestamp}`;
  };

  return (
    <div className={cn("bg-muted/30 border-b  py-6  flex flex-col items-start md:items-center text-center  gap-4 sm:gap-5 xl:gap-6",
      `${isAdmin ? 'px-4' : ' px-4 sm:px-6 lg:px-10 '}`
    )}>
      <div className={`flex justify-between items-center w-full`}>
        <div className="flex gap-1 sm:gap-2 items-center justify-center ">
          {isAdmin ? (
            <div className="relative group">
              <Image 
                src={getLogoUrl(organization?.logo)} 
                width={35} 
                height={35}   
                alt="organization logo" 
                className="rounded-full cursor-pointer" 
                onClick={() => document.getElementById('logo-upload')?.click()}
              />
              <div  onClick={() => document.getElementById('logo-upload')?.click()} className="absolute -bottom-2 -right-1 bg-background rounded-full p-1 border shadow-sm transition-opacity cursor-pointer">
                <Pencil className="h-3 w-3 text-foreground/70" />
              </div>
              <input
                type="file"
                id="logo-upload"
                className="hidden"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleLogoUpload(file);
                }}
              />
              {logoUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-full">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              )}
              {logoError && (
                <p className="absolute -bottom-6 left-0 text-xs text-destructive whitespace-nowrap">
                  {logoError}
                </p>
              )}
            </div>
          ) : (
            <Image 
              src={getLogoUrl(organization?.logo)} 
              width={35} 
              height={35}   
              alt="organization logo" 
              className="rounded-full" 
            />
          )}
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight capitalize">{organization ? organization.full_name : "--"}</h1>
            </div>
            <div className="flex items-center gap-4 sm:gap-5">
                    <span onClick={() => setIsAboutDialogOpen(true)} className='text-[0.8rem] md:text-sm cursor-pointer '>About</span>
                    <span onClick={() => setIsContactDialogOpen(true)} className='text-[0.8rem] md:text-sm cursor-pointer '>Contact</span>
                    <span onClick={() => setOpenShareDialog(true)} className='text-[0.8rem] md:text-sm cursor-pointer '>Share</span>
            </div>
        </div>
      <Card className='p-0 border-0 w-full  shadow-none'>
        <CardContent className='flex flex-col items-start text-start gap-3 md:gap-4 px-0 bg-muted/30'>
          {isAdmin ? (
            !isEditing ? (
              <div className="flex items-start justify-center">
                <p className={`text-start  text-sm md:text-base max-w-3xl ${settings?.bio ? 'text-foreground' : 'text-muted-foreground italic'}`}>{settings?.bio || 'Add your website introduction or bio here !'}</p>
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
            )
          ) : (
            <div className="flex items-start justify-center">
              <p className="text-start  text-sm md:text-base max-w-3xl">{settings?.bio ? toTitleCase(settings.bio) : 'Add your Bio/Intro here !'}</p>
            </div>
          )}
          <div className="flex items-start justify-start gap-1 sm:gap-1.5  w-full">
        
           </div>

        </CardContent>
      </Card>

      <CatalogIntroContact
        open={isContactDialogOpen}
        onOpenChange={setIsContactDialogOpen}
        settings={settings}
        isAdmin={isAdmin}
      />

    <AboutSettingsDialog
      open={isAboutDialogOpen}
      onOpenChange={setIsAboutDialogOpen}
      settings={settings}
      isAdmin={isAdmin}
    />

    <ShareURLDialog 
      orgName={organization?.full_name || APP_NAME} 
      open={openShareDialog} 
      onClose={() => setOpenShareDialog(false)} 
      />

    </div>
  );
}
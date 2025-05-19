import { APP_URL } from '@/lib/constants/app'
import { CatalogSettings } from '@/lib/types/catalog'
import { MapPin, Pencil } from 'lucide-react'
import { useTheme } from 'next-themes'
import Image from 'next/image'
import React, { useState } from 'react'
import { updateCatalogSettings } from '@/app/api/catalog'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { CatalogIntroContact } from './CatalogIntroContact'
import { AboutSettingsDialog } from './CatalogIntroAbout'

interface Props {
    profileName : string
    settings : CatalogSettings | null
    isAdmin: boolean
}

const formSchema = z.object({
  address: z.string().nullable(),
});

const CatalogFooter = ({profileName,settings, isAdmin} : Props) => {
    const { theme } = useTheme()
    const [isEditing, setIsEditing] = React.useState(false);
    const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  const [isAboutDialogOpen, setIsAboutDialogOpen] = useState(false);
    const queryClient = useQueryClient();
    const form = useForm({
      resolver: zodResolver(formSchema),
      defaultValues: {
        address: settings?.address || '',
      },
    });
    const isSubmitting = form.formState.isSubmitting;
    React.useEffect(() => {
      form.reset({ address: settings?.address || '' });
    }, [settings, form]);
    async function onSubmit(values: { address: string | null }) {
      try {
        await updateCatalogSettings({ ...settings, address: values.address });
        await queryClient.invalidateQueries({ queryKey: ['catalog-entries'] });
        toast.success('Address updated successfully');
        setIsEditing(false);
      } catch {
        toast.error('Failed to update address');
      }
    }
    const handleCancel = () => {
      form.reset({ address: settings?.address || '' });
      setIsEditing(false);
    };
return (
    <footer className="border-t pt-8 xl:pt-12 flex flex-col items-center w-full gap-4 xl:gap-5 bg-background/90">
      <div className="flex flex-col items-center gap-1 mb-3 lg:mb-5">
        <Image 
          src={theme === 'dark'? '/logo_dark.png' : '/logo_light.png'} 
          width={40} 
          height={40}   
          alt="clutchly" 
          className="rounded-full" 
        />
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight capitalize mt-1">{profileName}</h1>
      </div>
      <div className="w-full flex flex-col md:flex-row md:justify-center md:items-center gap-2 md:gap-6 text-sm text-foreground/90 px-4">
        {/* Address */}
        <div className="flex items-center gap-2 min-w-[120px] ">
          <MapPin className="h-4 w-4 text-primary/80" />
          {isAdmin ? (
            isEditing ? (
              <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-center gap-2 w-full">
                <Textarea
                  placeholder="Enter your address..."
                  {...form.register('address')}
                  value={form.watch('address') || ''}
                  className='min-h-[32px] w-full text-sm resize-none'
                  maxLength={500}
                  style={{paddingTop: 4, paddingBottom: 4}}
                />
                <Button size="sm" variant="outline" type="button" onClick={handleCancel}>Cancel</Button>
                <Button size="sm" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save'}
                </Button>
              </form>
            ) : (
              <>
                <span>{settings?.address || <span className="italic text-muted-foreground">Add your address here!</span>}</span>
                <Button variant="ghost" size="icon" className="ml-1" onClick={() => setIsEditing(true)}>
                  <Pencil className="h-4 w-4 text-foreground/70" />
                </Button>
              </>
            )
          ) : (
            <span>{settings?.address || ''}</span>
          )}
        </div>

      
      </div>
      <div className="flex items-center gap-3 md:gap-4 justify-center">
          <span onClick={() => setIsAboutDialogOpen(true)} className='text-sm cursor-pointer'>About</span>
          <span className='text-sm text-muted-foreground'>|</span>
          <span onClick={() => setIsContactDialogOpen(true)} className='text-sm cursor-pointer'>Contact</span>
        </div>
      {!isAdmin &&
      <div className="w-full flex flex-col justify-center items-center mt-6">
        <div className="flex flex-col justify-center items-center bg-primary w-full text-white dark:text-black min-h-[30px] px-2">
          <p className='text-[0.7rem] sm:text-sm lg:text-xs font-medium tracking-wide'>
            Made with <a href={APP_URL} className='font-semibold underline underline-offset-2' target='_blank'>Clutchly</a>
          </p>
        </div>
      </div>
      }
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
    </footer>
  )
}

export default CatalogFooter
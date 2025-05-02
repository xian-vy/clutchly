'use client';

import { useEffect, useState } from 'react';
import { useResource } from '@/lib/hooks/useResource';
import { ProfileFormData, Profile } from '@/lib/types/profile';
import { 
  getProfile, 
  createProfile, 
  updateProfile, 
  deleteProfile 
} from '@/app/api/profiles/profiles';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Form } from '@/components/ui/form';
import { toast } from 'sonner';
import { Sparkles } from 'lucide-react';
import { useSpeciesStore } from '@/lib/stores/speciesStore';
import { useMorphsStore } from '@/lib/stores/morphsStore';
import { ProfileStep1 } from './ProfileStep1';
import { ProfileStep2 } from './ProfileStep2';
import { ProfileStep3 } from './ProfileStep3';

// Validation schemas for each step
export const profileStep1Schema = z.object({
  full_name: z.string().min(6, "Please enter your name at least 6 characters"),
  collection_size: z.number().nullable().optional(),
});

export const profileStep2Schema = z.object({
  account_type: z.enum(['keeper', 'breeder', 'facility'], {
    required_error: "Please select an account type",
  }),
});

export const profileStep3Schema = z.object({
  selected_species: z.array(z.string()).min(1, "Please select at least one species"),
});

// Combined schema for the full form
export const profileFormSchema = profileStep1Schema
  .merge(profileStep2Schema)
  .merge(profileStep3Schema);

export type ProfileFormValues = z.infer<typeof profileFormSchema>;

// Adapter functions for useResource
async function getProfiles(): Promise<Profile[]> {
  try {
    const profile = await getProfile();
    return profile ? [profile] : [];
  } catch (error) {
    console.error('Error fetching profile:', error);
    return [];
  }
}

async function updateProfileWithId(id: string, data: ProfileFormData): Promise<Profile> {
  return updateProfile(data);
}

export function ProfileSetupDialog() {
  const [step, setStep] = useState(1);
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Load species using the species store
  const { fetchSpecies } = useSpeciesStore();
  
  // Access morphs store for later use
  const { downloadCommonMorphs } = useMorphsStore();
  
  const {
    resources: profiles,
    isLoading,
    handleCreate,
    handleUpdate,
    refetch
  } = useResource<Profile, ProfileFormData>({
    resourceName: 'Profile',
    queryKey: ['profile'],
    getResources: getProfiles,
    createResource: createProfile,
    updateResource: updateProfileWithId,
    deleteResource: deleteProfile,
  });

  const profile = profiles[0];
  const isProfileComplete = profile ? (!!profile.full_name && !!profile.account_type && (profile.selected_species && profile.selected_species.length > 0)) : false;
  
  // Initialize the form with react-hook-form and zod validation
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      full_name: '',
      account_type: 'keeper',
      collection_size: null,
      selected_species: []
    },
    mode: 'onChange'
  });

  // Fetch species on component mount
  useEffect(() => {
    fetchSpecies();
  }, [fetchSpecies]);

  // Set dialog state once profile data is loaded
  useEffect(() => {
    if (!isLoading) {
      // Force open dialog if profile is not complete
      setOpen(!isProfileComplete);
    }
  }, [isLoading, isProfileComplete]);

  // Update form data when profile changes
  useEffect(() => {
    if (profile) {
      form.reset({
        full_name: profile.full_name || '',
        account_type: profile.account_type || 'keeper',
        collection_size: profile.collection_size,
        selected_species: profile.selected_species || []
      });
    }
  }, [profile, form]);

  const handleNextStep = async () => {
    let canProceed = false;
    
    if (step === 1) {
      const step1Valid = await form.trigger(['full_name', 'collection_size']);
      canProceed = step1Valid;
    } else if (step === 2) {
      const step2Valid = await form.trigger(['account_type']);
      canProceed = step2Valid;
    }
    
    if (canProceed) {
      setStep(step + 1);
    }
  };

  const handlePrevStep = () => {
    setStep(step - 1);
  };

  const onSubmit = async (data: ProfileFormValues) => {
    setIsSubmitting(true);
    try {
      // Convert the form data to match ProfileFormData
      const profileData: ProfileFormData = {
        full_name: data.full_name,
        account_type: data.account_type,
        collection_size: data.collection_size || null,
        selected_species: data.selected_species
      };
      
      if (data.selected_species && data.selected_species.length > 0) {
        // Download morphs for the selected species
        await downloadCommonMorphs(data.selected_species);
      }
      
      if (profile) {
        await handleUpdate(profileData);
      } else {
        await handleCreate(profileData);
      }
      
      toast.success("Your profile has been successfully set up!");
      
      // Refresh profile data
      await refetch();
      
      // Only close the dialog if profile setup succeeded
      setTimeout(() => {
        if (data.full_name && data.account_type && data.selected_species && data.selected_species.length > 0) {
          setOpen(false);
        } else {
          toast.error("Profile setup failed. Please try again.");
        }
      }, 500);
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error("There was a problem updating your profile. Please try again.");
    } finally {
      setIsSubmitting(false);
      window.location.reload();
    }
  };

  // Don't render at all if loading
  if (isLoading) return null;

  // Don't allow dialog to be closed if profile is incomplete
  const allowClose = isProfileComplete;

  return (
    <Dialog open={open} onOpenChange={(newOpen) => allowClose && setOpen(newOpen)}>
      <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden bg-gradient-to-b from-background to-background/95 border-0 [&>button]:hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-background/0 pointer-events-none" />
        
        {/* Top accent banner with progress */}
        <div className="w-full h-1 bg-muted">
          <div 
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${step === 1 ? 33 : step === 2 ? 66 : 100}%` }}
          />
        </div>
        
        <DialogHeader className="p-6 pb-3">
          <DialogTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Welcome to Clutchly
            <Sparkles className="h-5 w-5 text-primary" />
          </DialogTitle>
          <DialogDescription className="text-center text-base opacity-90">
            {step === 1 ? "Let's personalize your experience" : 
             step === 2 ? "Choose your account type" :
             "What species do you have in your collection?"}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-6 pt-4">
            {step === 1 ? (
              <ProfileStep1 form={form} onNext={handleNextStep} />
            ) : step === 2 ? (
              <ProfileStep2 form={form} onNext={handleNextStep} onPrev={handlePrevStep} />
            ) : (
              <ProfileStep3 
                form={form} 
                onPrev={handlePrevStep} 
                isSubmitting={isSubmitting} 
              />
            )}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 
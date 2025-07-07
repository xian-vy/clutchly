'use client';

import { useEffect, useMemo, useState } from 'react';
import {  ProfileFormData } from '@/lib/types/organizations';
import { 
  createOrganization, 
} from '@/app/api/organizations/organizations';
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
import { useMorphsStore } from '@/lib/stores/morphsStore';
import { Step1 } from './Step1';
import { Step2 } from './Step2';
import { Step3 } from './Step3';
import { APP_NAME } from '@/lib/constants/app';
import { useAuthStore } from '@/lib/stores/authStore';
import useInitializeCommonData from '@/lib/hooks/useInitializeCommonData';

// Validation schemas for each step
export const profileStep1Schema = z.object({
  full_name: z.string().min(6, "Please enter your name at least 6 characters").max(25, "Name must be less than 30 characters"),
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

export function OrganizationSetupDialog() {
  const [step, setStep] = useState(1);
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { downloadCommonMorphs } = useMorphsStore();
  const { organization, isLoading , isLoggingOut } = useAuthStore();
  useInitializeCommonData()

  const isProfileComplete = useMemo(() => {
    return (
      organization &&
      organization.full_name &&
      organization.selected_species &&
      organization.selected_species.length > 0
    );
  }, [organization,]);
  
  
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


  useEffect(() => {
    if (isLoading || isLoggingOut) {
      setOpen(false);
      return;
    }

    setOpen(!isProfileComplete);
  }, [isLoading,isLoggingOut, isProfileComplete]);

  // Update form data when organization changes
  useEffect(() => {
    if (organization) {
      form.reset({
        full_name: organization.full_name || '',
        account_type: organization.account_type || 'keeper',
        collection_size: organization.collection_size,
        selected_species: organization.selected_species || []
      });
    }
  }, [organization, form]);

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
      
      const orgData: ProfileFormData = {
        full_name: data.full_name,
        account_type: data.account_type,
        collection_size: data.collection_size || null,
        selected_species: data.selected_species,
        logo : null
      };

      if (data.selected_species && data.selected_species.length > 0) {
        if (!organization) {
          toast.error("Something went wrong. Please refresh the page and try again.");
          return
        }
        await downloadCommonMorphs(organization,data.selected_species);
      }

      if (!isProfileComplete) {
        await createOrganization(orgData);
        console.log("Organization created successfully");
      }
      
      toast.success("Your organization has been successfully set up!");
      
      // Only close the dialog if organization setup succeeded
      setTimeout(() => {
        if (data.full_name && data.account_type && data.selected_species && data.selected_species.length > 0) {
          setOpen(false);
        } else {
          toast.error("Organization setup failed. Please try again.");
        }
      }, 500);

    } catch (error) {
      console.error("Organization update error:", error);
      if (error instanceof Error && error.message === 'An organization with this name already exists') {
        toast.error("This organization name is already taken. Please choose a different name.");
        form.setError('full_name', { 
          type: 'manual',
          message: 'This organization name is already taken'
        });
      } else {
        toast.error("There was a problem updating your organization. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
      if (!form.formState.errors.full_name) {
        window.location.reload();
      }
    }
  };

  if (isLoading || isLoggingOut ) return null;

  return (
    <Dialog 
      open={open} 
      onOpenChange={(newOpen) => {
        if (isLoggingOut) return;
        setOpen(newOpen);
      }}
    >
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
          <DialogTitle className="!text-xl md:!text-2xl font-bold text-center flex items-center justify-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Welcome to {APP_NAME}
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
              <Step1 form={form} onNext={handleNextStep} />
            ) : step === 2 ? (
              <Step2 form={form} onNext={handleNextStep} onPrev={handlePrevStep} />
            ) : (
              <Step3 
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
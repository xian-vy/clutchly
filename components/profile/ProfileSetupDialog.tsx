'use client';

import { useEffect, useState } from 'react';
import { useResource } from '@/lib/hooks/useResource';
import { ProfileType, ProfileFormData, Profile } from '@/lib/types/profile';
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
import { 
  Card, 
  CardContent 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2, User, Building, Home, Sparkles, Trophy, Medal, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const isProfileComplete = profile ? (!!profile.full_name && !!profile.account_type) : false;
  
  const [formData, setFormData] = useState<ProfileFormData>({
    full_name: '',
    account_type: 'keeper',
    collection_size: null
  });

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
      setFormData({
        full_name: profile.full_name || '',
        account_type: profile.account_type || 'keeper',
        collection_size: profile.collection_size
      });
    }
  }, [profile]);

  const handleNextStep = () => {
    if (step === 1 && !formData.full_name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    setStep(step + 1);
  };

  const handlePrevStep = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.full_name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    
    setIsSubmitting(true);
    try {
      console.log('Submitting profile data:', formData);
      
      if (profile) {
        await handleUpdate(formData);
      } else {
        await handleCreate(formData);
      }
      
      toast.success("Your profile has been successfully set up!");
      
      // Refresh profile data
      await refetch();
      
      // Only close the dialog if profile setup succeeded
      setTimeout(() => {
        if (formData.full_name && formData.account_type) {
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
    }
  };

  const selectAccountType = (type: ProfileType) => {
    setFormData({
      ...formData,
      account_type: type
    });
  };

  // Don't render at all if loading
  if (isLoading) return null;

  // Don't allow dialog to be closed if profile is incomplete
  const allowClose = isProfileComplete;

  return (
    <Dialog open={open} onOpenChange={(newOpen) => allowClose && setOpen(newOpen)}>
      <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden bg-gradient-to-b from-background to-background/95 border-2">
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-background/0 pointer-events-none" />
        
        {/* Top accent banner with progress */}
        <div className="w-full h-1 bg-muted">
          <div 
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${step === 1 ? 50 : 100}%` }}
          />
        </div>
        
        <DialogHeader className="p-6 pb-3">
          <DialogTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Welcome to HerpTrack
            <Sparkles className="h-5 w-5 text-primary" />
          </DialogTitle>
          <DialogDescription className="text-center text-base opacity-90">
            {step === 1 ? 
              "Let's personalize your experience" : 
              "Choose your account type"
            }
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 p-6 pt-4">
          {step === 1 ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="full_name" className="block text-sm font-medium flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  Your Name
                </label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="Enter your name"
                  required
                  className="w-full transition-all border-input/50 focus:border-primary/50 text-base py-6"
                  autoFocus
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="collection_size" className="block text-sm font-medium flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Approximate Collection Size
                </label>
                <Input
                  id="collection_size"
                  type="number"
                  min="0"
                  value={formData.collection_size || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    collection_size: e.target.value ? parseInt(e.target.value) : null 
                  })}
                  placeholder="Number of animals"
                  className="w-full transition-all border-input/50 focus:border-primary/50 text-base py-6"
                />
                <p className="text-xs text-muted-foreground">
                  This helps us personalize your experience
                </p>
              </div>
              
              <Button
                type="button"
                onClick={handleNextStep}
                className="w-full mt-4 py-6 transition-all bg-primary hover:bg-primary/90 text-white font-medium text-base"
              >
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-3">
                <p className="text-sm font-medium">
                  Select your account type
                </p>
                <div className="grid grid-cols-1 gap-3">
                  <AccountTypeCard 
                    title="Keeper"
                    description="Manage personal collection"
                    icon={<Home className="h-7 w-7 mb-2 text-primary" />}
                    selected={formData.account_type === 'keeper'}
                    onClick={() => selectAccountType('keeper')}
                  />
                  
                  <AccountTypeCard 
                    title="Breeder"
                    description="Track breeding projects and genetics"
                    icon={<Trophy className="h-7 w-7 mb-2 text-primary" />}
                    selected={formData.account_type === 'breeder'}
                    onClick={() => selectAccountType('breeder')}
                  />
                  
                  <AccountTypeCard 
                    title="Facility"
                    description="Manage multiple collections and teams"
                    icon={<Building className="h-7 w-7 mb-2 text-primary" />}
                    selected={formData.account_type === 'facility'}
                    onClick={() => selectAccountType('facility')}
                  />
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevStep}
                  className="flex-1 py-6 border-primary/20 hover:border-primary/40 font-medium text-base"
                >
                  Back
                </Button>
                
                <Button 
                  type="submit" 
                  className="flex-1 py-6 transition-all bg-primary hover:bg-primary/90 text-white font-medium text-base"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Setting up...
                    </>
                  ) : (
                    'Complete Setup'
                  )}
                </Button>
              </div>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Helper component for account type selection
function AccountTypeCard({ 
  title, 
  description, 
  icon, 
  selected, 
  onClick 
}: { 
  title: string; 
  description: string;
  icon: React.ReactNode; 
  selected: boolean; 
  onClick: () => void;
}) {
  return (
    <Card 
      className={cn(
        "cursor-pointer border-2 transition-all hover:shadow-md p-1",
        selected 
          ? "border-primary bg-primary/5" 
          : "border-border hover:border-primary/30"
      )}
      onClick={onClick}
    >
      <CardContent className="flex items-center p-4">
        <div className={cn(
          "flex items-center justify-center w-14 h-14 rounded-full mr-4",
          selected ? "bg-primary/10" : "bg-muted"
        )}>
          {icon}
        </div>
        <div className="flex-1">
          <div className="text-lg font-medium flex items-center">
            {title}
            {selected && <Medal className="h-4 w-4 ml-2 text-primary" />}
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
} 
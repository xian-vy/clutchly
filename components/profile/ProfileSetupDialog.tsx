'use client';

import { useEffect, useState } from 'react';
import { useProfile } from '@/lib/hooks/useProfile';
import { ProfileType, ProfileFormData } from '@/lib/types/profile';
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
import { Loader2, User, Building, Home, Sparkles } from 'lucide-react';

export function ProfileSetupDialog() {
  const { profile, isLoading, updateProfile, isUpdating, isProfileComplete, refetch } = useProfile();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>({
    full_name: '',
    account_type: 'keeper',
    collection_size: null
  });

  // Set dialog state once profile data is loaded
  useEffect(() => {
    if (!isLoading) {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.full_name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    
    try {
      await updateProfile({
        full_name: formData.full_name.trim(),
        account_type: formData.account_type,
        collection_size: formData.collection_size
      });
      
      toast.success("Your profile has been successfully set up!");
      
      // Wait a moment before closing and refetching to ensure DB has updated
      setTimeout(() => {
        setOpen(false);
        refetch();
      }, 500);
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error("There was a problem updating your profile. Please try again.");
    }
  };

  const selectAccountType = (type: ProfileType) => {
    setFormData({
      ...formData,
      account_type: type
    });
  };

  if (isLoading) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-gradient-to-b from-background to-background/95 border-2">
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-background/0 pointer-events-none" />
        
        {/* Top accent banner */}
        <div className="w-full h-2 bg-primary" />
        
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Welcome to HerpTrack
            <Sparkles className="h-5 w-5 text-primary" />
          </DialogTitle>
          <DialogDescription className="text-center text-base opacity-90">
            Let's customize your experience with a few quick details.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 p-6 pt-4">
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
              className="w-full transition-all border-input/50 focus:border-primary/50"
            />
          </div>
          
          <div className="space-y-3">
            <label className="block text-sm font-medium">
              Account Type
            </label>
            <div className="grid grid-cols-3 gap-3">
              <AccountTypeCard 
                title="Keeper"
                description="Manage personal collection"
                icon={<Home className="h-6 w-6 mb-2 text-primary" />}
                selected={formData.account_type === 'keeper'}
                onClick={() => selectAccountType('keeper')}
              />
              
              <AccountTypeCard 
                title="Breeder"
                description="Track breeding projects"
                icon={<User className="h-6 w-6 mb-2 text-primary" />}
                selected={formData.account_type === 'breeder'}
                onClick={() => selectAccountType('breeder')}
              />
              
              <AccountTypeCard 
                title="Facility"
                description="Manage multiple collections"
                icon={<Building className="h-6 w-6 mb-2 text-primary" />}
                selected={formData.account_type === 'facility'}
                onClick={() => selectAccountType('facility')}
              />
            </div>
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
              className="w-full transition-all border-input/50 focus:border-primary/50"
            />
            <p className="text-xs text-muted-foreground">
              This helps us personalize your experience
            </p>
          </div>
          
          <Button 
            type="submit" 
            className="w-full py-2.5 transition-all bg-primary hover:bg-primary/90 text-white"
            disabled={isUpdating || !formData.full_name}
          >
            {isUpdating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Setting up your profile...
              </>
            ) : (
              'Complete Setup'
            )}
          </Button>
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
      className={`cursor-pointer border-2 transition-all hover:shadow-md ${
        selected 
          ? 'border-primary bg-primary/5' 
          : 'border-border hover:border-primary/30'
      }`}
      onClick={onClick}
    >
      <CardContent className="flex flex-col items-center justify-center p-4 text-center">
        {icon}
        <span className="text-sm font-medium">{title}</span>
        <span className="text-xs text-muted-foreground mt-1">{description}</span>
      </CardContent>
    </Card>
  );
} 
import { Organization } from '@/lib/types/organizations';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { useState } from 'react';
import { Loader2, Pencil } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { API_UPLOAD_LOGO } from '@/lib/constants/api';

interface ProfileDisplayProps {
  organization: Organization | undefined;
  isAdmin?: boolean;
}

export const ProfileDisplay = ({ organization, isAdmin = false }: ProfileDisplayProps) => {
  const { theme } = useTheme();
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [logoTimestamp, setLogoTimestamp] = useState(Date.now());
  const queryClient = useQueryClient();

  if (!organization) return null;

  const getLogoUrl = (url: string | null | undefined) => {
    if (!url) return theme === 'dark' ? '/logo_dark.png' : '/logo_light.png';
    return `${url}?t=${logoTimestamp}`;
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
        setLogoTimestamp(Date.now());
        await queryClient.invalidateQueries({ queryKey: ['organization2'] });
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
      const fileInput = document.getElementById('profile-logo-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    }
  };

  return (
    <div className="bg-card rounded-lg p-3 ">
      <h2 className="text-base xl:text-lg font-semibold mb-4">Organization Information</h2>
      <div className="flex items-start space-x-4">
        <div className="relative">
          {isAdmin ? (
            <div className="relative group">
              <div className="relative w-10 h-10 rounded-full overflow-hidden">
                <Image
                  src={getLogoUrl(organization.logo)}
                  alt={organization.full_name || 'Organization logo'}
                  fill
                  className="object-cover cursor-pointer"
                  onClick={() => document.getElementById('profile-logo-upload')?.click()}
                />
              </div>
              <div 
                onClick={() => document.getElementById('profile-logo-upload')?.click()} 
                className="absolute -bottom-2 -right-1 bg-background rounded-full p-1 border shadow-sm transition-opacity cursor-pointer"
              >
                <Pencil className="h-3 w-3 text-foreground/70" />
              </div>
              <input
                type="file"
                id="profile-logo-upload"
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
            <div className="relative w-10 h-10 rounded-full overflow-hidden">
              <Image
                src={getLogoUrl(organization.logo)}
                alt={organization.full_name || 'Organization logo'}
                fill
                className="object-cover"
              />
            </div>
          )}
        </div>
        <div className="flex-1">
          <div className="space-y-2">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Name</label>
              <p className="text-sm">{organization.full_name || 'Not set'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <p className="text-sm">{organization.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Account Type</label>
              <p className="text-sm capitalize">{organization.account_type}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 
import { Profile } from '@/lib/types/profile';
import Image from 'next/image';

interface ProfileDisplayProps {
  profile: Profile | undefined;
}

export const ProfileDisplay = ({ profile }: ProfileDisplayProps) => {
  if (!profile) return null;

  return (
    <div className="bg-card rounded-lg p-3 ">
      <h2 className="text-base xl:text-lg font-semibold mb-4">Profile Information</h2>
      <div className="flex items-start space-x-4">
        {profile.logo && (
          <div className="relative w-16 h-16 rounded-full overflow-hidden">
            <Image
              src={profile.logo}
              alt={profile.full_name || 'Profile logo'}
              fill
              className="object-cover"
            />
          </div>
        )}
        <div className="flex-1">
          <div className="space-y-2">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Name</label>
              <p className="text-sm xl:text-base">{profile.full_name || 'Not set'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <p className="text-sm xl:text-base">{profile.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Account Type</label>
              <p className="text-sm xl:text-base capitalize">{profile.account_type}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 
import { Organization } from '@/lib/types/organizations';
import Image from 'next/image';

interface ProfileDisplayProps {
  organization: Organization | undefined;
}

export const ProfileDisplay = ({ organization }: ProfileDisplayProps) => {
  if (!organization) return null;

  return (
    <div className="bg-card rounded-lg p-3 ">
      <h2 className="text-base xl:text-lg font-semibold mb-4">Organization Information</h2>
      <div className="flex items-start space-x-4">
        {organization.logo && (
          <div className="relative w-16 h-16 rounded-full overflow-hidden">
            <Image
              src={organization.logo}
              alt={organization.full_name || 'Organization logo'}
              fill
              className="object-cover"
            />
          </div>
        )}
        <div className="flex-1">
          <div className="space-y-2">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Name</label>
              <p className="text-sm xl:text-base">{organization.full_name || 'Not set'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <p className="text-sm xl:text-base">{organization.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Account Type</label>
              <p className="text-sm xl:text-base capitalize">{organization.account_type}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 
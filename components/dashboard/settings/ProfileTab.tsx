'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getOrganization } from '@/app/api/organizations/organizations';
import { getCatalogSettings, updateCatalogSettings } from '@/app/api/catalog';
import { Organization } from '@/lib/types/organizations';
import { CatalogSettings, NewCatalogSettings } from '@/lib/types/catalog';
import { ProfileDisplay } from './components/ProfileDisplay';
import { CatalogSettingsDisplay } from './components/CatalogSettingsDisplay';
import { CatalogSettingsForm, CatalogSettingsFormValues } from './components/CatalogSettingsForm';
import { Loader2 } from 'lucide-react';

export const ProfileTab = () => {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  // Get organization data
  const { data: organization, isLoading: isProfileLoading } = useQuery<Organization>({
    queryKey: ['organization2'],
    queryFn: async () => {
      const data = await getOrganization();
      return Array.isArray(data) ? data[0] : data;
    },
  });

  // Get catalog settings
  const { data: settings, isLoading: isSettingsLoading } = useQuery<CatalogSettings>({
    queryKey: ['catalogSettings'],
    queryFn: async () => {
      const data = await getCatalogSettings();
      return Array.isArray(data) ? data[0] : data;
    },
  });

  // Update catalog settings mutation
  const { mutateAsync: updateSettings } = useMutation({
    mutationFn: async (data: CatalogSettingsFormValues) => {
      if (!settings) throw new Error('No settings found to update');
      
      const updateData: NewCatalogSettings = {
        user_id: settings.user_id,
        bio: data.bio,
        contacts: data.contacts,
        address: data.address,
        about: data.about,
        show_bio: settings.show_bio,
        layout_type: settings.layout_type,
      };

      return updateCatalogSettings(updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalogSettings'] });
    },
  });

  const handleEdit = () => setIsEditing(true);
  const handleCancel = () => setIsEditing(false);

  const handleSubmit = async (data: CatalogSettingsFormValues) => {
    try {
      await updateSettings(data);
      setIsEditing(false);
      toast.success('Catalog settings updated successfully');
    } catch (error) {
      console.error('Error updating catalog settings:', error);
      toast.error('Failed to update catalog settings');
    }
  };

  if (isProfileLoading || isSettingsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-2 md:space-y-3 xl:space-y-5">
      <ProfileDisplay organization={organization} />
      {isEditing ? (
        <CatalogSettingsForm
          settings={settings}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      ) : (
        <CatalogSettingsDisplay
          settings={settings}
          onEdit={handleEdit}
        />
      )}
    </div>
  );
};

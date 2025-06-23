import { CatalogSettings } from '@/lib/types/catalog';
import { Button } from '@/components/ui/button';
import { Edit2, ExternalLink } from 'lucide-react';
import { toTitleCase } from '@/lib/utils';

interface CatalogSettingsDisplayProps {
  settings: CatalogSettings | undefined;
  onEdit: () => void;
}

export const CatalogSettingsDisplay = ({ settings, onEdit }: CatalogSettingsDisplayProps) => {
  const isValidUrl = (str: string) => {
    try {
      new URL(str);
      return true;
    } catch {
      return false;
    }
  };

  if (!settings) return null;

  return (
    <div className="bg-card rounded-lg p-3 ">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base xl:text-lg font-semibold">Website Settings</h2>
        <Button variant="outline" size="sm" onClick={onEdit}>
          <Edit2 className="w-4 h-4 mr-2" />
          Edit 
        </Button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-muted-foreground">Bio/Intro</label>
          <p className="mt-1 text-sm">{settings.bio || 'Not set'}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground">Contacts</label>
          <div className="mt-1 space-y-2">
            {settings.contacts && settings.contacts.length > 0 ? (
              settings.contacts.map((contact, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <span className="font-medium capitalize text-sm">{contact.type}:</span>
                  <span className="text-sm">{contact.link}</span>
                  {isValidUrl(contact.link) && (
                    <a
                      href={contact.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center hover:text-primary"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
              ))
            ) : (
              <p>Not set</p>
            )}
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground">Address</label>
          <p className="mt-1 text-sm">
            {settings.address ? toTitleCase(settings.address) : 'Not set'}
          </p>
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground">About</label>
          <p className="mt-1 text-sm">{settings.about || 'Not set'}</p>
        </div>
      </div>
    </div>
  );
}; 
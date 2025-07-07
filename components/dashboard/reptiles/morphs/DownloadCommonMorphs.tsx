'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useSpeciesStore } from '@/lib/stores/speciesStore';
import { useMorphsStore } from '@/lib/stores/morphsStore';
import { Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuthStore } from '@/lib/stores/authStore';

interface DownloadCommonDataProps {
  showInMorphsTab?: boolean;
}

export function DownloadCommonMorphs({ showInMorphsTab = false }: DownloadCommonDataProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSpecies, setSelectedSpecies] = useState<string[]>([]);
  const downloadCommonSpecies = useSpeciesStore(state => state.downloadCommonSpecies);
  const downloadCommonMorphs = useMorphsStore(state => state.downloadCommonMorphs);
  const species = useSpeciesStore(state => state.species);
  const fetchSpecies = useSpeciesStore(state => state.fetchSpecies);
  const {organization} = useAuthStore()
  
  // Only render in morphs tab if showInMorphsTab is true
  if (showInMorphsTab === false) {
    return null;
  }
  
  const handleDownload = async () => {
    try {
      if (!organization) return;
      setIsLoading(true);
      setIsDialogOpen(true);
      // Fetch global species first to show in selection
      await fetchSpecies(organization);
    } catch (error) {
      console.error('Error fetching species:', error);
      toast.error('Failed to fetch species');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmDownload = async () => {
    try {
      if (!organization) return;

      setIsLoading(true);
      
      // Download selected species
      await downloadCommonSpecies(selectedSpecies);
      
      // Download morphs for selected species
      await downloadCommonMorphs(organization,selectedSpecies);
      
      toast.success('Common data downloaded successfully');
      setIsDialogOpen(false);
      setSelectedSpecies([]);
    } catch (error) {
      console.error('Error downloading common data:', error);
      toast.error('Failed to download common data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsDialogOpen(false);
    setSelectedSpecies([]);
    setIsLoading(false);
  };

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="default"
              size="sm"
              onClick={handleDownload} 
              disabled={isLoading}
            >
              Download
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              ) : (
                <Download className="h-4 w-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Download common species & morphs</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        if (!open) {
          handleCancel();
        }
      }}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogTitle>Select Species to Download</DialogTitle>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Select the species you want to download. Their associated morphs will be downloaded automatically.
            </p>
            <ScrollArea className="h-[300px] rounded-md border p-4">
              <div className="space-y-4">
                {species.map((s) => (
                  <div key={s.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={s.id.toString()}
                      checked={selectedSpecies.includes(s.id.toString())}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedSpecies([...selectedSpecies, s.id.toString()]);
                        } else {
                          setSelectedSpecies(selectedSpecies.filter(id => id !== s.id.toString()));
                        }
                      }}
                    />
                    <Label htmlFor={s.id.toString()}>{s.name}</Label>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmDownload}
                disabled={selectedSpecies.length === 0 || isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                ) : (
                  'Download Selected'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
} 
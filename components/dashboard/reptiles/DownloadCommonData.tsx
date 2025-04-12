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

interface DownloadCommonDataProps {
  showInMorphsTab?: boolean;
}

export function DownloadCommonData({ showInMorphsTab = false }: DownloadCommonDataProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSpecies, setSelectedSpecies] = useState<string[]>([]);
  const downloadCommonSpecies = useSpeciesStore(state => state.downloadCommonSpecies);
  const downloadCommonMorphs = useMorphsStore(state => state.downloadCommonMorphs);
  const species = useSpeciesStore(state => state.species);
  const fetchSpecies = useSpeciesStore(state => state.fetchSpecies);
  
  // Only render in morphs tab if showInMorphsTab is true
  if (showInMorphsTab === false) {
    return null;
  }
  
  const handleDownload = async () => {
    try {
      setIsLoading(true);
      setIsDialogOpen(true);
      // Fetch global species first to show in selection
      await fetchSpecies();
    } catch (error) {
      console.error('Error fetching species:', error);
      toast.error('Failed to fetch species');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmDownload = async () => {
    try {
      setIsLoading(true);
      
      // Download selected species
      await downloadCommonSpecies(selectedSpecies);
      
      // Download morphs for selected species
      await downloadCommonMorphs(selectedSpecies);
      
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
              variant="outline"
              size="sm"
              onClick={handleDownload} 
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
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
                      id={s.id}
                      checked={selectedSpecies.includes(s.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedSpecies([...selectedSpecies, s.id]);
                        } else {
                          setSelectedSpecies(selectedSpecies.filter(id => id !== s.id));
                        }
                      }}
                    />
                    <Label htmlFor={s.id}>{s.name}</Label>
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
                  <Loader2 className="h-4 w-4 animate-spin" />
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
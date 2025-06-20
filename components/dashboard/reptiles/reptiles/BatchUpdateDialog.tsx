import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { EnrichedReptile } from './ReptileList';
import { updateReptile } from '@/app/api/reptiles/reptiles';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import * as Select from '@/components/ui/select';
import { Sex, HetTrait, NewReptile } from '@/lib/types/reptile';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { VisualTraitsForm } from './VisualTraitsForm';
import { HetTraitsForm } from './HetTraitsForm';
import { useReptilesParentsBySpecies } from '@/lib/hooks/useReptilesParentsBySpecies';

interface BatchUpdateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reptiles: EnrichedReptile[];
  allReptiles: EnrichedReptile[];
  onSuccess: () => void;
}

type BatchReptileFields = {
  sex: Sex;
  dam_id: string | null;
  sire_id: string | null;
  acquisition_date: string;
  hatch_date: string | null;
  original_breeder: string | null;
  visual_traits: string[] | null;
  het_traits: HetTrait[] | null;
};

// Add this type for field toggles
type BatchFieldToggles = {
  [K in keyof BatchReptileFields]: boolean;
};

export function BatchUpdateDialog({ open, onOpenChange, reptiles, allReptiles, onSuccess }: BatchUpdateDialogProps) {

  const initialFields: BatchFieldToggles = {
    sex: false,
    dam_id: false,
    sire_id: false,
    acquisition_date: false,
    hatch_date: false,
    original_breeder: false,
    visual_traits: false,
    het_traits: false,
  };
  const initialValues: BatchReptileFields = {
    sex: 'unknown',
    dam_id: null,
    sire_id: null,
    acquisition_date: '',
    hatch_date: null,
    original_breeder: null,
    visual_traits: null,
    het_traits: null,
  };

  const [fields, setFields] = useState<BatchFieldToggles>(initialFields);
  const [values, setValues] = useState<BatchReptileFields>(initialValues);
  const [loading, setLoading] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('fields');

  // Determine if all selected reptiles are the same species
  const speciesIds = Array.from(new Set(reptiles.map(r => r.species_id?.toString())));
  const uniqueSpeciesId = speciesIds.length === 1 ? speciesIds[0] : null;
  const isSingleSpecies = !!uniqueSpeciesId;

  // Get parent options using useReptilesParentsBySpecies
  const { maleReptiles, femaleReptiles } = useReptilesParentsBySpecies({
    reptiles: allReptiles,
    speciesId: uniqueSpeciesId || '',
  });

  // useSelectList for parent selects
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { useSelectList } = require('@/lib/hooks/useSelectList');
  const { Select: SireSelect } = useSelectList({
    data: maleReptiles,
    getValue: (r: any) => r.id.toString(),
    getLabel: (r: any) => r.name,
    disabled: !fields.sire_id || !isSingleSpecies,
  });
  const { Select: DamSelect } = useSelectList({
    data: femaleReptiles,
    getValue: (r: any) => r.id.toString(),
    getLabel: (r: any) => r.name,
    disabled: !fields.dam_id || !isSingleSpecies,
  });

  // Update handler signatures to use correct types
  const handleFieldToggle = (field: keyof BatchFieldToggles) => {
    setFields(f => ({ ...f, [field]: !f[field] }));
  };

  const handleValueChange = <K extends keyof BatchReptileFields>(field: K, value: BatchReptileFields[K]) => {
    setValues(v => ({ ...v, [field]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    const updates: Partial<NewReptile> = {};
    (Object.keys(fields) as (keyof BatchReptileFields)[]).forEach(field => {
      if (fields[field]) {
        if (field === 'visual_traits') {
          updates.visual_traits = values.visual_traits;
        } else if (field === 'het_traits') {
          updates.het_traits = values.het_traits;
        } else {
          // @ts-expect-error: TypeScript can't infer this is safe
          updates[field] = values[field];
        }
      }
    });
    if (Object.keys(updates).length === 0) {
      toast.error('No fields selected for update.');
      setLoading(false);
      return;
    }
    try {
      await Promise.all(
        reptiles.map(r => updateReptile(r.id, updates))
      );
      toast.success('Batch update successful!');
      onSuccess();
    } catch (e) {
      console.error(e)
      toast.error('Batch update failed.');
    } finally {
      setLoading(false);
    }
  };

  // Reset fields and values every time dialog is opened
  useEffect(() => {
    if (open) {
      setFields(initialFields);
      setValues(initialValues);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl lg:max-w-screen-sm">
        <DialogTitle className='text-lg md:text-xl'>Edit Selected Reptiles</DialogTitle>
        <div className="space-y-6 py-2">
          {/* Info Alert */}
          <Alert variant="info" className="mb-4 xl:mb-6">
            <Info className="h-4 w-4 mr-2" />
            <AlertTitle>How to use</AlertTitle>
            <AlertDescription>
              Select which fields you want to update for all selected reptiles by checking the boxes. Only checked fields will be changed.
            </AlertDescription>
          </Alert>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="fields">Fields</TabsTrigger>
              <TabsTrigger value="visual_traits">Visual Traits</TabsTrigger>
              <TabsTrigger value="het_traits">Het Traits</TabsTrigger>
            </TabsList>

            <TabsContent value="fields">
              <div className='grid grid-cols-2 gap-3 sm:gap-4'> 
                {/* Dam/Sire warning */}
                {!isSingleSpecies  && (
                  <div className="col-span-2 text-red-400 text-xs font-semibold mt-2">
                    Dam/Sire can only be updated when all selected reptiles are the same species.
                  </div>
                )}
                {/* Dam */}
                <div className="flex items-start gap-3">
                  <Checkbox id="batch-dam" checked={fields.dam_id} onCheckedChange={() => handleFieldToggle('dam_id')} className="mt-2" disabled={!isSingleSpecies} />
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="batch-dam" className="min-w-[80px] text-[0.65rem] md:text-[0.8rem]">Dam (Mother)</Label>
                    <DamSelect
                      value={values.dam_id || ''}
                      onValueChange={(v: string) => handleValueChange('dam_id', v)}
                      placeholder={isSingleSpecies ? "Select Dam" : "Select single species"}
                      disabled={!fields.dam_id || !isSingleSpecies}
                    />
                  </div>
                </div>
                {/* Sire */}
                <div className="flex items-start gap-3">
                  <Checkbox id="batch-sire" checked={fields.sire_id} onCheckedChange={() => handleFieldToggle('sire_id')} className="mt-2" disabled={!isSingleSpecies} />
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="batch-sire" className="min-w-[80px] text-[0.65rem] md:text-[0.8rem]">Sire (Father)</Label>
                    <SireSelect
                      value={values.sire_id || ''}
                      onValueChange={(v: string) => handleValueChange('sire_id', v)}
                      placeholder={isSingleSpecies ? "Select Sire" : "Select single species"}
                      disabled={!fields.sire_id || !isSingleSpecies}
                    />
                  </div>
                </div>              
                  {/* Sex */}
                <div className="flex items-start gap-3">
                  <Checkbox id="batch-sex" checked={fields.sex} onCheckedChange={() => handleFieldToggle('sex')} className="mt-2" />
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="batch-sex" className="min-w-[80px] text-[0.65rem] md:text-[0.8rem]">Sex</Label>
                    <Select.Select value={values.sex} onValueChange={v => handleValueChange('sex', v as Sex)} disabled={!fields.sex}>
                      <Select.SelectTrigger className="w-32" disabled={!fields.sex}>
                        <Select.SelectValue placeholder="Select sex" />
                      </Select.SelectTrigger>
                      <Select.SelectContent>
                        <Select.SelectItem value="male">Male</Select.SelectItem>
                        <Select.SelectItem value="female">Female</Select.SelectItem>
                        <Select.SelectItem value="unknown">Unknown</Select.SelectItem>
                      </Select.SelectContent>
                    </Select.Select>
                  </div>
                </div>
                  {/* Original Breeder */}
                  <div className="flex items-start gap-3">
                  <Checkbox id="batch-breeder" checked={fields.original_breeder} onCheckedChange={() => handleFieldToggle('original_breeder')} className="mt-2" />
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="batch-breeder" className="min-w-[80px] text-[0.65rem] md:text-[0.8rem]">Original Breeder</Label>
                    <Input
                      disabled={!fields.original_breeder}
                      value={values.original_breeder || ''}
                      onChange={e => handleValueChange('original_breeder', e.target.value)}
                      className="w-40"
                      placeholder="Original Breeder"
                    />
                  </div>
                </div> 
                {/* Acquisition Date */}
                <div className="flex items-start gap-3">
                  <Checkbox id="batch-acq" checked={fields.acquisition_date} onCheckedChange={() => handleFieldToggle('acquisition_date')} className="mt-2" />
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="batch-acq" className="min-w-[80px] text-[0.65rem] md:text-[0.8rem]">Acquisition Date</Label>
                    <Input
                      disabled={!fields.acquisition_date}
                      type="date"
                      value={values.acquisition_date}
                      onChange={e => handleValueChange('acquisition_date', e.target.value)}
                      className="w-40"
                    />
                  </div>
                </div>
                {/* Hatch Date */}
                <div className="flex items-start gap-3">
                  <Checkbox id="batch-hatch" checked={fields.hatch_date} onCheckedChange={() => handleFieldToggle('hatch_date')} className="mt-2" />
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="batch-hatch" className="min-w-[80px] text-[0.65rem] md:text-[0.8rem]">Hatch Date</Label>
                    <Input
                      disabled={!fields.hatch_date}
                      type="date"
                      value={values.hatch_date || ''}
                      onChange={e => handleValueChange('hatch_date', e.target.value as string | null)}
                      className="w-40"
                    />
                  </div>
                </div>
              
              </div>
            </TabsContent>

            <TabsContent value="visual_traits">
              <div className="mb-2 flex items-center justify-end w-full gap-2">
                <Checkbox id="batch-visual" checked={fields.visual_traits} onCheckedChange={() => handleFieldToggle('visual_traits')} />
                <Label htmlFor="batch-visual" >Update Visual Traits</Label>
              </div>
              <div className={fields.visual_traits ? '' : 'opacity-50 pointer-events-none'}>
                <VisualTraitsForm
                  initialTraits={values.visual_traits || []}
                  onChange={traits => handleValueChange('visual_traits', traits.length > 0 ? traits : null)}
                />
              </div>
            </TabsContent>

            <TabsContent value="het_traits">
              <div className="mb-2 flex items-center justify-end w-full gap-2">
                <Checkbox id="batch-het" checked={fields.het_traits} onCheckedChange={() => handleFieldToggle('het_traits')} />
                <Label htmlFor="batch-het">Update Het Traits </Label>
              </div>
              <div className={fields.het_traits ? '' : 'opacity-50 pointer-events-none'}>
                <HetTraitsForm
                  initialTraits={values.het_traits || []}
                  onChange={traits => handleValueChange('het_traits', traits.length > 0 ? traits : null)}
                />
              </div>
            </TabsContent>
          </Tabs>

          {/* Actions */}
          <div className="flex justify-between  mt-4">
            {/* Selected Reptiles Summary with Popover */}
              <div>
                <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="link" className="p-0 h-auto min-h-0 text-primary underline underline-offset-2 font-mono text-xs justify-end w-full cursor-pointer">
                      {reptiles.length} selected
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 max-h-56 overflow-y-auto" align="start" side='top'>
                    <div className="font-semibold text-xs mb-2">Selected Reptiles ({reptiles.length})</div>
                    <ul className="grid grid-cols-2 divide-y divide-muted-foreground/10">
                      {reptiles.map(r => (
                        <li key={r.id} className="py-1 flex flex-col gap-0.5">
                          <span className="font-mono text-xs text-primary-foreground bg-primary/70 rounded px-1 py-0.5 w-fit">{r.reptile_code || '—'}</span>
                          <span className="font-medium text-xs">{r.name || 'Unnamed'}</span>
                          <span className="text-muted-foreground text-xs">{r.species_name} &middot; {r.morph_name}</span>
                        </li>
                      ))}
                    </ul>
                  </PopoverContent>
                </Popover>
              </div>

              <div className='flex gap-2 items-center'>
                  <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
                  <Button variant="default" onClick={handleSubmit} disabled={loading}>
                    {loading ? 'Updating...' : 'Update'}
                  </Button>
              </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 
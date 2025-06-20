import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
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

interface BatchUpdateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reptiles: EnrichedReptile[];
  onSuccess: () => void;
}

export function BatchUpdateDialog({ open, onOpenChange, reptiles, onSuccess }: BatchUpdateDialogProps) {
  // Field enable toggles
  const [fields, setFields] = useState({
    sex: false,
    dam_id: false,
    sire_id: false,
    acquisition_date: false,
    hatch_date: false,
    original_breeder: false,
    visual_traits: false,
    het_traits: false,
  });
  // Field values
  const [values, setValues] = useState({
    sex: 'unknown',
    dam_id: '',
    sire_id: '',
    acquisition_date: '',
    hatch_date: '',
    original_breeder: '',
    visual_traits: '' as string | string[],
    het_traits: '' as string | string[],
  });
  const [loading, setLoading] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const handleFieldToggle = (field: keyof typeof fields) => {
    setFields(f => ({ ...f, [field]: !f[field] }));
  };

  const handleValueChange = (field: keyof typeof values, value: any) => {
    setValues(v => ({ ...v, [field]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    const updates: any = {};
    Object.keys(fields).forEach(field => {
      if (fields[field as keyof typeof fields]) {
        updates[field] = values[field as keyof typeof values];
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
      toast.error('Batch update failed.');
    } finally {
      setLoading(false);
    }
  };

  // Helper for underlined codes
  const codeList = reptiles.slice(0, 10).map(r => r.reptile_code || '—').join(', ');

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

          {/* Fields to Update Section */}
          <div>
            <div  className='grid grid-cols-2 gap-3 sm:gap-4'>
              {/* Sex */}
              <div className="flex items-start gap-3">
                <Checkbox id="batch-sex" checked={fields.sex} onCheckedChange={() => handleFieldToggle('sex')} className="mt-2" />
                <div className="flex flex-col gap-1">
                  <Label htmlFor="batch-sex" className="min-w-[80px] text-[0.65rem] md:text-[0.8rem]">Sex</Label>
                  <Select.Select value={values.sex} onValueChange={v => handleValueChange('sex', v)} disabled={!fields.sex}>
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
              {/* Dam */}
              <div className="flex items-start gap-3">
                <Checkbox id="batch-dam" checked={fields.dam_id} onCheckedChange={() => handleFieldToggle('dam_id')} className="mt-2" />
                <div className="flex flex-col gap-1">
                  <Label htmlFor="batch-dam" className="min-w-[80px] text-[0.65rem] md:text-[0.8rem]">Dam (Mother)</Label>
                  <Input
                    disabled={!fields.dam_id}
                    value={values.dam_id}
                    onChange={e => handleValueChange('dam_id', e.target.value)}
                    className="w-40"
                    placeholder="Dam ID"
                  />
                </div>
              </div>
              {/* Sire */}
              <div className="flex items-start gap-3">
                <Checkbox id="batch-sire" checked={fields.sire_id} onCheckedChange={() => handleFieldToggle('sire_id')} className="mt-2" />
                <div className="flex flex-col gap-1">
                  <Label htmlFor="batch-sire" className="min-w-[80px] text-[0.65rem] md:text-[0.8rem]">Sire (Father)</Label>
                  <Input
                    disabled={!fields.sire_id}
                    value={values.sire_id}
                    onChange={e => handleValueChange('sire_id', e.target.value)}
                    className="w-40"
                    placeholder="Sire ID"
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
                    value={values.hatch_date}
                    onChange={e => handleValueChange('hatch_date', e.target.value)}
                    className="w-40"
                  />
                </div>
              </div>
              {/* Original Breeder */}
              <div className="flex items-start gap-3">
                <Checkbox id="batch-breeder" checked={fields.original_breeder} onCheckedChange={() => handleFieldToggle('original_breeder')} className="mt-2" />
                <div className="flex flex-col gap-1">
                  <Label htmlFor="batch-breeder" className="min-w-[80px] text-[0.65rem] md:text-[0.8rem]">Original Breeder</Label>
                  <Input
                    disabled={!fields.original_breeder}
                    value={values.original_breeder}
                    onChange={e => handleValueChange('original_breeder', e.target.value)}
                    className="w-40"
                    placeholder="Original Breeder"
                  />
                </div>
              </div>
              {/* Visual Traits */}
              <div className="flex items-start gap-3">
                <Checkbox id="batch-visual" checked={fields.visual_traits} onCheckedChange={() => handleFieldToggle('visual_traits')} className="mt-2" />
                <div className="flex flex-col gap-1">
                  <Label htmlFor="batch-visual" className="min-w-[80px] text-[0.65rem] md:text-[0.8rem]">Visual Traits</Label>
                  <Input
                    disabled={!fields.visual_traits}
                    value={typeof values.visual_traits === 'string' ? values.visual_traits : (values.visual_traits || []).join(', ')}
                    onChange={e => handleValueChange('visual_traits', e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean))}
                    className="w-40"
                    placeholder="Trait1, Trait2"
                  />
                </div>
              </div>
              {/* Het Traits */}
              <div className="flex items-start gap-3">
                <Checkbox id="batch-het" checked={fields.het_traits} onCheckedChange={() => handleFieldToggle('het_traits')} className="mt-2" />
                <div className="flex flex-col gap-1">
                  <Label htmlFor="batch-het" className="min-w-[80px] text-[0.65rem] md:text-[0.8rem]">Het Traits</Label>
                  <Input
                    disabled={!fields.het_traits}
                    value={typeof values.het_traits === 'string' ? values.het_traits : (values.het_traits || []).join(', ')}
                    onChange={e => handleValueChange('het_traits', e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean))}
                    className="w-40"
                    placeholder="Trait1, Trait2"
                  />
                </div>
              </div>
            </div>
          </div>

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
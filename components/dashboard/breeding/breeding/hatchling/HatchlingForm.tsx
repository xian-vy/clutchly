'use client';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useMorphsStore } from '@/lib/stores/morphsStore';
import { useSpeciesStore } from '@/lib/stores/speciesStore';
import { BreedingProject, Clutch } from '@/lib/types/breeding';
import { NewReptile, Reptile, Sex } from '@/lib/types/reptile';
import { generateReptileCode, getSpeciesCode } from '@/components/dashboard/reptiles/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { Info } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import { useState } from 'react'
import { VisualTraitsForm } from "@/components/dashboard/reptiles/reptiles/VisualTraitsForm";
import { HetTraitsForm } from "@/components/dashboard/reptiles/reptiles/HetTraitsForm";
import { getReptiles } from '@/app/api/reptiles/reptiles';
import { useResource } from '@/lib/hooks/useResource';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  reptile_code: z.string().nullable(),
  morph_id: z.string().min(1, 'Morph is required'),
  sex: z.enum(['male', 'female', 'unknown']),
  weight: z.coerce.number().min(0, 'Weight must be positive'),
  length: z.coerce.number().min(0, 'Length must be positive'),
  notes: z.string().nullable(),
});

interface HatchlingFormProps {
  clutch: Clutch;
  projectDetails : BreedingProject
  onSubmit: (data: NewReptile) => Promise<void>;
  onCancel: () => void;
}

export function HatchlingForm({
  clutch,
  projectDetails,
  onSubmit,
  onCancel,
}: HatchlingFormProps) {

  const { getMorphsBySpecies } = useMorphsStore()
  const { species, fetchSpecies } = useSpeciesStore()
  const morphsForSpecies = getMorphsBySpecies(clutch.species_id.toString())
  
  // Fetch existing reptiles for sequence number generation
  const { 
    resources: reptiles, 
    isLoading: isReptilesLoading 
  } = useResource<Reptile, NewReptile>({
    resourceName: 'Reptile',
    queryKey: ['reptiles'],
    getResources: getReptiles,
    createResource: async () => { throw new Error('Not implemented'); },
    updateResource: async () => { throw new Error('Not implemented'); },
    deleteResource: async () => { throw new Error('Not implemented'); },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      reptile_code: null,
      morph_id: '',
      sex: 'unknown',
      notes: '',
      weight: 0,
      length: 0,
    },
  });

  const [visualTraits, setVisualTraits] = useState<string[]>( []);
  const [hetTraits, setHetTraits] = useState<Array<{
    trait: string;
    percentage: number;
    source?: 'visual_parent' | 'genetic_test' | 'breeding_odds';
    verified?: boolean;
  }>>([]);

  // Get values from form for code generation
  const morphId = form.watch('morph_id');
  const sex = form.watch('sex');
  
  // Fetch species if not already loaded
  useEffect(() => {
    if (species.length === 0) {
      fetchSpecies()
    }
  }, [species.length, fetchSpecies])
  
  // Auto-select first morph if available
  useEffect(() => {
    if (morphsForSpecies.length > 0 && !form.getValues('morph_id')) {
      form.setValue('morph_id', morphsForSpecies[0].id.toString());
    }
  }, [morphsForSpecies, form]);

  // Generate reptile code when fields change
  useEffect(() => {
    if (!morphId || isReptilesLoading) return;
    
    // Find the selected morph
    const selectedMorph = morphsForSpecies.find(m => m.id.toString() === morphId);
    
    if (selectedMorph) {
      // Find species info from the species store
      const speciesInfo = species.find(s => s.id.toString() === clutch.species_id.toString());
      
      if (speciesInfo) {
        // Generate the code
        const speciesCode = getSpeciesCode(speciesInfo.name);
        const today = new Date().toISOString().split('T')[0]; // Use today as hatch date
        
        // Add a timestamp to sequence to avoid duplication in concurrent sessions
        const uniqueReptiles = [
          ...(reptiles || []),
          { id: 'temp_' + Date.now().toString() } as unknown as Reptile // Add a temporary reptile to bump the sequence
        ];
        
        const generatedCode = generateReptileCode(
          uniqueReptiles,
          speciesCode,
          selectedMorph.name,
          today,
          sex as Sex
        );
        
        form.setValue('reptile_code', generatedCode);
      }
    }
  }, [morphId, sex, form, reptiles, morphsForSpecies, clutch.species_id, species, isReptilesLoading]);

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const today = new Date().toISOString().split('T')[0]

      const hatchlingData: NewReptile = {
        ...values,
        parent_clutch_id: clutch.id,
        species_id: clutch.species_id,
        hatch_date: today,
        acquisition_date: today,
        generation: 1,
        dam_id: projectDetails.male_id,
        sire_id: projectDetails.female_id,
        status: 'active',
        het_traits: hetTraits,
        notes: values.notes || '',
        visual_traits: visualTraits,
      };
      await onSubmit(hatchlingData);
    } catch (error) {
      console.error('Error submitting hatchling:', error);
    }
  };

  return (
    <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Adding a hatchling will add a new reptile record to your collection.
              </AlertDescription>
         </Alert>
        <Tabs defaultValue="basic">
          <TabsList>
            <TabsTrigger value="basic">Basic Information</TabsTrigger>
            <TabsTrigger value="visual-traits">Visual Traits</TabsTrigger>
            <TabsTrigger value="het-traits">Het Traits</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-3 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="reptile_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Code <span className='text-[0.55rem] md:text-[0.6arem]'>(SEQ_SP_MORPH_HATCHYEAR_GENDER)</span></FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ''} readOnly />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <FormField
                      control={form.control}
                      name="morph_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Morph</FormLabel>
                          <Select onValueChange={(value) => {
                            field.onChange(value)
                          }} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className='w-full'>
                                <SelectValue placeholder="Select Morph" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {morphsForSpecies.map((s) => (
                                <SelectItem key={s.id} value={s.id.toString()}>
                                  {s.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                  <FormField
                    control={form.control}
                    name="sex"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sex</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className='w-full'>
                              <SelectValue placeholder="Select sex" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="unknown">Unknown</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                      control={form.control}
                      name="weight"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Weight (g)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.1" min="0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="length"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Length (cm)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.1" min="0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter any additional notes..."
                          {...field} value={field.value || ''} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
        </TabsContent>

          <TabsContent value="visual-traits" className="mt-4">
            <Card className="p-4 shadow-none">
              <VisualTraitsForm 
                initialTraits={visualTraits} 
                onChange={setVisualTraits} 
              />
            </Card>
          </TabsContent>
          
          <TabsContent value="het-traits" className="mt-4">
            <Card className="p-4 shadow-none">
              <HetTraitsForm 
                initialTraits={hetTraits} 
                onChange={setHetTraits} 
              />
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Add Hatchling</Button>
        </div>
      </form>
    </Form>
  );
}
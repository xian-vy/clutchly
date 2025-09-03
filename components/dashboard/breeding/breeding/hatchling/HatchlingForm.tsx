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
import { generateReptileCode, generateReptileName, getSpeciesCode } from '@/components/dashboard/reptiles/utils';
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
import { useQuery } from "@tanstack/react-query";
import {toast} from 'sonner';
import { getSubscriptionLimitClient } from "@/app/api/utils_client";
import { useAuthStore } from "@/lib/stores/authStore";
import { CACHE_KEYS } from '@/lib/constants/cache_keys';


const formSchema = z.object({
  quantity: z.coerce.number().min(1, 'Must create at least 1 hatchling').max(50, 'Maximum 50 hatchlings at once'),
  name: z.string().optional(),
  reptile_code: z.string().nullable(),
  morph_id: z.string().min(1, 'Morph is required'),
  sex: z.enum(['male', 'female', 'unknown']),
  weight: z.coerce.number().min(0, 'Weight must be positive'),
  length: z.coerce.number().min(0, 'Length must be positive'),
  notes: z.string().nullable(),
  original_breeder: z.string().nullable()
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
  const {organization} = useAuthStore();

  const morphsForSpecies = getMorphsBySpecies(clutch.species_id.toString())
  const { data: reptiles, isLoading : reptilesLoading } = useQuery<Reptile[]>({
    queryKey: [CACHE_KEYS.REPTILES],
    queryFn: async () => {
  if (!organization) return [];
   return getReptiles(organization) 
}
  })
  const { data: reptileLimit, isLoading : limitLoading } = useQuery({
    queryKey: [CACHE_KEYS.LIMIT],
    queryFn: getSubscriptionLimitClient
  })

  const userProfile = Array.isArray(organization) ? organization[0] : organization;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      quantity: 1,
      name: '',
      reptile_code: null,
      morph_id: '',
      sex: 'unknown',
      notes: '',
      weight: 0,
      length: 0,
      original_breeder : userProfile?.full_name || ''
    },
  });
  const isSubmitting = form.formState.isSubmitting;

  const [visualTraits, setVisualTraits] = useState<string[]>( []);
  const [hetTraits, setHetTraits] = useState<Array<{
    trait: string;
    percentage: number;
    source?: 'visual_parent' | 'genetic_test' | 'breeding_odds';
    verified?: boolean;
  }>>([]);
  const [isNameManuallyEdited, setIsNameManuallyEdited] = useState(false);

  // Get values from form for code generation
  const morphId = form.watch('morph_id');
  const sex = form.watch('sex');
  const hatchling_count = form.watch('quantity') || 1; 

  // Fetch species if not already loaded
  useEffect(() => {
    if (species.length !== 0) return
    if (!organization) return;
      fetchSpecies(organization)
  
  }, [species.length, fetchSpecies, organization])
  
  // Auto-select first morph if available
  useEffect(() => {
    if (morphsForSpecies.length > 0 && !form.getValues('morph_id')) {
      form.setValue('morph_id', morphsForSpecies[0].id.toString());
    }
  }, [morphsForSpecies, form]);

  // Generate reptile code when fields change
  useEffect(() => {
    if (!morphId || reptilesLoading || limitLoading) return;
    
    // Don't auto-generate if user has manually edited the name
    if (isNameManuallyEdited) return;
    
    // Find the selected morph
    const selectedMorph = morphsForSpecies.find(m => m.id.toString() === morphId);
    
    if (selectedMorph) {
      // Find species info from the species store
      const speciesInfo = species.find(s => s.id.toString() === clutch.species_id.toString());
      
      if (speciesInfo) {
        // Generate the code
        const speciesCode = getSpeciesCode(speciesInfo.name);
        const today = new Date().toISOString().split('T')[0]; // Use today as hatch date
        
        
        const generatedCode = generateReptileCode(
          reptiles || [],
          speciesCode,
          selectedMorph.name,
          today,
          sex as Sex
        );
        
        form.setValue('reptile_code', generatedCode);
        
        // Generate name based on morph and traits
        const sequenceNumber = generatedCode.split('-')[0];
        const generatedName = generateReptileName(
          selectedMorph.name,
          hetTraits,
          sequenceNumber
        );
        
        form.setValue('name', generatedName);
      }
    }
  }, [morphId, sex, form, reptiles, morphsForSpecies, clutch.species_id, species, reptilesLoading, limitLoading, hetTraits, isNameManuallyEdited]);

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const today = new Date().toISOString().split('T')[0];

      if (!reptiles) {
        toast.error('Reptiles data is not available. Please reload page then try again later.');
        return;
      }

      if (Number(reptiles.length) + Number(hatchling_count) >= reptileLimit) {
        toast.error(`You have reached your reptile limit of ${reptileLimit}. Please upgrade your plan to add more reptiles.`);
        return;
      }

      //check for duplicate name (only if manual name is provided)
      if (values.name?.trim()) {
        const duplicate = reptiles?.find(r => r.name.toLowerCase().trim() === values.name?.toLowerCase().trim());
        if (duplicate) {
          toast.error('A reptile with that name already exists!');
          return;
        }
      }
      
      // Get morph and species info for code generation
      const selectedMorph = morphsForSpecies.find(m => m.id.toString() === morphId);
      const speciesInfo = species.find(s => s.id.toString() === clutch.species_id.toString());
      
      // Create array of promises for multiple hatchlings
      const baseReptiles = [...(reptiles || [])];

      for (let index = 0; index < values.quantity; index++) {
        // Destructure quantity out and keep the rest
        const { quantity, ...hatchlingValues } = values;
        console.log(quantity)
        let uniqueCode = '';
        if (selectedMorph && speciesInfo) {
          const speciesCode = getSpeciesCode(speciesInfo.name);
          uniqueCode = generateReptileCode(
            baseReptiles,
            speciesCode,
            selectedMorph.name,
            today,
            values.sex as Sex
          );
        }

        // Use the sequence number from the unique code for the name
        const sequenceNumber = uniqueCode.split('-')[0];
        const hatchlingName = generateReptileName(
          selectedMorph?.name || '',
          hetTraits,
          sequenceNumber
        );

        // Add the new reptile to baseReptiles so the next code and name are unique
        baseReptiles.push({ id: `temp_${Date.now()}_${index}`, name: hatchlingName, reptile_code: uniqueCode } as Reptile);

        const hatchlingData: NewReptile = {
          ...hatchlingValues,
          reptile_code: uniqueCode,
          name: hatchlingName,
          parent_clutch_id: clutch.id,
          species_id: clutch.species_id,
          hatch_date: today,
          acquisition_date: today,
          generation: 1,
          dam_id: projectDetails.female_id,
          sire_id: projectDetails.male_id,
          status: 'active',
          het_traits: hetTraits,
          notes: values.notes || '',
          visual_traits: visualTraits,
          price :  0,
        };
        await onSubmit(hatchlingData);
      }
    } catch (error) {
      console.error('Error submitting hatchlings:', error);
    } 
  };

  return (
    <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            You can add multiple hatchlings at once if they share similar traits. Each hatchling will be added as a separate reptile record to your collection.
          </AlertDescription>
        </Alert>
        <Tabs defaultValue="basic">
          <TabsList>
            <TabsTrigger value="basic">Info</TabsTrigger>
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
                      <div className="flex gap-2">
                        <Input 
                          {...field} 
                          placeholder="Auto-generated based on morph and traits"
                          onChange={(e) => {
                            field.onChange(e);
                            setIsNameManuallyEdited(true);
                          }}
                        />
                        {isNameManuallyEdited && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setIsNameManuallyEdited(false);
                              // Trigger name regeneration
                              const selectedMorph = morphsForSpecies.find(m => m.id.toString() === morphId);
                              if (selectedMorph) {
                                const reptileCode = form.getValues('reptile_code');
                                const sequenceNumber = reptileCode ? reptileCode.split('-')[0] : '';
                                const generatedName = generateReptileName(
                                  selectedMorph.name,
                                  hetTraits,
                                  sequenceNumber
                                );
                                form.setValue('name', generatedName);
                              }
                            }}
                          >
                            Auto
                          </Button>
                        )}
                      </div>
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
              <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Hatchlings</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" max="50" {...field} />
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
          <Button disabled={isSubmitting} type="submit">{
           isSubmitting ? 'Creating...' : `Create ${form.watch('quantity') || 1} Hatchling${form.watch('quantity') !== 1 ? 's' : ''}`
           } 
          </Button>
        </div>
      </form>
    </Form>
  );
}
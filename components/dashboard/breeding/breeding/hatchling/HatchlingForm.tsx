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
import { BreedingProject, Clutch } from '@/lib/types/breeding';
import { NewReptile } from '@/lib/types/reptile';
import { zodResolver } from '@hookform/resolvers/zod';
import { Info } from 'lucide-react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import { useState } from 'react'
import { VisualTraitsForm } from "@/components/dashboard/reptiles/reptiles/VisualTraitsForm";
import { HetTraitsForm } from "@/components/dashboard/reptiles/reptiles/HetTraitsForm";

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
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
  const morphsForSpecies = getMorphsBySpecies(clutch.species_id.toString())
  

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
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
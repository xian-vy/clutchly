'use client';

import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandInput, CommandItem, CommandGroup } from '@/components/ui/command';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useHealthStore } from '@/lib/stores/healthStore';
import { cn } from '@/lib/utils';
import { Check, ChevronRight, ChevronsUpDown } from 'lucide-react';
import { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { type FormValues } from './HealthLogForm';


interface HealthCategorySelectProps {
    form: UseFormReturn<FormValues>;
    className?: string;
  }

export function HealthCategorySelect({ form, className }: HealthCategorySelectProps) {
  const [open, setOpen] = useState(false);
  const [isCustomType, setIsCustomType] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  
  const { 
    categories, 
    getSubcategoriesByCategory,
    getTypesBySubcategory,
  } = useHealthStore();

  const selectedCategoryId = form.watch('category_id');
  const selectedSubcategoryId = form.watch('subcategory_id');
  const selectedTypeId = form.watch('type_id');

  const toggleCategory = (categoryId: string) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  const getSelectedLabel = () => {
    if (isCustomType) return form.watch('custom_type_label') || 'Select health event...';
    if (selectedTypeId) {
      const category = categories.find(c => c.id === selectedCategoryId);
      const subcategory = getSubcategoriesByCategory(selectedCategoryId).find(s => s.id === selectedSubcategoryId);
      const type = getTypesBySubcategory(selectedSubcategoryId).find(t => t.id === selectedTypeId);
      return `${category?.label} > ${subcategory?.label} > ${type?.label}`;
    }
    return 'Select health event...';
  };

  const handleSelect = (type: 'category' | 'subcategory' | 'type' | 'custom', id: string) => {
    switch (type) {
      case 'category':
        form.setValue('category_id', id);
        form.setValue('subcategory_id', '');
        form.setValue('type_id', null);
        form.setValue('custom_type_label', '');
        setIsCustomType(false);
        toggleCategory(id);
        break;
      case 'subcategory':
        form.setValue('subcategory_id', id);
        form.setValue('type_id', null);
        form.setValue('custom_type_label', '');
        setIsCustomType(false);
        break;
      case 'type':
        form.setValue('type_id', id);
        form.setValue('custom_type_label', '');
        setIsCustomType(false);
        setOpen(false);
        break;
      case 'custom':
        setIsCustomType(true);
        form.setValue('type_id', null);
        setOpen(false);
        break;
    }
  };

  return (
    <div className={className}>
      <FormField
        control={form.control}
        name="category_id"
        render={() => (
          <FormItem className="flex flex-col">
            <FormLabel>Health Event</FormLabel>
            <Popover modal={true} open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                  >
                    {getSelectedLabel()}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent  className="w-[400px] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search health events..." />
                  <CommandEmpty>No health event found.</CommandEmpty>
                  <ScrollArea className="h-[300px]">
                    <CommandGroup>
                      {categories.map((category) => (
                        <div key={category.id}>
                          <CommandItem
                            value={category.label}
                            onSelect={() => handleSelect('category', category.id)}
                            className="flex items-center"
                          >
                            <ChevronRight
                              className={cn(
                                "mr-2 h-4 w-4 transition-transform",
                                expandedCategory === category.id && "rotate-90"
                              )}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleCategory(category.id);
                              }}
                            />
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedCategoryId === category.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {category.label}
                          </CommandItem>

                          {expandedCategory === category.id && (
                            <div className="ml-6">
                              {getSubcategoriesByCategory(category.id).map((subcategory) => (
                                <div key={subcategory.id}>
                                  <CommandItem
                                    value={subcategory.label}
                                    onSelect={() => handleSelect('subcategory', subcategory.id)}
                                    className="flex items-center"
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        selectedSubcategoryId === subcategory.id ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    {subcategory.label}
                                  </CommandItem>

                                  {selectedSubcategoryId === subcategory.id && (
                                    <div className="ml-6">
                                      {getTypesBySubcategory(subcategory.id).map((type) => (
                                        <CommandItem
                                          key={type.id}
                                          value={type.label}
                                          onSelect={() => handleSelect('type', type.id)}
                                          className="flex items-center"
                                        >
                                          <Check
                                            className={cn(
                                              "mr-2 h-4 w-4",
                                              selectedTypeId === type.id ? "opacity-100" : "opacity-0"
                                            )}
                                          />
                                          {type.label}
                                        </CommandItem>
                                      ))}
                                      <CommandItem
                                        value="Custom Type"
                                        onSelect={() => handleSelect('custom', 'custom')}
                                        className="flex items-center"
                                      >
                                        <Check
                                          className={cn(
                                            "mr-2 h-4 w-4",
                                            isCustomType ? "opacity-100" : "opacity-0"
                                          )}
                                        />
                                        Custom Type
                                      </CommandItem>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </CommandGroup>
                  </ScrollArea>
                </Command>
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />
      
      {isCustomType && (
        <FormField
          control={form.control}
          name="custom_type_label"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Custom Type Label</FormLabel>
              <FormControl>
                <Input {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  );
}
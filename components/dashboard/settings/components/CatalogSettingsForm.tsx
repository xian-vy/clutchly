import { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CatalogSettings } from '@/lib/types/catalog';
import { Plus, Save, Trash } from 'lucide-react';

// Types and Schemas
export const contactTypes = [
  { value: "facebook", label: "Facebook" },
  { value: "instagram", label: "Instagram" },
  { value: "twitter", label: "Twitter" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "email", label: "Email" },
  { value: "website", label: "Website" },
  { value: "phone", label: "Phone" },
  { value: "other", label: "Other" },
];

export const contactSchema = z.object({
  bio: z.string().nullable(),
  contacts: z.array(z.object({
    type: z.string(),
    link: z.string().url("Please enter a valid URL").or(z.string().email("Please enter a valid email").or(z.string()))
  })),
  address: z.string().nullable(),
  about: z.string().nullable(),
});

export type CatalogSettingsFormValues = z.infer<typeof contactSchema>;

interface CatalogSettingsFormProps {
  settings: CatalogSettings | undefined;
  onSubmit: (data: CatalogSettingsFormValues) => Promise<void>;
  onCancel: () => void;
}

export const CatalogSettingsForm = ({ settings, onSubmit, onCancel }: CatalogSettingsFormProps) => {
  const form = useForm<CatalogSettingsFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      bio: settings?.bio || null,
      contacts: settings?.contacts || [],
      address: settings?.address || null,
      about: settings?.about || null,
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "contacts"
  });

  // Reset form when settings change
  useEffect(() => {
    if (settings) {
      form.reset({
        bio: settings.bio || null,
        contacts: settings.contacts || [],
        address: settings.address || null,
        about: settings.about || null,
      });
    }
  }, [settings, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-2">
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <label className="text-sm font-medium">Bio/Intro</label>
              <FormControl>
                <textarea
                  className="w-full mt-1 p-2 border rounded-md text-sm xl:text-base"
                  {...field}
                  value={field.value || ''}
                  rows={4}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <label className="text-sm font-medium">Contacts</label>
          {fields.map((field, index) => (
            <div key={field.id} className="flex gap-2 items-start">
              <FormField
                control={form.control}
                name={`contacts.${index}.type`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select contact type" />
                      </SelectTrigger>
                      <SelectContent>
                        {contactTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`contacts.${index}.link`}
                render={({ field }) => (
                  <FormItem className="flex-[2]">
                    <FormControl>
                      <Input
                        placeholder="Enter link or contact info"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => remove(index)}
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => append({ type: "", link: "" })}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Contact
          </Button>
        </div>

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <label className="text-sm font-medium">Address</label>
              <FormControl>
                <Input
                  {...field}
                  value={field.value || ''}
                  placeholder="Enter your address"
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="about"
          render={({ field }) => (
            <FormItem>
              <label className="text-sm font-medium">About</label>
              <FormControl>
                <textarea
                  className="w-full mt-1 p-2 border rounded-md text-xs sm:text-sm xl:text-base"
                  {...field}
                  value={field.value || ''}
                  rows={3}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </form>
    </Form>
  );
}; 
import { updateCatalogSettings } from "@/app/api/catalog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CatalogSettings } from "@/lib/types/catalog";
import { zodResolver } from "@hookform/resolvers/zod";
import { ExternalLink, Loader2, Plus, Save, Trash } from "lucide-react";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

const contactTypes = [
  { value: "facebook", label: "Facebook" },
  { value: "instagram", label: "Instagram" },
  { value: "twitter", label: "Twitter" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "email", label: "Email" },
  { value: "website", label: "Website" },
  { value: "phone", label: "Phone" },
  { value: "other", label: "Other" },
];

const contactSchema = z.object({
  contacts: z.array(z.object({
    type: z.string(),
    link: z.string().url("Please enter a valid URL").or(z.string().email("Please enter a valid email").or(z.string()))
  }))
});

type ContactFormValues = z.infer<typeof contactSchema>;

interface ContactSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: CatalogSettings | null;
  isAdmin: boolean;
}

export function CatalogIntroContact({ open, onOpenChange, settings, isAdmin }: ContactSettingsDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      contacts: settings?.contacts || []
    }
  });

  // Use useFieldArray as a separate hook call
  const { fields, append, remove } = useFieldArray({
    control: form.control,  // Add this line
    name: "contacts"
  });

  const onSubmit = async (values: ContactFormValues) => {
    try {
      setIsSubmitting(true);
      await updateCatalogSettings({
        contacts: values.contacts
      });
      toast.success("Contact settings updated");
      onOpenChange(false);
    } catch (error) {
      console.error(error); 
      toast.error("Failed to update contact settings");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValidUrl = (str: string) => {
    try {
      new URL(str);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Contact Settings</DialogTitle>
        </DialogHeader>
        {isAdmin ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        ) : (
          <div className="py-4 px-2 text-sm text-muted-foreground min-h-[100px] space-y-2">
            {settings?.contacts && settings.contacts.length > 0 ? (
              settings.contacts.map((contact, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <span className="font-medium capitalize">{contact.type}:</span>
                  <span>{contact.link}</span>
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
              <span>No contact information available.</span>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
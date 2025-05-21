import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Save } from "lucide-react";
import { useState } from "react";
import { updateCatalogSettings } from "@/app/api/catalog";
import { toast } from "sonner";
import { CatalogSettings } from "@/lib/types/catalog";

const aboutSchema = z.object({
  about: z.string().min(1, "About section cannot be empty").max(2000, "About section cannot exceed 2000 characters"),
});

type AboutFormValues = z.infer<typeof aboutSchema>;

interface AboutSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: CatalogSettings | null;
  isAdmin: boolean;
}

export function AboutSettingsDialog({ open, onOpenChange, settings, isAdmin }: AboutSettingsDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AboutFormValues>({
    resolver: zodResolver(aboutSchema),
    defaultValues: {
      about: settings?.about || ""
    }
  });

  const onSubmit = async (values: AboutFormValues) => {
    try {
      setIsSubmitting(true);
      await updateCatalogSettings({
        about: values.about
      });
      toast.success("About section updated");
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to update about section");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>About</DialogTitle>
        </DialogHeader>
        {isAdmin ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="about"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder="Tell visitors about your store, breeding program, or collection..."
                        className="min-h-[200px]"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
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
          <div className="py-4 px-2 text-sm text-muted-foreground min-h-[100px]">
            {settings?.about || 'No about information available.'}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IndividualSheddingForm } from "./IndividualSheddingForm";
import { BatchSheddingForm } from "./BatchSheddingForm";
import { CreateSheddingInput } from "@/lib/types/shedding";

interface NewSheddingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateSheddingInput) => Promise<void>;
  onBatchSubmit: (data: CreateSheddingInput[]) => Promise<boolean>;
}

export function NewSheddingDialog({
  open,
  onOpenChange,
  onSubmit,
  onBatchSubmit,
}: NewSheddingDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] md:max-w-[700px] lg:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Log Shedding</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="individual" className="w-full">
          <TabsList>
            <TabsTrigger value="individual">Individual Shed</TabsTrigger>
            <TabsTrigger value="batch">Batch Shed</TabsTrigger>
          </TabsList>
          <TabsContent value="individual">
            <IndividualSheddingForm
              onSubmit={onSubmit}
              onOpenChange={onOpenChange}
            />
          </TabsContent>
          <TabsContent value="batch">
            <BatchSheddingForm
              onSubmit={onBatchSubmit}
              onOpenChange={onOpenChange}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
} 
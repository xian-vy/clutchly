import { createReptile } from '@/app/api/reptiles/reptiles';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ReptileForm } from '../dashboard/reptiles/reptiles/ReptileForm';

interface Props {
   open : boolean;
   setOpen : (open: boolean) => void;
}
const AddNewShortcut = ({open,setOpen} : Props) => {
  const queryClient = useQueryClient();

  return (
    <div>
         <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[800px]">
            <DialogTitle> Add New Reptile</DialogTitle>
                <ReptileForm
                    initialData={undefined}
                    onSubmit={async (data) => {
                    const success = await createReptile(data);
                    if (success) {
                        toast.success('Reptile created successfully');
                        setOpen(false);
                        queryClient.invalidateQueries({ queryKey: ['reptiles'] });
                    }
                    }}
                    onCancel={() => {
                        setOpen(false);
                    }}
                    organization={undefined}
                 />
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AddNewShortcut

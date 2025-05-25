import React, { useEffect } from 'react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { ReptileForm } from '../dashboard/reptiles/reptiles/ReptileForm';
import { createReptile } from '@/app/api/reptiles/reptiles';
import { toast } from 'sonner';
import { SalesRecordForm } from '../dashboard/sales/SalesRecordForm';
import { createSalesRecord } from '@/app/api/sales';
import { useQueryClient } from '@tanstack/react-query';
import { ExpenseRecordForm } from '../dashboard/expenses/ExpenseRecordForm';
import { createExpenseRecord } from '@/app/api/expenses';

interface Props {
    type : "Reptile" | "Sale" | "Expense" | null
}
const AddNewShortcut = ({type} : Props) => {
    const [dialogToOpen , setDialogToOpen] = React.useState<"Reptile" | "Sale" | "Expense" | null>(null)
    const queryClient = useQueryClient();

    useEffect(() => {
        setDialogToOpen(type)
    },[type])
    

  return (
    <div>
         <Dialog open={type ? dialogToOpen === type : false} onOpenChange={() => setDialogToOpen(null)}>
            <DialogContent className="sm:max-w-[800px]">
            <DialogTitle>
                {dialogToOpen === 'Reptile' ? 'Add New Reptile' : dialogToOpen === 'Sale' ? 'Add New Sale' : 'Add New Expense'}

            </DialogTitle>
              {dialogToOpen === 'Reptile' ? (
                    <ReptileForm
                        initialData={undefined}
                        onSubmit={async (data) => {
                        const success = await createReptile(data);
                        if (success) {
                            toast.success('Reptile created successfully');
                            setDialogToOpen(null);
                            queryClient.invalidateQueries({ queryKey: ['reptiles'] });
                        }
                        }}
                        onCancel={() => {
                        setDialogToOpen(null);
                        }}
                        organization={undefined}
                     />
                ): dialogToOpen === 'Sale' ? (
                    <SalesRecordForm
                        initialData={undefined}
                        onSubmit={async (data) => {
                        const success = await createSalesRecord(data);
                        if (success) {
                            toast.success('Reptile created successfully');
                            setDialogToOpen(null);
                            queryClient.invalidateQueries({ queryKey: ['reptiles'] });
                            queryClient.invalidateQueries({ queryKey: ['sales-records'] });
                            queryClient.invalidateQueries({ queryKey: ['sales-summary'] });
                        }
                        }}
                        onCancel={() => {
                            setDialogToOpen(null);
                        }}
                    />
                ) :  dialogToOpen === 'Expense' ?(
                    <ExpenseRecordForm
                        initialData={undefined}
                        onSubmit={async (data) => {
                            const success =  await createExpenseRecord(data);
                            if (success) {
                                toast.success('Reptile created successfully');
                                setDialogToOpen(null);
                                queryClient.invalidateQueries({ queryKey: ['expenses'] });
                                queryClient.invalidateQueries({ queryKey: ['expenses-summary'] });
                           }
                        }}
                        onCancel={() => {
                            setDialogToOpen(null);
                        }}
                     />
                ) : null}
     
          
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AddNewShortcut

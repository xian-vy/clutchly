'use client'

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SheddingWithReptile, UpdateSheddingInput } from '@/lib/types/shedding'
import { useState } from 'react'

interface Props {
  shedding: SheddingWithReptile | undefined
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: { id: string } & UpdateSheddingInput) => Promise<boolean>
}

export function EditSheddingDialog({ shedding, open, onOpenChange, onSubmit }: Props) {
  const [formData, setFormData] = useState<UpdateSheddingInput>({
    shed_date: shedding?.shed_date,
    completeness: shedding?.completeness,
    notes: shedding?.notes || '',
  })
  if (!shedding) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('EditSheddingDialog: Submitting form with data:', { id: shedding.id, ...formData })
    const success = await onSubmit({ id: shedding.id, ...formData })
    console.log('EditSheddingDialog: Submit result:', success)
    if (success) {
      onOpenChange(false)
    }
  }

  // Ensure shed_date is a valid date string
  const shedDate = formData.shed_date ? new Date(formData.shed_date).toISOString().split('T')[0] : ''

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>Edit Shedding Record</DialogTitle>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="shed_date">Date</Label>
            <Input
              id="shed_date"
              type="date"
              value={shedDate}
              onChange={(e) => setFormData({ ...formData, shed_date: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="completeness">Completeness</Label>
            <Select
              value={formData.completeness}
              onValueChange={(value: 'full' | 'partial' | 'retained' | 'unknown') =>
                setFormData({ ...formData, completeness: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select completeness" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full">Full</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="retained">Retained</SelectItem>
                <SelectItem value="unknown">Unknown</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Add any notes about the shedding..."
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 
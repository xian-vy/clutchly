'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { SheddingWithReptile, UpdateSheddingInput } from '@/lib/types/shedding'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { EditSheddingDialog } from './EditSheddingDialog'
import { Badge } from '@/components/ui/badge'
import { Pencil, Trash2 } from 'lucide-react'
import { Loader2 } from 'lucide-react'

interface Props {
  sheddingRecords: SheddingWithReptile[] | undefined
  isLoading: boolean
  selectedResource: SheddingWithReptile | undefined
  setSelectedResource: (resource: SheddingWithReptile | undefined) => void
  onUpdate: (data: UpdateSheddingInput) => Promise<boolean>
  onDelete: (id: string) => Promise<void>
}

export function SheddingList({
  sheddingRecords,
  isLoading,
  selectedResource,
  setSelectedResource,
  onUpdate,
  onDelete,
}: Props) {
  const [editingShedding, setEditingShedding] = useState<SheddingWithReptile | null>(null)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Reptile</TableHead>
              <TableHead>Completeness</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sheddingRecords?.map((record: SheddingWithReptile) => (
              <TableRow key={record.id}>
                <TableCell>
                  {format(new Date(record.shed_date), 'MMM d, yyyy')}
                </TableCell>
                <TableCell>
                  {record.reptile.name}
                  {record.reptile.reptile_code && (
                    <span className="ml-2 text-muted-foreground">
                      ({record.reptile.reptile_code})
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {record.completeness.charAt(0).toUpperCase() + record.completeness.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>{record.notes}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedResource(record)
                        setEditingShedding(record)
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this shedding record?')) {
                          onDelete(record.id)
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {editingShedding && (
        <EditSheddingDialog
          shedding={editingShedding}
          open={!!editingShedding}
          onOpenChange={(open) => {
            if (!open) {
              setEditingShedding(null)
              setSelectedResource(undefined)
            }
          }}
          onSubmit={async (data: UpdateSheddingInput) => {
            if (selectedResource) {
              const success = await onUpdate(data)
              if (success) {
                setEditingShedding(null)
                setSelectedResource(undefined)
              }
            }
          }}
        />
      )}
    </div>
  )
} 
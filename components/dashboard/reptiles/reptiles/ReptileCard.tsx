'use client'

import { Reptile } from '@/lib/types/reptile'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Edit, Trash2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface ReptileCardProps {
  reptile: Reptile
  onEdit: (reptile: Reptile) => void
  onDelete: (id: string) => void
}

export function ReptileCard({ reptile, onEdit, onDelete }: ReptileCardProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>{reptile.name}</span>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={() => onEdit(reptile)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onDelete(reptile.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Species</p>
            <p>{reptile.species}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Morph</p>
            <p>{reptile.morph}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Sex</p>
            <p className="capitalize">{reptile.sex}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Status</p>
            <p className="capitalize">{reptile.status}</p>
          </div>
        </div>
        {reptile.notes && (
          <div>
            <p className="text-sm font-medium text-muted-foreground">Notes</p>
            <p className="text-sm">{reptile.notes}</p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <p className="text-xs text-muted-foreground">
          Last updated {formatDistanceToNow(new Date(reptile.last_modified))} ago
        </p>
      </CardFooter>
    </Card>
  )
} 
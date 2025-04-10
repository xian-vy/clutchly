'use client'

import { Species } from '@/lib/types/species'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Edit, Trash2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { Badge } from '@/components/ui/badge'

interface SpeciesCardProps {
  species: Species
  onEdit: (species: Species) => void
  onDelete: (id: string) => void
}

export function SpeciesCard({ species, onEdit, onDelete }: SpeciesCardProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <div className="space-y-1">
            <span>{species.name}</span>
            <div className="text-sm font-normal text-muted-foreground">
              {species.scientific_name}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={() => onEdit(species)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onDelete(species.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {species.description && (
          <p className="text-sm text-muted-foreground">{species.description}</p>
        )}
        <Badge variant={
          species.care_level === 'beginner' ? 'default' :
          species.care_level === 'intermediate' ? 'secondary' :
          'destructive'
        }>
          {species.care_level.charAt(0).toUpperCase() + species.care_level.slice(1)} Care Level
        </Badge>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-muted-foreground">
          Last updated {formatDistanceToNow(new Date(species.last_modified))} ago
        </p>
      </CardFooter>
    </Card>
  )
} 
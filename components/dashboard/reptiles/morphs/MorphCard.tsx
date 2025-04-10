'use client'

import { Morph } from '@/lib/types/morph'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Edit, Trash2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface MorphCardProps {
  morph: Morph & { species: { name: string } }
  onEdit: (morph: Morph & { species: { name: string } }) => void
  onDelete: (id: string) => void
}

export function MorphCard({ morph, onEdit, onDelete }: MorphCardProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <div className="space-y-1">
            <span>{morph.name}</span>
            <div className="text-sm font-normal text-muted-foreground">
              {morph.species.name}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={() => onEdit(morph)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onDelete(morph.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {morph.description && (
          <p className="text-sm text-muted-foreground">{morph.description}</p>
        )}
        <div className="space-y-2">
          {morph.genetic_traits.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-sm font-medium">Genetic Traits</p>
              <div className="flex flex-wrap gap-1.5">
                {morph.genetic_traits.map((trait, index) => (
                  <Badge key={index} variant="secondary">{trait}</Badge>
                ))}
              </div>
            </div>
          )}
          {morph.visual_traits.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-sm font-medium">Visual Traits</p>
              <div className="flex flex-wrap gap-1.5">
                {morph.visual_traits.map((trait, index) => (
                  <Badge key={index}>{trait}</Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-muted-foreground">
          Last updated {formatDistanceToNow(new Date(morph.last_modified))} ago
        </p>
      </CardFooter>
    </Card>
  )
} 
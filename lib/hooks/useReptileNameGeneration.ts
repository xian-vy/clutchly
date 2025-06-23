import { useEffect, useState, useCallback } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { Reptile, Sex, reptileFormSchema } from '@/lib/types/reptile'
import { generateReptileCode, generateReptileName, getSpeciesCode } from '@/components/dashboard/reptiles/utils'
import { Species } from '@/lib/types/species'
import { Morph } from '@/lib/types/morph'
import * as z from 'zod'

interface UseReptileNameGenerationProps {
  form: UseFormReturn<z.infer<typeof reptileFormSchema>>
  initialData?: Reptile
  species: Species[]
  morphsForSpecies: Morph[]
  reptiles: Reptile[]
  hetTraits: Array<{
    trait: string
    percentage: number
    source?: 'visual_parent' | 'genetic_test' | 'breeding_odds'
    verified?: boolean
  }>
}

export function useReptileNameGeneration({
  form,
  initialData,
  species,
  morphsForSpecies,
  reptiles,
  hetTraits
}: UseReptileNameGenerationProps) {
  const [isNameManuallyEdited, setIsNameManuallyEdited] = useState(() => {
    // For new reptiles, start in auto mode
    if (!initialData) return false
    
    // For existing reptiles, start in manual mode to respect the original name
    return true
  })

  const speciesId = form.watch('species_id')
  const morphId = form.watch('morph_id')
  const sex = form.watch('sex')
  const hatchDate = form.watch('hatch_date')

  // Consolidated useEffect for all auto-generation logic
  useEffect(() => {
    const selectedSpecies = species.find(s => s.id.toString() === speciesId)
    const selectedMorph = morphsForSpecies.find(m => m.id.toString() === morphId)
    
    if (!selectedMorph) return

    // Auto-generate reptile code (only for new reptiles)
    if (!initialData && selectedSpecies) {
      const speciesCode = getSpeciesCode(selectedSpecies.name)
      const generatedCode = generateReptileCode(
        reptiles,
        speciesCode,
        selectedMorph.name,
        hatchDate,
        sex as Sex
      )
      form.setValue('reptile_code', generatedCode)
    }

    // Get current reptile code for name generation
    const reptileCode = form.getValues('reptile_code')
    const sequenceNumber = reptileCode ? reptileCode.split('-')[0] : ''

    // Generate the name that would be auto-generated
    const generatedName = generateReptileName(
      selectedMorph.name,
      hetTraits,
      sequenceNumber
    )

    // Auto-generate reptile name (only for new reptiles or when explicitly in auto mode)
    if (!initialData || !isNameManuallyEdited) {
      form.setValue('name', generatedName)
    }
  }, [
    speciesId, 
    morphId, 
    sex, 
    hatchDate, 
    hetTraits, 
    form, 
    reptiles, 
    species, 
    morphsForSpecies, 
    initialData, 
    isNameManuallyEdited
  ])

  const regenerateName = useCallback(() => {
    const selectedMorph = morphsForSpecies.find(m => m.id.toString() === morphId)
    if (selectedMorph) {
      const reptileCode = form.getValues('reptile_code')
      const sequenceNumber = reptileCode ? reptileCode.split('-')[0] : ''
      const generatedName = generateReptileName(
        selectedMorph.name,
        hetTraits,
        sequenceNumber
      )
      form.setValue('name', generatedName)
    }
  }, [morphsForSpecies, morphId, hetTraits, form])

  const toggleNameMode = useCallback(() => {
    if (isNameManuallyEdited) {
      // Switch to auto mode
      setIsNameManuallyEdited(false)
      regenerateName()
    } else {
      // Switch to manual mode
      setIsNameManuallyEdited(true)
    }
  }, [isNameManuallyEdited, setIsNameManuallyEdited, regenerateName])

  return {
    isNameManuallyEdited,
    setIsNameManuallyEdited,
    toggleNameMode,
    regenerateName
  }
} 
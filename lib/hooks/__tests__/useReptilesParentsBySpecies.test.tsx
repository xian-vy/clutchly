import { renderHook, act } from '@testing-library/react'
import { useReptilesParentsBySpecies } from '@/lib/hooks/useReptilesParentsBySpecies'
import { Reptile } from '@/lib/types/reptile'
import { Morph } from '@/lib/types/morph'

jest.mock('@/lib/stores/morphsStore', () => ({
  useMorphsStore: () => ({
    getMorphsBySpecies: (speciesId: string) => mockGetMorphsBySpecies(speciesId),
  }),
}))

const mockGetMorphsBySpecies = jest.fn((speciesId: string): Morph[] => {
  if (speciesId === '1') return mockMorphsSpecies1
  if (speciesId === '2') return mockMorphsSpecies2
  return []
})

const mockMorphsSpecies1: Morph[] = [
  { id: 1, org_id: 'org-1', name: 'Normal', species_id: 1, description: 'Normal', is_global: false },
  { id: 2, org_id: 'org-1', name: 'Albino', species_id: 1, description: 'Albino', is_global: false },
]

const mockMorphsSpecies2: Morph[] = [
  { id: 3, org_id: 'org-1', name: 'Patternless', species_id: 2, description: 'Patternless', is_global: false },
]

const reptiles: Reptile[] = [
  {
    id: 'r1', created_at: '2023-01-01T00:00:00Z', org_id: 'org-1', name: 'R1', price: 0,
    reptile_code: '00001', species_id: '1', morph_id: '1', visual_traits: null, het_traits: null,
    sex: 'male', weight: 0, length: 0, hatch_date: '2023-01-01', acquisition_date: '2023-02-01',
    status: 'active', notes: null, last_modified: '2023-03-01T00:00:00Z', original_breeder: null,
  },
  {
    id: 'r2', created_at: '2023-01-01T00:00:00Z', org_id: 'org-1', name: 'R2', price: 0,
    reptile_code: '00002', species_id: '1', morph_id: '2', visual_traits: null, het_traits: null,
    sex: 'female', weight: 0, length: 0, hatch_date: '2023-01-01', acquisition_date: '2023-02-01',
    status: 'active', notes: null, last_modified: '2023-03-01T00:00:00Z', original_breeder: null,
  },
  {
    id: 'r3', created_at: '2023-01-01T00:00:00Z', org_id: 'org-1', name: 'R3', price: 0,
    reptile_code: '00003', species_id: '1', morph_id: '', visual_traits: null, het_traits: null,
    sex: 'male', weight: 0, length: 0, hatch_date: '2023-01-01', acquisition_date: '2023-02-01',
    status: 'active', notes: null, last_modified: '2023-03-01T00:00:00Z', original_breeder: null,
  },
  {
    id: 'r4', created_at: '2023-01-01T00:00:00Z', org_id: 'org-1', name: 'R4', price: 0,
    reptile_code: '00004', species_id: '2', morph_id: '3', visual_traits: null, het_traits: null,
    sex: 'female', weight: 0, length: 0, hatch_date: '2023-01-01', acquisition_date: '2023-02-01',
    status: 'active', notes: null, last_modified: '2023-03-01T00:00:00Z', original_breeder: null,
  },
]

describe('useReptilesParentsBySpecies', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('filters reptiles by species and morphs; sets male/female lists', () => {
    const { result } = renderHook((props: { speciesId: string }) =>
      useReptilesParentsBySpecies({ reptiles, speciesId: props.speciesId })
    , { initialProps: { speciesId: '1' } })

    // Initial selection
    expect(result.current.selectedSpeciesId).toBe('1')
    expect(result.current.morphsForSpecies.map(m => m.id)).toEqual([1, 2])

    // Male reptiles: r1 (morph 1), r3 (undefined morph allowed)
    expect(result.current.maleReptiles.map(r => r.id).sort()).toEqual(['r1', 'r3'])
    // Female reptiles: r2 (morph 2)
    expect(result.current.femaleReptiles.map(r => r.id)).toEqual(['r2'])
  })

  it('updates when speciesId changes', () => {
    const { result, rerender } = renderHook((props: { speciesId: string }) =>
      useReptilesParentsBySpecies({ reptiles, speciesId: props.speciesId })
    , { initialProps: { speciesId: '1' } })

    expect(result.current.selectedSpeciesId).toBe('1')
    expect(result.current.femaleReptiles.map(r => r.id)).toEqual(['r2'])

    act(() => {
      rerender({ speciesId: '2' })
    })

    expect(result.current.selectedSpeciesId).toBe('2')
    expect(result.current.morphsForSpecies.map(m => m.id)).toEqual([3])
    // Only r4 matches species 2 and its morph is present for species 2
    expect(result.current.femaleReptiles.map(r => r.id)).toEqual(['r4'])
    expect(result.current.maleReptiles).toHaveLength(0)
  })

  it('returns empty lists for unknown species', () => {
    const { result } = renderHook(() =>
      useReptilesParentsBySpecies({ reptiles, speciesId: '999' })
    )

    expect(result.current.selectedSpeciesId).toBe('999')
    expect(result.current.morphsForSpecies).toHaveLength(0)
    expect(result.current.maleReptiles).toHaveLength(0)
    expect(result.current.femaleReptiles).toHaveLength(0)
  })
})



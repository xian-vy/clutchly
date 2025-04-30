import { Reptile } from './reptile'

export interface GeneticCalculation {
  id: string
  user_id: string
  dam_id: string
  sire_id: string
  created_at: string
  result: GeneticResult
}

export interface GeneticResult {
  possible_morphs: PossibleMorph[]
  possible_hets: PossibleHet[]
  probability_summary: string
  detailed_analysis: string
}

export interface PossibleMorph {
  name: string
  probability: number
  description: string
}

export interface PossibleHet {
  trait: string
  probability: number
  description: string
}

export type NewGeneticCalculation = Omit<GeneticCalculation, 'id' | 'user_id' | 'created_at'>

export interface GeneticCalculatorInput {
  dam: Reptile
  sire: Reptile
}

export interface GeneticCalculatorResponse {
  result: GeneticResult
  error?: string
  rateLimited?: boolean
} 
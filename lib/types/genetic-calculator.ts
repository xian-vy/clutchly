import { Reptile } from './reptile'
import { Species } from './species'

export interface GeneticCalculation {
  id: string
  org_id: string
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
  punnett_square?: PunnettSquare
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

export type NewGeneticCalculation = Omit<GeneticCalculation, 'id' | 'org_id' | 'created_at'>

export interface GeneticCalculatorInput {
  dam: Reptile
  sire: Reptile
  species : Species
}

export interface PunnettSquareCell {
  genotype: string;
  phenotype: string;
  probability: number;
  description?: string;
}

export interface PunnettSquareRow {
  label: string;
  cells: PunnettSquareCell[];
}

export interface PunnettSquare {
  headers: string[];
  rows: PunnettSquareRow[];
}

export interface GeneticCalculatorResponse {
  result?: {
    possible_morphs: Array<{
      name: string;
      probability: number;
      description: string;
    }>;
    possible_hets: Array<{
      trait: string;
      probability: number;
      description: string;
    }>;
    probability_summary: string;
    punnett_square: PunnettSquare;
    detailed_analysis: string;
  };
  error?: string;
  rateLimited?: boolean
} 
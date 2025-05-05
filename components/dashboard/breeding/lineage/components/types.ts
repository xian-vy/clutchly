'use client';

import {  HetTrait, Reptile } from '@/lib/types/reptile';

export interface ReptileNode extends Reptile {
  children: ReptileNode[];
  childrenWithoutDescendants: Reptile[];
  parents: {
    dam: ReptileNode | null;
    sire: ReptileNode | null;
  };
}

export type GroupedReptilesType = Record<string, Reptile[]>;

export interface ReptileTreeProps {
  reptileId: string;
} 

export interface CustomNodeData {
  name: string;
  species_name?: string;
  sex: string;
  isParent?: 'dam' | 'sire';
  generation?: number;
  breeding_line?: string;
  morph_name: string;
  isSelected?: boolean;
  isHighlighted?: boolean;
  isParentOf?: string;
  selectedReptileName: string;
  visualTraits: string[];
  hetTraits: HetTrait[];
  isGroupNode?: boolean;
  groupedReptiles?: Reptile[];
  nodeType?: string;
  count?: number;
  parentId?: string;
  parentIds?: string[];
  parentNames?: string[];
}
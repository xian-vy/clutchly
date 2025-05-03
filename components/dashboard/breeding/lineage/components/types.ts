'use client';

import {  Reptile } from '@/lib/types/reptile';

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
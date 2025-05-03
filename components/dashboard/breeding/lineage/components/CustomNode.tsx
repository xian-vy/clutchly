'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { HetTrait, Reptile } from '@/lib/types/reptile';
import { CircleHelp, Mars, Venus } from 'lucide-react';
import { Handle, NodeProps, Position } from 'reactflow';

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
}


const CustomNode = ({ data }: NodeProps<CustomNodeData>) => (
  <div
    className={cn(
      'px-4 py-2 shadow-lg rounded-md border border-input bg-card dark:bg-slate-900/60 min-w-[200px] transition-all duration-300',
      data.isSelected && 
        'ring-1 ring-primary shadow-2xl  border-primary z-50',
      data.isHighlighted && !data.isSelected && 
        'ring-1 ring-amber-500 shadow-xl bg-amber-50 dark:bg-amber-900/30 border-amber-500 z-40',
      data.isParentOf && 
        (data.isParent === 'dam' 
          ? 'ring-1 ring-red-500 shadow-xl bg-white dark:bg-red-900/30 border-red-500 z-40'
          : 'ring-1 ring-blue-500 shadow-xl bg-white dark:bg-blue-900/30 border-blue-500 z-40')
    )}
  >
    <Handle type="target" position={Position.Top} />
    <div className="flex flex-col items-center gap-1.5">
        <div className="flex items-center gap-3">
              <div className="font-bold">{data.name || 'Unknown'}</div>
              <>
                {data.sex === 'male' ? (
                  <Mars className="h-4 w-4 text-blue-400"/>
                ) : data.sex === 'female' ? (
                  <Venus className="h-4 w-4 text-red-500"/>
                ) :(
                  <CircleHelp className="h-4 w-4 text-muted-foreground"/>
                )}
              </>
        </div>
        <div className="text-sm  font-medium">{data.morph_name || 'N/A'}</div>
        <div className="flex gap-2 flex-wrap w-full justify-center">
          {data.visualTraits?.map((trait, index) => (
            <Badge key={index} className='bg-slate-700/10 dark:bg-slate-700/20 text-muted-foreground text-xs' >{trait}</Badge>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap w-full justify-center">
          {data.hetTraits?.map((trait, index) => (
            <Badge key={index} className='bg-slate-700/10 dark:bg-slate-700/20 text-muted-foreground text-xs'>{trait.percentage + "% het " +  trait.trait}</Badge>
          ))}
        </div>
        <div className="flex gap-2 justify-center flex-wrap w-full">
          {data.generation && (
            <Badge variant="outline">Gen {data.generation}</Badge>
          )}
          {data.breeding_line && (
            <Badge variant="secondary">{data.breeding_line}</Badge>
          )}
        </div>
    </div>
    <Handle type="source" position={Position.Bottom} />
  </div>
);

export default CustomNode; 
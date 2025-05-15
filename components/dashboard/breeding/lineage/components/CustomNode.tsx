'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {  Reptile } from '@/lib/types/reptile';
import { CircleHelp, Mars, Venus } from 'lucide-react';
import { Handle, Position } from 'reactflow';
import { CustomNodeData } from './types';

interface Props {
  reptiles?: Reptile[];
  data: CustomNodeData;
}


const CustomNode = ({ data }: Props) => (
  <div
    className={cn(
      'px-4 py-2 shadow-md rounded-xl border border-input bg-card dark:bg-slate-900/50 w-[250px] transition-all duration-300',
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
    <div className="flex flex-col items-center gap-1.5 justify-center h-[200px] ">
     <div className="flex flex-col items-center">
           <div className="flex items-center gap-2">
                  <>
                    {data.sex === 'male' ? (
                      <Mars className="h-4 w-4 text-blue-400"/>
                    ) : data.sex === 'female' ? (
                      <Venus className="h-4 w-4 text-red-500"/>
                    ) :(
                      <CircleHelp className="h-4 w-4 text-muted-foreground"/>
                    )}
                  </>
                  <div className="font-bold text-base lg:text-lg text-black dark:text-white">{data.name || 'Unknown'}</div>  
              </div>
              <span className="text-xs lg:text-sm text-muted-foreground">
                    {data.code || '--'}
               </span>
        </div>
        <div className="text-sm lg:text-base text-primary  font-medium">{data.morph_name || 'N/A'}</div>
        {/* <div className="flex gap-2 flex-wrap w-full justify-center">
          {data.visualTraits?.map((trait, index) => (
            <Badge key={index} className='bg-slate-700/10 dark:bg-slate-700/20 text-muted-foreground text-xs lg:text-sm' >{trait}</Badge>
          ))}
        </div> */}
        <div className="flex gap-2 flex-wrap w-full justify-center">
          {data.hetTraits?.map((trait, index) => (
            <Badge key={index} className='bg-slate-700/10 dark:bg-slate-700/20 text-muted-foreground text-xs lg:text-sm'>{trait.percentage + "% het " +  trait.trait}</Badge>
          ))}
        </div>
        {/* <div className="flex gap-2 justify-center flex-wrap w-full">
          {data.generation && (
            <Badge variant="outline">Gen {data.generation}</Badge>
          )}
          {data.breeding_line && (
            <Badge variant="secondary">{data.breeding_line}</Badge>
          )}
        </div> */}
    </div>
    <Handle 
      type="source" 
      position={Position.Bottom} 
      style={{ 
        transform: 'translateX(-50%)',
        left: '50%'
      }}
    />
  </div>
);

export default CustomNode; 
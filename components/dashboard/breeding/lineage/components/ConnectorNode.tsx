'use client';

import { Handle, Position, NodeProps } from 'reactflow';
import { CustomNodeData } from './types';
import { cn } from '@/lib/utils';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ConnectorNode = ({ data }: NodeProps<CustomNodeData>) => (
  <div className={cn(
    "w-12 h-12 flex items-center justify-center rounded-full bg-white dark:bg-gray-900/70",
    "border-2 border-slate-300/80 dark:border-slate-600/80 shadow-sm"
  )}>
    <Handle 
      type="target" 
      position={Position.Top} 
      style={{ border: 'none', background: 'transparent' }} 
    />
    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700/60 border border-slate-300 dark:border-slate-600"></div>
    <Handle 
      type="source" 
      position={Position.Bottom} 
      style={{ border: 'none', background: 'transparent' }} 
    />
  </div>
);

export default ConnectorNode; 
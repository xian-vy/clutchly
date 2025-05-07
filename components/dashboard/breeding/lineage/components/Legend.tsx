'use client';

import { Dna, Mars, Venus, Circle } from 'lucide-react';

const Legend = () => (
  <div className="absolute bottom-0 right-2 bg-white dark:bg-slate-900 p-3 rounded-md shadow-md border border-gray-200 dark:border-gray-800 z-10">
    <div className="text-sm font-medium mb-2">Legend</div>
    <div className="flex items-center mb-1">
      <div className="w-4 h-0.5 bg-blue-400 mr-2"></div>
      <div className="flex items-center">
        <span className="text-xs mr-1">Sire</span>
        <Mars className="h-3 w-3 text-blue-400" />
      </div>
    </div>
    <div className="flex items-center mb-1">
      <div className="w-4 h-0.5 bg-red-500 mr-2"></div>
      <div className="flex items-center">
        <span className="text-xs mr-1">Dam</span>
        <Venus className="h-3 w-3 text-red-500" />
      </div>
    </div>
    <div className="flex items-center mb-1">
      <div className="w-4 h-0.5 bg-slate-400 mr-2"></div>
      <div className="flex items-center">
        <span className="text-xs mr-1">Connection</span>
        <Circle className="h-3 w-3 fill-slate-400/60 text-slate-400" strokeWidth={1.5} />
      </div>
    </div>
    <div className="flex items-center">
      <div className="mr-2" style={{ borderBottom: '1px dashed #6b7280', width: '1rem' }}></div>
      <div className="flex items-center">
        <span className="text-xs mr-1">Grouped Offspring</span>
        <Dna className="h-3 w-3 text-gray-500" />
      </div>
</div>
  </div>
);

export default Legend; 
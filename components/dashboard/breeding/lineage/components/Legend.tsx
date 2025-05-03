'use client';

import { Dna, Mars, Venus } from 'lucide-react';

const Legend = () => (
  <div className="absolute bottom-24 right-8 bg-white dark:bg-slate-900 p-3 rounded-md shadow-md border border-gray-200 dark:border-gray-800 z-10">
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
    <div className="flex items-center">
      <div className="w-4 h-0.5 bg-slate-400 dashed mr-2" style={{ borderStyle: 'dashed' }}></div>
      <div className="flex items-center">
        <span className="text-xs mr-1">Grouped Offspring</span>
        <Dna className="h-3 w-3 text-primary" />
      </div>
    </div>
  </div>
);

export default Legend; 
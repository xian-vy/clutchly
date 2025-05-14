import React from 'react'

interface Props {
    step: number
}
const StepsIndicator = ({step} : Props) => {
  return (
    <div className="flex justify-between w-full mb-3">
    {['Select File', 'Preview', 'Processing', 'Complete'].map((stepName, idx) => (
      <div 
        key={idx} 
        className={`flex flex-col items-center w-1/4 ${idx < step ? 'text-primary' : idx === step ? 'text-primary font-medium' : 'text-gray-400'}`}
      >
        <div className={`w-6 sm:w-8 h-6 sm:h-8 rounded-full text-xs sm:text-sm flex items-center justify-center ${
          idx < step 
            ? 'bg-primary text-white dark:text-black' 
            : idx === step 
              ? 'border-2 border-primary text-primary' 
              : 'border border-gray-300 text-gray-400'
        }`}>
          {idx < step ? '✓' : idx + 1}
        </div>
        <span className="mt-1 text-xs">{stepName}</span>
      </div>
    ))}
  </div>
  )
}

export default StepsIndicator
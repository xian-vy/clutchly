export const STATUS_COLORS = {
  active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  sold: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  deceased: 'bg-[#111] text-white',
  planned : 'bg-gray-200 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
} as const;

export const SEX_COLORS = {
  male: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  female: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400',
  unknown: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
} as const; 

export const YES_NO_COLORS = {
  yes: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  no: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  unknown: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
} as const; 


export const SEVERITY_COLORS = {
  low: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  moderate: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', 
  high: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
}

export const HEALTH_STATUS_COLORS = {
  resolved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  ongoing: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  unknown: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
} as const;

export const INCUBATION_STATUS_COLORS = {
 completed :   'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  failed :  'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  in_progress :  'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  not_started :  'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
}

export const TRUE_FALSE_COLORS = {
  true: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  false: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
} as const; 
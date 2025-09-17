'use client'

import { MoonStar, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="p-2 rounded-md hover:bg-secondary/80 transition-colors cursor-pointer"
      aria-label="Toggle theme"
    >
      <Sun className="h-3.5 w-3.5 sm:h-4 sm:w-4 block dark:hidden text-gray-600 dark:text-gray-300" />
      <MoonStar className=" h-3.5 w-3.5 sm:h-4 sm:w-4 hidden dark:block text-gray-600 dark:text-gray-300" />
    </button>
  )
} 
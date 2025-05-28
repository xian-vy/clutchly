'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="p-2 rounded-md hover:bg-secondary/80 transition-colors"
      aria-label="Toggle theme"
    >
      <Sun className="h-4 w-4 block dark:hidden text-gray-600 dark:text-gray-300" />
      <Moon className=" h-4 w-4 hidden dark:block text-gray-600 dark:text-gray-300" />
    </button>
  )
} 
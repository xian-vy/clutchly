'use client'

import { MoonStar, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

export function ThemeToggleCatalog() {
  const { theme, setTheme } = useTheme()

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className=" rounded-md "
      aria-label="Toggle theme"
    >
      <Sun className="h-3.5 w-3.5 sm:h-4 sm:w-4 block dark:hidden text-white dark:text-black" />
      <MoonStar className=" h-3.5 w-3.5 sm:h-4 sm:w-4 hidden dark:block text-white dark:text-black" />
    </button>
  )
} 
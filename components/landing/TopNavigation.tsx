'use client'
import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import { ThemeToggle } from '../theme/ThemeToggle'

const TopNavigation = () => {
  const { theme } = useTheme()

  return (
    <nav className="absolute top-0 left-0 right-0 z-50 bg-[#f0fdf4]/20 dark:bg-gray-900/20 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-800/50">
      <div className=" mx-auto px-4 sm:px-6 lg:px-8 2xl:!px-16">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-1.5 sm:space-x-2">
              <Image 
                src={theme === 'dark' ? '/logo_dark.png' : '/logo_light.png'} 
                width={50} 
                height={50} 
                alt="Clutchly Logo" 
                className="rounded-full size-8 sm:size-8.5 xl:size-9"
              />
              <span className="text-lg md:text-xl font-semibold text-foreground/85">
                Clutchly
              </span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4 sm:space-x-5 md:space-x-6 3xl:space-x-8"> 
            <Link href="/features" className=" text-xs md:text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
              Features
            </Link>
            <Link href="/contact" className="text-xs md:text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
              Contact
            </Link>
          <ThemeToggle/>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default TopNavigation

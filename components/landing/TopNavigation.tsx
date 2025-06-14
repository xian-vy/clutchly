'use client'
import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import { ThemeToggle } from '../theme/ThemeToggle'

const TopNavigation = () => {
  const { theme } = useTheme()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#f0fdf4]/40 dark:bg-gray-900/20 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-800/50">
      <div className=" mx-auto px-4 sm:px-6 lg:px-8 2xl:!px-16">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Image 
                src={theme === 'dark' ? '/logo_dark.png' : '/logo_light.png'} 
                width={37} 
                height={37} 
                alt="Clutchly Logo" 
                className="rounded-full"
              />
              <span className="text-base md:text-lg font-semibold text-gray-900 dark:text-white">
                Clutchly
              </span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4 sm:space-x-5 md:space-x-6 2xl:space-x-8"> 
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

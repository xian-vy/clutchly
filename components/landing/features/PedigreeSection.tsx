'use client'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { useTheme } from 'next-themes'
import { useState } from 'react'
import { X } from 'lucide-react'

const PedigreeSection = () => {
  const theme = useTheme()
  const [isImageEnlarged, setIsImageEnlarged] = useState(false)

  const handleImageClick = () => {
    setIsImageEnlarged(true)
  }

  const handleCloseModal = () => {
    setIsImageEnlarged(false)
  }

  return (
    <>
      <section className="relative !overflow-hidden flex items-center justify-center">
        <div className="max-w-7xl relative z-10 flex flex-col items-center w-full gap-12 py-6 px-4">
          {/* Text Content */}
          <div className="flex flex-col items-center max-w-3xl w-full text-center">
          <motion.div 
              className="relative mb-8"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs md:text-sm font-medium text-primary">
                Spotlight Feature
              </span>
            </motion.div>
            {/* Headline */}
            <motion.h2 
              className="font-bold tracking-tighter text-2xl lg:text-3xl 3xl:!text-4xl text-[#333] dark:text-foreground "
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              Interactive
              <span className="text-primary ml-2">
                Pedigree Analysis
              </span>
            </motion.h2>
            {/* Supporting text */}
            <motion.p 
              className="mt-2 text-muted-foreground text-sm lg:text-base 3xl:!text-lg max-w-[600px]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              Visualize your reptile&apos;s complete lineage with our interactive pedigree tree
            </motion.p>
          </div>
          {/* Image */}
          <div className="w-full max-w-4xl 3xl:max-w-[1100px]  relative">
            <div 
              className="relative aspect-[16/9] border w-full rounded-sm shadow-2xl shadow-primary/20 dark:shadow-primary/15 overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
              onClick={handleImageClick}
            >
 
             <Image 
                src={theme.theme === 'dark' ? '/features/featured_dark.png' : '/features/featured_light.png'}
                alt="Pedigree Analysis Feature"
                fill
                loading='lazy'
                className="object-cover object-left"
                sizes='(max-width: 768px) 90vw, 70vw'
              />
            </div>
          </div>
        </div>
      </section>

      {/* Enlarged Image Modal */}
      {isImageEnlarged && (
        <div 
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={handleCloseModal}
        >
          <div className="relative w-[90vw] h-[90vh] max-w-6xl">
            <button
              onClick={handleCloseModal}
              className="absolute top-0 right-0 lg:-right-10 text-white hover:text-gray-300 text-2xl font-bold z-10 cursor-pointer"
            >
              <X strokeWidth={1.5} className="w-8 h-8" />
            </button>
            <Image 
              src={theme.theme === 'dark' ? '/features/featured_dark.png' : '/features/featured_light.png'}
              alt="Pedigree Analysis Feature - Enlarged"
              fill
              loading='lazy'
              className="object-contain"
              sizes="90vw"
            />
          </div>
        </div>
      )}
    </>
  )
}

export default PedigreeSection

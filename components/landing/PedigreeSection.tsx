'use client'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { useTheme } from 'next-themes'

const PedigreeSection = () => {
  const theme = useTheme()

  return (
    <section className="relative !overflow-hidden flex items-center justify-center">
      <div className="max-w-7xl relative z-10 flex flex-col items-center w-full gap-12 py-12 px-4">
        {/* Text Content */}
        <div className="flex flex-col items-center max-w-3xl w-full text-center">
          {/* Badge */}
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
            className="font-bold tracking-tighter text-2xl lg:text-3xl xl:text-4xl text-[#333] dark:text-foreground "
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
            className="mt-2 text-muted-foreground text-sm lg:text-lg max-w-[600px]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            Visualize your reptile&apos;s complete lineage with our interactive pedigree tree
          </motion.p>
        </div>
        {/* Image */}
        <div className="w-full max-w-4xl relative">
          <div className="relative aspect-[16/9] border w-full rounded-sm shadow-2xl shadow-primary/30 dark:shadow-primary/15 overflow-hidden">
 
           <Image 
              src={theme.theme === 'dark' ? '/featured_dark.png' : '/featured_light.png'}
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
  )
}

export default PedigreeSection

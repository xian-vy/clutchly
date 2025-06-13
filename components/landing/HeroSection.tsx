'use client'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { APP_DESCRIPTION, APP_NAME } from '@/lib/constants/app'
import Image from 'next/image'
import { useTheme } from 'next-themes'

export function HeroSection() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const theme = useTheme()
  const handleNavigation = (path: string) => {
    startTransition(() => {
      router.push(path)
    })
  }

  return (
    <section className="relative !overflow-hidden flex items-center">
      {/* Subtle, random, multi-color green gradient blobs */}
 
      {/* Background grid or effect */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_0%,transparent_50%)]" />
      <div className="max-w-full relative z-10 flex flex-col md:flex-row items-center w-full justify-between gap-12 py-12">
        {/* Left Side */}
        <div className="flex-1 max-w-3xl w-full text-center md:text-left">
          {/* Badge */}
          <motion.div 
            className="relative mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs 3xl:text-sm font-medium text-primary">
              Welcome to {APP_NAME}
            </span>
          </motion.div>
          {/* Headline */}
          <motion.h1 
            className="font-bold tracking-tighter text-4xl xl:text-6xl 2xl:text-[4rem] 3xl:!text-[5rem] text-[#333] dark:text-foreground mb-4 text-center md:text-left"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            The Reptile Data
            <br />
            <span className="text-primary">
              Management Platform
            </span>
          </motion.h1>
          {/* Supporting text */}
          <motion.p 
            className="mt-6 text-base xl:text-lg 3xl:!text-xl text-muted-foreground max-w-lg xl:max-w-2xl mb-8 text-center md:text-left mx-auto md:mx-0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            {APP_DESCRIPTION}
          </motion.p>
          {/* Buttons */}
          <motion.div 
            className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <motion.button
              onClick={() => handleNavigation('/auth/signup')}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-8 py-3 text-sm md:text-base xl:text-lg font-medium text-primary-foreground transition-all hover:bg-primary/90 relative overflow-hidden group cursor-pointer"
              disabled={isPending}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <span className="relative z-10">
                Get Started
                <ArrowRight className="inline-block h-5 w-5 ml-2" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
            </motion.button>
            <motion.button
              onClick={() => handleNavigation('/auth/signin')}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background/50 backdrop-blur-sm px-8 py-3 text-sm md:text-base xl:text-lg font-medium transition-all hover:bg-secondary relative overflow-hidden group cursor-pointer"
              disabled={isPending}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <span className="relative z-10">Sign In</span>
              <div className="absolute inset-0 bg-gradient-to-r from-secondary to-secondary/70 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
            </motion.button>
          </motion.div>
        </div>
        {/* Right Side (Image, cut-off and rounded left only) */}
        <div className="flex-1 flex justify-center md:justify-end items-center w-full relative  3xl:mt-8">
          <div className="relative w-[320px] md:w-[350px] lg:w-[400px] xl:w-[700px] 3xl:!w-[800px] h-[200px] md:h-[500px] lg:h-[400px] xl:h-[550px] 3xl:!h-[700px] border-y border-l overflow-hidden rounded-xl md:rounded-l-xl md:rounded-r-none shadow-2xl shadow-primary/30 dark:shadow-primary/15">
            <Image 
              src={theme.theme === 'dark' ? '/hero_dark.png' : '/hero_light.png'}
              alt="Hero background"
              fill
              priority
              className="object-cover object-left rounded-l-xl"
            />
          </div>
        </div>
      </div>
    </section>
  )
} 
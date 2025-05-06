'use client'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'

export function HeroSection() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleNavigation = (path: string) => {
    startTransition(() => {
      router.push(path)
    })
  }

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--color-primary)/15%_0%,transparent_65%)]" />
      <div className="container relative z-10 py-24 md:py-32">
        <div className="mx-auto max-w-[800px] 3xl:max-w-[900px] text-center">
          <motion.div 
            className="relative mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            {/* <div className="absolute -top-8 left-1/2 -translate-x-1/2">
              <div className="h-[1px] w-32 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            </div> */}
            <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              Welcome to Clutchly
            </span>
          </motion.div>
          <motion.h1 
            className="font-bold tracking-tighter text-4xl md:text-5xl xl:text-6xl 2xl:text-7xl 3xl:!text-[5rem]"
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
          <motion.p 
            className="mt-6 text-base xl:text-lg 2xl:text-xl text-muted-foreground max-w-lg xl:max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            Clutchly simplifies reptile data management, allowing you to effortlessly maintain accurate breeding records, monitor health and growth, and optimize husbandry practices.
          </motion.p>
          <motion.div 
            className="mt-8 flex flex-wrap items-center justify-center gap-4"
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
      </div>
    </section>
  )
} 
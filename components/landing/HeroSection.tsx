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
  const [isSignupPending, startSignupTransition] = useTransition()
  const [isSigninPending, startSigninTransition] = useTransition()
  const theme = useTheme()
  
  const handleSignupNavigation = () => {
    startSignupTransition(() => {
      router.push('/auth/signup')
    })
  }
  
  const handleSigninNavigation = () => {
    startSigninTransition(() => {
      router.push('/auth/signin')
    })
  }

  return (
    <section className="relative !overflow-hidden  min-h-[100dvh] flex flex-col items-center pt-[5vh] lg:pt-0">
 
      {/* Background grid or effect */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_0%,transparent_50%)]" />
      
      <div className="max-w-full relative z-10 flex flex-col lg:flex-row items-center w-full justify-center gap-12  lg:min-h-[100dvh] lg:-mt-[40px]">
        
          {/* Hero Text */}
          <div className="flex-1 max-w-3xl 3xl:!max-w-4xl w-full text-center lg:text-left">
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
                  className="font-extrabold sm:font-bold !leading-[1.1] md:!leading-[1] tracking-tighter text-[2rem] sm:text-[2.5rem] md:text-[3rem] lg:text-4xl xl:text-[3rem] 2xl:text-[3.5rem] 3xl:!text-[4rem] text-[#333] dark:text-foreground mb-4 text-center lg:text-left"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  The Reptile Data
                  <br />
                  <span className="text-[#237050] dark:text-primary">
                    Management Platform
                  </span>
                </motion.h1>
                {/* Supporting text */}
                <motion.p 
                  className="mt-6 text-sm sm:text-base xl:text-lg text-muted-foreground max-w-lg xl:max-w-2xl mb-8 text-center lg:text-left mx-auto lg:mx-0"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  {APP_DESCRIPTION}
                </motion.p>
                {/* Buttons */}
                <motion.div 
                  className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mt-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                >
                  <motion.button
                    onClick={handleSignupNavigation}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-8 py-3 text-sm md:text-base 3xl:!text-lg font-medium text-primary-foreground transition-all hover:bg-primary/90 relative overflow-hidden group cursor-pointer"
                    disabled={isSignupPending}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <span className="relative z-10">
                        Get Started
                        {isSignupPending ? (
                            <svg className="animate-spin h-5 w-5 ml-3 inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ):(
                            <ArrowRight className="inline-block h-5 w-5 ml-2" />
                        )}
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                  </motion.button>
                  <motion.button
                    onClick={handleSigninNavigation}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background/50 backdrop-blur-sm px-8 py-3 text-sm md:text-base 3xl:!text-lg font-medium transition-all hover:bg-secondary relative overflow-hidden group cursor-pointer"
                    disabled={isSigninPending}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <span className="relative z-10 text-foreground/85">
                       Sign In {isSigninPending && 
                       <svg className="animate-spin h-5 w-5 ml-3 inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                       }
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-secondary to-secondary/70 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                  </motion.button>
                </motion.div>
          </div>

          {/* Hero Image */}
          <motion.div
            className="flex-1 flex justify-center lg:justify-end items-center w-full relative"
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6}}
          >
                <div className="relative w-[85vw] lg:w-[500px] xl:w-[600px] 2xl:w-[700px] 3xl:!w-[900px] h-[200px] sm:h-[300px] md:h-[350px] lg:h-[400px] xl:h-[550px] 3xl:!h-[700px] border-y border overflow-hidden rounded-sm lg:rounded-xl lg:border-l lg:border-r-0 lg:rounded-l-xl lg:rounded-r-none shadow-2xl shadow-primary/30 dark:shadow-primary/15">
                  <Image 
                    src={theme.theme === 'dark' ? '/features/hero_dark.png' : '/features/hero_light.png'}
                    alt="Screenshot of Feeding Management for Reptiles and Amphibians"
                    fill
                    priority
                    className="object-cover object-left rounded-l-xl"
                    sizes='(max-width: 1500px) 90vw, 85vw'
                  />
                </div>
          </motion.div>

      </div>
    </section>
  )
} 
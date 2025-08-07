'use client'
import { APP_DESCRIPTION, APP_NAME } from '@/lib/constants/app'
import { AtSign, ChevronUp, Facebook, Github } from 'lucide-react'
import { useTheme } from 'next-themes'
import Image from 'next/image'
import Link from 'next/link'

export function Footer() {
  const { theme } = useTheme()
  
  const handleMoveToTop = () => {
     window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  return (
    <footer className="w-11/12 mx-auto dark:border border-border/90 bg-primary dark:bg-primary/4 px-7 md:px-8 xl:!px-16 py-10 sm:py-12 md:py-16 3xl:!py-20 relative rounded-t-4xl">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,var(--color-primary)/15%_0%,transparent_70%)]" />
      
      <div className="container mx-auto relative flex flex-col items-start">
        {/* Logo and Description */}
        <div className="flex flex-col items-start space-y-4 mb-12 3xl:mb-20 text-center w-full">
          <div className="flex w-full items-center justify-between">
              <div className="flex items-center gap-2 w-full">
                <Image 
                  src={theme === 'dark'? '/logo_dark.png' : '/logo_light.png'} 
                  width={50} 
                  height={50} 
                  alt="clutchly" 
                  className="rounded-full size-8 sm:size-8.5 xl:size-9" 
                />
                <span className="font-semibold text-xl md:text-2xl xl:text-3xl text-white">{APP_NAME}</span>
              </div>
              <button onClick={handleMoveToTop} className="bg-primary/10 dark:bg-primary/5 border border-input/40 dark:border-input/20 rounded-full p-1.5 sm:p-2 md:p-2.5 cursor-pointer">
                  <ChevronUp className="size-3 sm:size-4 text-white dark:text-primary" />
              </button>
          </div>
          <p className="text-sm xl:text-base 3xl:text-lg text-gray-100 text-start max-w-md">
            {APP_DESCRIPTION}
          </p>
        </div>
        
        {/* Links Section */}
        <div className="flex items-center justify-center gap-5 sm:gap-8 mb-6 md:mb-12">
          <Link href="/about" className="text-xs md:text-sm text-white/85 hover:text-primary transition-colors">
            About
          </Link>
          <Link href="/features" className="text-xs md:text-sm text-white/85 hover:text-primary transition-colors">
            Features
          </Link>
          <Link href="/contact" className="text-xs md:text-sm text-white/85 hover:text-primary transition-colors">
            Contact
          </Link>
          <Link href="/privacy" className="text-xs md:text-sm text-white/85 hover:text-primary transition-colors">
            Privacy
          </Link>
          <Link href="/terms" className="text-xs md:text-sm text-white/85 hover:text-primary transition-colors">
            Terms
          </Link>
        </div>
        
       
        <div className='bg-white/20 dark:bg-white/10 h-[0.05rem]  w-full'/>
        <div className="pt-8  w-full text-center flex items-center justify-between">
              {/* Copyright */}
              <p className="text-xs sm:text-sm text-white/85">
                © {new Date().getFullYear()} {APP_NAME}
              </p>
              {/* Social Links */}
            <div className="flex items-center gap-3 sm:gap-4">
              <Link
                href="https://www.facebook.com/xzyian.vy"
                className="p-2 rounded-full bg-white/5 dark:bg-primary/5 group transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-3.5 sm:h-4 sm:w-4 w-3.5 text-white/70 dark:group-hover:text-primary" />
              </Link>
              <Link
                href="https://github.com/xian-vy"
                className="p-2 rounded-full bg-white/5 dark:bg-primary/5 group transition-colors"
                aria-label="GitHub"
              >
                <Github className="h-3.5 sm:h-4 sm:w-4 w-3.5 text-white/70 dark:group-hover:text-primary" />
              </Link>
              <Link
                href="mailto:clutchlyreptilehusbandry@gmail.com"
                className="p-2 rounded-full bg-white/5  dark:bg-primary/5 group transition-colors"
                aria-label="Email"
              >
                <AtSign className="h-3.5 sm:h-4 sm:w-4 w-3.5  text-white/70 dark:group-hover:text-primary" />
              </Link>
        
            </div>
        </div>
      </div>
    </footer>
  )
}
'use client'
import { APP_DESCRIPTION, APP_NAME } from '@/lib/constants/app'
import { AtSign, Facebook, Github } from 'lucide-react'
import { useTheme } from 'next-themes'
import Image from 'next/image'
import Link from 'next/link'

export function Footer() {
  const { theme } = useTheme()
  
  return (
    <footer className="w-full mx-auto border-t border-border/50 bg-[#f0fdf4]/40 dark:bg-background/95  px-4 sm:px-6 lg:px-8 2xl:!px-16 py-16 relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,var(--color-primary)/15%_0%,transparent_70%)]" />
      
      <div className="container mx-auto relative flex flex-col items-center">
        {/* Logo and Description */}
        <div className="flex flex-col items-center space-y-4 mb-12 text-center max-w-md">
          <div className="flex flex-col items-center gap-2">
            <Image 
              src={theme === 'dark'? '/logo_dark.png' : '/logo_light.png'} 
              width={36} 
              height={36} 
              alt="clutchly" 
              className="rounded-full" 
            />
            <span className="font-bold text-xl md:text-2xl xl:text-3xl text-[#333] dark:text-foreground">{APP_NAME}</span>
          </div>
          <p className="text-sm xl:text-base 3xl:text-lg text-muted-foreground">
            {APP_DESCRIPTION}
          </p>
        </div>
        
        {/* Links Section */}
        <div className="flex items-center justify-center gap-8 mb-12">
          <Link href="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            About
          </Link>
          <Link href="/features" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            Features
          </Link>
          <Link href="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            Contact
          </Link>
          <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            Privacy
          </Link>
          <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            Terms
          </Link>
        </div>
        
       
        <hr className='bg-input/20 w-full'/>
        <div className="pt-8  w-full text-center flex items-center justify-between">
              {/* Copyright */}
              <p className="text-xs sm:text-sm text-muted-foreground">
                © {new Date().getFullYear()} {APP_NAME}
              </p>
              {/* Social Links */}
            <div className="flex items-center gap-4">
              <Link
                href="https://www.facebook.com/xzyian.vy"
                className="p-2 rounded-full bg-secondary/30 hover:bg-secondary/80 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4 text-muted-foreground" />
              </Link>
              <Link
                href="https://github.com/xian-vy"
                className="p-2 rounded-full bg-secondary/30 hover:bg-secondary/80 transition-colors"
                aria-label="GitHub"
              >
                <Github className="h-4 w-4  text-muted-foreground" />
              </Link>
              <Link
                href="mailto:clutchlyreptilehusbandry@gmail.com"
                className="p-2 rounded-full bg-secondary/30 hover:bg-secondary/80 transition-colors"
                aria-label="Email"
              >
                <AtSign className="h-4 w-4  text-muted-foreground" />
              </Link>
        
            </div>
        </div>
      </div>
    </footer>
  )
}
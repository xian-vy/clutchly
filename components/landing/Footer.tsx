'use client'
import Link from 'next/link'
import Image from 'next/image'
import { ThemeToggle } from '../theme/ThemeToggle'
import { Github, Facebook, Twitter, Instagram } from 'lucide-react'
import { useTheme } from 'next-themes'
import { APP_NAME } from '@/lib/constants/app'

export function Footer() {
  const { theme } = useTheme()
  
  return (
    <footer className="w-full mx-auto border-t border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 lg:px-10 py-16 relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,var(--color-primary)/15%_0%,transparent_70%)]" />
      
      <div className="container mx-auto relative flex flex-col items-center">
        {/* Logo and Description */}
        <div className="flex flex-col items-center space-y-4 mb-12 text-center max-w-md">
          <div className="flex flex-col items-center gap-2">
            <Image 
              src={theme === 'dark'? '/logo_dark.png' : '/logo_light.png'} 
              width={45} 
              height={45} 
              alt="clutchly" 
              className="rounded-full" 
            />
            <span className="font-bold text-xl md:text-2xl xl:text-3xl">{APP_NAME}</span>
          </div>
          <p className="text-sm xl:text-base 3xl:text-lg text-muted-foreground">
            A comprehensive reptile data management platform for breeders and enthusiasts.
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
          <Link href="/auth/signup" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            Sign Up
          </Link>
        </div>
        
        {/* Social Links */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="#"
            className="p-2 rounded-full bg-secondary/30 hover:bg-secondary/80 transition-colors"
            aria-label="Facebook"
          >
            <Facebook className="h-5 w-5" />
          </Link>
          <Link
            href="#"
            className="p-2 rounded-full bg-secondary/30 hover:bg-secondary/80 transition-colors"
            aria-label="Twitter"
          >
            <Twitter className="h-5 w-5" />
          </Link>
          <Link
            href="#"
            className="p-2 rounded-full bg-secondary/30 hover:bg-secondary/80 transition-colors"
            aria-label="Instagram"
          >
            <Instagram className="h-5 w-5" />
          </Link>
          <Link
            href="#"
            className="p-2 rounded-full bg-secondary/30 hover:bg-secondary/80 transition-colors"
            aria-label="GitHub"
          >
            <Github className="h-5 w-5" />
          </Link>
          <div className="ml-2">
            <ThemeToggle />
          </div>
        </div>
        <hr className='bg-input/20 w-full'/>
        {/* Copyright */}
        <div className="pt-8  w-full max-w-sm text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} {APP_NAME}. Built with ❤️ for the reptile community
          </p>
        </div>
      </div>
    </footer>
  )
}
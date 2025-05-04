'use client'
import Link from 'next/link'
import Image from 'next/image'
import { ThemeToggle } from '../theme/ThemeToggle'
import { Github, Facebook, Twitter, Instagram } from 'lucide-react'
import { useTheme } from 'next-themes'

export function Footer() {
  const { theme } = useTheme()
  
  return (
    <footer className="w-full mx-auto border-t border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 lg:px-10 py-8">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="flex flex-col space-y-4">
            <div className="flex items-center gap-2">
              <Image 
                src={theme === 'dark'? '/logo_dark.png' : '/logo_light.png'} 
                width={37} 
                height={37} 
                alt="clutchly" 
                className="rounded-full" 
              />
              <span className="font-bold text-lg">Clutchly</span>
            </div>
            <p className="text-sm text-muted-foreground">
              A comprehensive reptile data management platform for breeders and enthusiasts.
            </p>
          </div>
          
          {/* Product Links */}
          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Features</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Pricing</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Download</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">FAQ</Link></li>
            </ul>
          </div>
          
          {/* Resources Links */}
          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Documentation</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Blog</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Community</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Support</Link></li>
            </ul>
          </div>
          
          {/* Company Links */}
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">About</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Careers</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Privacy</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Terms</Link></li>
            </ul>
          </div>
        </div>
        
        {/* Bottom Section with Copyright and Social Links */}
        <div className="flex flex-col md:flex-row justify-between items-center mt-8 pt-8 border-t border-border/50">
          <p className="text-sm text-muted-foreground mb-4 md:mb-0">
            © {new Date().getFullYear()} Clutchly. Built with ❤️ for the reptile community
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="#"
              className="p-2 rounded-md hover:bg-secondary/80 transition-colors"
              aria-label="Facebook"
            >
              <Facebook className="h-5 w-5" />
            </Link>
            <Link
              href="#"
              className="p-2 rounded-md hover:bg-secondary/80 transition-colors"
              aria-label="Twitter"
            >
              <Twitter className="h-5 w-5" />
            </Link>
            <Link
              href="#"
              className="p-2 rounded-md hover:bg-secondary/80 transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="h-5 w-5" />
            </Link>
            <Link
              href="#"
              className="p-2 rounded-md hover:bg-secondary/80 transition-colors"
              aria-label="GitHub"
            >
              <Github className="h-5 w-5" />
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </footer>
  )
}
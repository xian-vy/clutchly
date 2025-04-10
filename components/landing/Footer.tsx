import Link from 'next/link'
import { ThemeToggle } from '../theme/ThemeToggle'
import { Github } from 'lucide-react'

export function Footer() {
  return (
    <footer className="w-full mx-auto border-t border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 lg:px-10">
      <div className="container flex h-14 items-center justify-between w-full mx-auto">
        <p className="text-sm text-muted-foreground">
          Built with ❤️ for the reptile community
        </p>
        <div className="flex items-center gap-3">
          <Link
            href="https://github.com/yourusername/herptrack"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-md hover:bg-secondary/80 transition-colors"
            aria-label="GitHub"
          >
            <Github className="h-5 w-5" />
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </footer>
  )
} 
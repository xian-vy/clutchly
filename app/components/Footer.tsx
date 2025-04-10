import Link from 'next/link'
import { Github } from 'lucide-react'

export function Footer() {
  const currentYear = new Date().getFullYear()
  
  const links = {
    product: [
      { name: 'Features', href: '#features' },
      { name: 'Pricing', href: '/pricing' },
      { name: 'Documentation', href: '/docs' },
      { name: 'API', href: '/api-docs' }
    ],
    company: [
      { name: 'About', href: '/about' },
      { name: 'Blog', href: '/blog' },
      { name: 'Careers', href: '/careers' },
      { name: 'Contact', href: '/contact' }
    ],
    legal: [
      { name: 'Privacy', href: '/privacy' },
      { name: 'Terms', href: '/terms' },
      { name: 'License', href: '/license' }
    ]
  }

  return (
    <footer className="border-t border-border/50">
      <div className="container py-16">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="text-2xl font-bold">
              HerpTrack
            </Link>
            <p className="mt-4 text-sm text-muted-foreground max-w-xs">
              The open source platform for reptile breeders and enthusiasts to manage their collections.
            </p>
            <div className="mt-4 flex items-center gap-4">
              <Link
                href="https://github.com/yourusername/herptrack"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Github className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </Link>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Product</h3>
            <ul className="space-y-2">
              {links.product.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Company</h3>
            <ul className="space-y-2">
              {links.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Legal</h3>
            <ul className="space-y-2">
              {links.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-border/50 pt-8 text-center md:flex-row">
          <p className="text-sm text-muted-foreground">
            © {currentYear} HerpTrack. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground">
            Built with ♥️ for the reptile community
          </p>
        </div>
      </div>
    </footer>
  )
} 
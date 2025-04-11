import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--color-primary)/15%_0%,transparent_65%)]" />
      <div className="container relative z-10 py-24 md:py-32">
        <div className="mx-auto max-w-[800px] text-center">
          <div className="relative mb-8">
            <div className="absolute -top-8 left-1/2 -translate-x-1/2">
              <div className="h-[1px] w-32 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            </div>
            <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              Welcome to HerpTrack
            </span>
          </div>
          <h1 className="font-bold tracking-tighter text-4xl md:text-6xl lg:text-7xl">
            The Reptile Data
            <br />
            <span className="text-primary">
              Management Platform
            </span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Create high-quality reptile breeding records with HerpTrack, the open source
            platform that makes reptile data management intuitive.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/auth/signup"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary  px-8 py-3 text-lg font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Get Started
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/auth/signin"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background/50 backdrop-blur-sm px-8 py-3 text-lg font-medium transition-colors hover:bg-secondary"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
} 
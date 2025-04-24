'use client'
import { useRouter } from 'next/navigation'
import { useTransition, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { TopLoader } from '@/components/ui/TopLoader'

export function HeroSection() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isLoading, setIsLoading] = useState(false)

  const handleNavigation = (path: string) => {
    setIsLoading(true)
    startTransition(() => {
      router.push(path)
    })
  }

  return (
    <section className="relative overflow-hidden">
      {isLoading && <TopLoader />}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--color-primary)/15%_0%,transparent_65%)]" />
      <div className="container relative z-10 py-24 md:py-32">
        <div className="mx-auto max-w-[800px] 3xl:max-w-[900px] text-center">
          <div className="relative mb-8">
            <div className="absolute -top-8 left-1/2 -translate-x-1/2">
              <div className="h-[1px] w-32 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            </div>
            <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              Welcome to Clutchly
            </span>
          </div>
          <h1 className="font-bold tracking-tighter text-4xl md:text-5xl xl:text-6xl 2xl:text-7xl 3xl:!text-[5rem]">
            The Reptile Data
            <br />
            <span className="text-primary">
              Management Platform
            </span>
          </h1>
          <p className="mt-6 text-base xl:text-lg 2xl:text-xl text-muted-foreground max-w-2xl mx-auto">
             Create reliable breeding records and manage health, growth, and husbandry with ease—Clutchly makes reptile data management intuitive for keepers and breeders alike.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => handleNavigation('/auth/signup')}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-8 py-3 text-sm md:text-base xl:text-lg font-medium text-primary-foreground transition-all hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98]"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <span className="animate-pulse">Loading...</span>
                </>
              ) : (
                <>
                  Get Started
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
            <button
              onClick={() => handleNavigation('/auth/signin')}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background/50 backdrop-blur-sm px-8 py-3 text-sm md:text-base xl:text-lg font-medium transition-all hover:bg-secondary hover:scale-[1.02] active:scale-[0.98]"
              disabled={isPending}
            >
              {isPending ? 'Loading...' : 'Sign In'}
            </button>
          </div>
        </div>
      </div>
    </section>
  )
} 
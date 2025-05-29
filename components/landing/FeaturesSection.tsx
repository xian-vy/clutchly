'use client'
import { Button } from '@/components/ui/button'
import { ArrowRight} from 'lucide-react'
import Link from 'next/link'
import { FeatureCard } from './FeatureCard'
import PedigreeFeatureCard from './PedigreeFeatureCard'
import { FEATURE_LIST } from '@/lib/constants/features'
import Plans from './Plans'

export function FeaturesSection() {

  // Get only first 3 features for the landing page
  const initialFeatures = FEATURE_LIST.slice(0,3)

  return (
    <section className="container relative py-6 sm:py-16 xl:py-20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--color-primary)/5%_0%,transparent_50%)]" />
      <div className="relative">
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="rounded-full bg-primary/10 px-4 py-1.5 text-xs md:text-sm font-medium text-primary">
            Features
          </span>
          <h2 className="text-center text-2xl lg:text-3xl font-bold tracking-tight xl:text-4xl">
            Everything you need to manage your collection
          </h2>
          <p className="text-muted-foreground text-sm lg:text-lg max-w-[600px]">
            Comprehensive tools designed specifically for reptile breeders and enthusiasts
          </p>
        </div>
        <div className="px-6 md:px-0 mt-10 sm:mt-16 grid gap-3 sm:gap-4 lg:gap-5 xl:gap-7 grid-cols-1 md:grid-cols-3 max-w-[1100px]">
          {initialFeatures.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>

        {/* See All Features Button */}
        <div className="mt-12 flex justify-center z-50">
          <Button 
            asChild
            variant="outline"
            className="group relative px-8 py-3 sm:py-4 lg:py-5 text-lg !bg-background/90 font-medium transition-all hover:bg-primary hover:text-primary-foreground"
          >
            <Link href="/features" className='text-xs md:text-sm'>
              See All Features
              <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>

        {/* Pedigree Feature Showcase */}
        <div className="mt-24 hidden lg:block">
          <div className="flex flex-col items-center gap-4 text-center mb-8">
            <span className="rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              Spotlight Feature
            </span>
            <h2 className="text-center text-xl lg:text-2xl font-bold tracking-tight xl:text-3xl">
              Interactive Pedigree Analysis
            </h2>
            <p className="text-muted-foreground text-sm lg:text-base max-w-[600px]">
              Visualize your reptile&apos;s complete lineage with our interactive pedigree tree
            </p>
          </div>
          <div className="w-full max-w-screen-lg 3xl:!max-w-screen-2xl mx-auto">
            <PedigreeFeatureCard />
          </div>
        </div>

        {/* Subscription Plans */}
        <div className="mt-32 mb-8">
          <div className="flex flex-col items-center gap-4 text-center">
            <span className="rounded-full bg-primary/10 px-4 py-1.5 text-xs md:text-sm font-medium text-primary">
              Pricing
            </span>
            <h2 className="text-center text-2xl lg:text-3xl font-bold tracking-tight xl:text-4xl">
              Choose the right plan for your needs
            </h2>
            <p className="text-muted-foreground text-sm lg:text-lg max-w-[600px]">
              Flexible options for every level of hobbyist, breeder, or professional
            </p>
          </div>

            <Plans />
          
          <div className="mt-10 text-center">
            <p className="text-sm text-muted-foreground">
              All plans include a <span className="font-medium text-foreground">30-day free trial</span>. 
              Need a custom solution? <Link href="/contact" className="text-primary hover:underline">Contact us</Link>.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
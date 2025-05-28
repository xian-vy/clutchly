'use client'
import { Button } from '@/components/ui/button'
import { useScreenSize } from '@/lib/hooks/useScreenSize'
import { cn } from '@/lib/utils'
import { ArrowRight, Check, Zap } from 'lucide-react'
import Link from 'next/link'
import { FeatureCard } from './FeatureCard'
import PedigreeFeatureCard from './PedigreeFeatureCard'
import { FEATURE_LIST, PLANS_LIST } from '@/lib/constants/features'

export function FeaturesSection() {
  const size = useScreenSize()

  // Get only first 3 features for the landing page
  const initialFeatures = FEATURE_LIST.slice(0, size === "mobile" || size === "tablet"  ? 4 : 3)

  return (
    <section className="container relative py-6 sm:py-16 xl:py-20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--color-primary)/5%_0%,transparent_50%)]" />
      <div className="relative">
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="rounded-full bg-primary/10 px-4 py-1.5 text-xs md:text-sm font-medium text-primary">
            Features
          </span>
          <h2 className="text-center text-2xl lg:text-3xl font-bold tracking-tight xl:text-4xl mb-4">
            Everything you need to manage your collection
          </h2>
          <p className="text-muted-foreground text-sm lg:text-lg max-w-[600px]">
            Comprehensive tools designed specifically for reptile breeders and enthusiasts
          </p>
        </div>
        <div className="mt-10 sm:mt-16 grid gap-2 sm:gap-4 md:gap-5 xl:gap-8 lg:gap-10 grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 max-w-[1100px]">
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
            <h2 className="text-center text-2xl lg:text-3xl font-bold tracking-tight xl:text-4xl mb-4">
              Choose the right plan for your needs
            </h2>
            <p className="text-muted-foreground text-sm lg:text-lg max-w-[600px]">
              Flexible options for every level of hobbyist, breeder, or professional
            </p>
          </div>

          <div className="mt-10 sm:mt-16 grid gap-3 sm:gap-6 lg:gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {PLANS_LIST.map((plan) => (
              <div 
                key={plan.id} 
                className={cn(
                  "rounded-xl bg-background transition-all duration-200 hover:shadow-md overflow-hidden",
                  plan.recommended ? 
                    "border-2 border-primary shadow-sm" : 
                    "border border-border"
                )}
              >
                <div className="h-full flex flex-col">
                  {/* Top accent strip */}
                  <div className={cn(
                    "h-1.5 w-full",
                    plan.recommended ? "bg-primary" : "bg-muted"
                  )} />
                  
                  <div className="p-6 flex-1">
                    {plan.badge && (
                      <span className={cn(
                        "text-xs font-medium px-2.5 py-0.5 rounded-full w-fit mb-4 inline-block",
                        plan.recommended ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                      )}>
                        {plan.badge}
                      </span>
                    )}
                    
                    <h3 className="text-xl font-bold">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1 mb-5">
                      {plan.description}
                    </p>
                    
                    <div className="mb-6">
                      <span className="text-3xl font-bold">${plan.price}</span>
                      {plan.price > 0 && (
                        <span className="text-muted-foreground ml-1">/month</span>
                      )}
                    </div>
                    
                    <div className="mb-8 flex-1">
                      <ul className="space-y-3">
                        {plan.features.map((feature, i) => (
                          <li key={i} className="flex text-sm">
                            <Check className="h-5 w-5 text-primary shrink-0 mr-2" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <Button 
                      className={cn(
                        "w-full",
                        plan.recommended 
                          ? "bg-primary hover:bg-primary/90" 
                          : plan.id === 'free'
                            ? "bg-muted hover:bg-muted/80 text-foreground"
                            : "bg-secondary hover:bg-secondary/90"
                      )}
                    >
                      {plan.id === 'free' ? 'Get Started Free' : 'Choose Plan'}
                      <Zap className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-10 text-center">
            <p className="text-sm text-muted-foreground">
              All plans include a <span className="font-medium text-foreground">30-day free trial</span>. 
              Need a custom solution? <a href="#" className="text-primary hover:underline">Contact us</a>.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
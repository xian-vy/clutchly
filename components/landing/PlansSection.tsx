'use client'
import { PLANS_LIST } from '@/lib/constants/features'
import { cn } from '@/lib/utils'
import { Check, ChevronLeft, ChevronRight, Zap } from 'lucide-react'
import React, { useState } from 'react'
import { Button } from '../ui/button'

const PlansSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0)

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % PLANS_LIST.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + PLANS_LIST.length) % PLANS_LIST.length)
  }

  return (
    <div className="mt-32 mb-8">
    <div className="flex flex-col items-center gap-4 text-center">
      <span className="rounded-full bg-primary/10 px-4 py-1.5 text-xs md:text-sm font-medium text-primary">
        Pricing
      </span>
      <h2 className="text-center text-2xl lg:text-3xl font-bold tracking-tight xl:text-4xl text-[#333] dark:text-foreground">
        Choose the right plan for your needs
      </h2>
      <p className="text-muted-foreground text-sm lg:text-lg max-w-[600px]">
        Flexible options for every level of hobbyist, breeder, or professional
      </p>
    </div>
    <div className="relative max-w-[340px] md:max-w-[400px] lg:max-w-full mx-auto mt-10 sm:mt-16">
      {/* Mobile Carousel (hidden on lg screens) */}
      <div className="lg:hidden">
        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-1 sm:-left-10 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-background/80 hover:bg-background p-2 rounded-full shadow-md border border-border"
          aria-label="Previous plan"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-1 sm:-right-10 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-background/80 hover:bg-background p-2 rounded-full shadow-md border border-border"
          aria-label="Next plan"
        >
          <ChevronRight className="h-6 w-6" />
        </button>

        {/* Carousel Container */}
        <div className="overflow-hidden">
          <div 
            className="flex transition-transform duration-300 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {PLANS_LIST.map((plan) => (
              <div 
                key={plan.id} 
                className="w-full flex-shrink-0 px-4"
              >
                <PlanCard plan={plan} />
              </div>
            ))}
          </div>
        </div>

        {/* Dots indicator */}
        <div className="flex justify-center gap-2 mt-10">
          {PLANS_LIST.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                currentIndex === index ? "bg-primary w-4" : "bg-muted"
              )}
              aria-label={`Go to plan ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Desktop Grid (hidden on mobile) */}
      <div className="hidden lg:grid grid-cols-3 md:gap-3 lg:gap-5 xl:gap-7">
        {PLANS_LIST.map((plan) => (
          <PlanCard key={plan.id} plan={plan} />
        ))}
      </div>
    </div>
    </div>
  )
}

// Extracted PlanCard component for reuse
const PlanCard = ({ plan }: { plan: typeof PLANS_LIST[0] }) => (
  <div className={cn(
    "rounded-xl bg-background transition-all duration-200 hover:shadow-md overflow-hidden",
    plan.recommended ? 
      "border-2 border-primary shadow-sm" : 
      "border border-border"
  )}>
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
        
        <h3 className="text-xl font-bold text-[#333] dark:text-foreground">{plan.name}</h3>
        <p className="text-sm text-muted-foreground mt-1 mb-5">
          {plan.description}
        </p>
        
        <div className="mb-6">
          <span className="text-3xl font-bold text-[#333] dark:text-foreground">${plan.price}</span>
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
            
                : "bg-secondary text-black hover:bg-secondary/90"
          )}
        >
          {'Choose Plan'}
          <Zap className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  </div>
)

export default PlansSection

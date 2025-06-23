'use client'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import CatalogSection from './CatalogSection'
import PedigreeSection from './PedigreeSection'
import DataManagementSection from './DataManagement'

export function FeaturesSection() {
  
  return (
    <section className="relative py-16 sm:py-24 ">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--color-primary)/5%_0%,transparent_50%)]" />

      <div className="flex flex-col gap-8 lg:gap-16 3xl:gap-20">
        <CatalogSection />
        <PedigreeSection/>
        <DataManagementSection />
     </div>
      {/* See All Features Button */}
      <div className="mt-12 flex justify-center z-50">
        <Button
          asChild
          variant="outline"
          size="lg"
          className="group relative text-lg font-medium transition-all hover:bg-primary hover:text-primary-foreground"
        >
          <Link href="/features" className="text-xs md:text-sm hover:!text-foreground">
            See All Features
            <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </div>
    </section>
  )
}
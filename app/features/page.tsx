
import { FeatureCard } from '@/components/landing/FeatureCard'
import { features } from '@/components/landing/FeaturesSection'
import { Footer } from '@/components/landing/Footer'
import TopNavigation from '@/components/landing/TopNavigation'

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-background pt-16">
       <TopNavigation />

      <div className="fixed inset-0 -z-10 h-full w-full bg-white dark:bg-[#030619]">
        <div className="absolute inset-0 
          bg-[linear-gradient(to_right,#fbfffc_1px,transparent_1px),linear-gradient(to_bottom,#fbfffc_1px,transparent_1px)] 
          dark:bg-[linear-gradient(to_right,#0A0E22_1px,transparent_1px),linear-gradient(to_bottom,#0A0E22_1px,transparent_1px)]
          bg-[size:24px_24px]" />
        <div className="absolute hidden dark:block left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 opacity-50 blur-[100px]" />
      </div>

      <main className="container py-12 sm:py-16 px-4 mx-auto">

        {/* Header */}
        <div className="flex flex-col items-center gap-4 text-center mb-16">
          <span className="rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            All Features
          </span>
          <h1 className="text-2xl lg:text-3xl xl:text-4xl max-w-2xl font-bold tracking-tight">
                Everything you need to manage your collection
          </h1>
          <p className="text-muted-foreground text-lg max-w-[600px] mt-2">
            Discover all the powerful tools and features designed to help you manage your reptile collection effectively
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid gap-6 sm:gap-8 lg:gap-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-[1200px] mx-auto">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </main>
      <Footer />
    </div>
  )
}

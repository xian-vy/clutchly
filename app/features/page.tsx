
import { FeatureCard } from '@/components/landing/features/FeatureCard'
import { Footer } from '@/components/landing/Footer'
import TopNavigation from '@/components/landing/TopNavigation'
import { FEATURE_LIST } from '@/lib/constants/features'

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
          <span className="rounded-full bg-primary/10 px-4 py-1.5 text-xs sm:text-sm font-medium text-primary">
            All Features
          </span>
          <div className="space-y-1.5">
              <h1 className="text-2xl lg:text-3xl 3xl:!text-4xl max-w-2xl font-bold tracking-tight text-[#333] dark:text-foreground">
                    Everything you need to manage your collection
              </h1>
              <p className="text-muted-foreground text-base sm:text-base 3xl:!text-lg px-4 max-w-[600px] mt-2">
                Discover all the powerful tools and features designed to help you manage your reptile collection effectively
              </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid gap-3 sm:gap-4 lg:gap-5 xl:gap-6 grid-cols-2  lg:grid-cols-3 3xl:!grid-cols-4 max-w-screen-lg 3xl:!max-w-screen-xl mx-auto">
          {FEATURE_LIST.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </main>
      <Footer />
    </div>
  )
}

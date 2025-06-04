import { Footer } from '@/components/landing/Footer'
import { HeroSection } from '@/components/landing/HeroSection'
import { FeaturesSection } from '@/components/landing/FeaturesSection'
import TopNavigation from '@/components/landing/TopNavigation'
import PlansSection from '@/components/landing/PlansSection'
import PedigreeSection from '@/components/landing/PedigreeSection'
import { FAQSection } from '@/components/landing/FAQSection'

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col  pt-16">
    <TopNavigation />

      <div className="fixed inset-0 -z-10 h-full w-full bg-[#f0fdf4]/30 dark:bg-[#030619]">
        <div className="absolute inset-0 
        bg-[linear-gradient(to_right,#fbfffc_1px,transparent_1px),linear-gradient(to_bottom,#fbfffc_1px,transparent_1px)] 
        dark:bg-[linear-gradient(to_right,#0A0E22_1px,transparent_1px),linear-gradient(to_bottom,#0A0E22_1px,transparent_1px)]
        bg-[size:24px_24px]" />
        <div className="absolute hidden dark:block left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 opacity-50 blur-[100px]" />
      </div>

      <main className="flex-1 px-4 sm:px-8 mx-auto">
        <HeroSection />
        <FeaturesSection />
        <PedigreeSection />
        <PlansSection />
        <FAQSection />
      </main>

      <Footer />
    </div>
  )
}

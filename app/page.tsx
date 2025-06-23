import { FAQSection } from '@/components/landing/FAQSection'
import { FeaturesSection } from '@/components/landing/features'
import { Footer } from '@/components/landing/Footer'
import { HeroSection } from '@/components/landing/HeroSection'
import PlansSection from '@/components/landing/PlansSection'
import TopNavigation from '@/components/landing/TopNavigation'

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col  pt-16 ">
    <TopNavigation />

      <main className='flex-1'>
        <div className="px-4 lg:pr-0 lg:pl-[5%] 2xl:pl-[8%] 3xl:!pl-[12%]">
           <HeroSection />
        </div>
        <div className="mx-auto w-full px-4 md:px-8">
            <FeaturesSection />
            <PlansSection />
            <FAQSection />
        </div>
      </main>

      <Footer />
    </div>
  )
}

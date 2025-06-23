import { Footer } from '@/components/landing/Footer'
import TopNavigation from '@/components/landing/TopNavigation'
import Link from 'next/link'

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-background pt-16">
      <TopNavigation />

      {/* Background Pattern */}
      <div className="fixed inset-0 -z-10 h-full w-full bg-white dark:bg-[#030619]">
        <div className="absolute inset-0 
          bg-[linear-gradient(to_right,#fbfffc_1px,transparent_1px),linear-gradient(to_bottom,#fbfffc_1px,transparent_1px)] 
          dark:bg-[linear-gradient(to_right,#0A0E22_1px,transparent_1px),linear-gradient(to_bottom,#0A0E22_1px,transparent_1px)]
          bg-[size:24px_24px]" />
        <div className="absolute hidden dark:block left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 opacity-50 blur-[100px]" />
      </div>

      <main className="container py-12 sm:py-16 px-4 mx-auto">
        {/* Header */}
        <div className="flex flex-col items-center gap-4 text-center mb-8">
          <span className="rounded-full bg-primary/10 px-4 py-1.5 text-xs sm:text-sm font-medium text-primary">
            About Us
          </span>
          <div className="space-y-1.5">
              <h1 className="text-2xl lg:text-3xl 3xl:!text-4xl max-w-2xl font-bold tracking-tight text-[#333] dark:text-foreground">
                Empowering Reptile Enthusiasts
              </h1>
              <p className="text-muted-foreground text-base sm:text-base 3xl:!text-lg px-4  max-w-[600px] mt-2">
                Revolutionizing how reptile enthusiasts manage and track their collections with innovative solutions
              </p>
          </div>
        </div>

        {/* Mission Section */}
        <div className="max-w-[800px] mx-auto mb-8">
          <div className=" bg-card p-8">
            <div className="space-y-6">
              <p className="text-base text-muted-foreground text-center max-w-[600px] mx-auto">
                At Clutchly, we&apos;re dedicated to revolutionizing how reptile enthusiasts manage and track their collections. 
                Whether you&apos;re a professional breeder or a passionate hobbyist, Clutchly provides the tools you need 
                to maintain detailed records, track breeding programs, and more.
              </p>
            </div>
          </div>
        </div>

       

        {/* CTA Section */}
        <div className="max-w-[800px] mx-auto text-center">
          <div className=" bg-card p-8">
            <h2 className="text-2xl font-semibold tracking-tight mb-4 text-[#333] dark:text-foreground">
              Ready to Get Started?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-[600px] mx-auto">
              Join our community of reptile enthusiasts and take your collection management to the next level.
            </p>
            <Link
              href="/auth/signup"
              className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
            >
              Sign Up Now
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default AboutPage

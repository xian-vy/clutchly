import { Footer } from '@/components/landing/Footer'
import TopNavigation from '@/components/landing/TopNavigation'
import { Mail, MapPin } from 'lucide-react'
import { PiDiscordLogo } from 'react-icons/pi'

const ContactPage = () => {
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
        <div className="flex flex-col items-center gap-4 text-center mb-12">
          <span className="rounded-full bg-primary/10 px-4 py-1.5 text-xs sm:text-sm font-medium text-primary">
            Get in Touch
          </span>
          <h1 className="text-2xl lg:text-3xl xl:text-4xl max-w-2xl font-bold tracking-tight">
            Contact Us
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg px-4 max-w-[600px] mt-2">
            Have questions? We&apos;d love to hear from you. Send us a message and we&apos;ll respond as soon as possible.
          </p>
        </div>

        <div className="grid grid-cols-1  gap-8 max-w-6xl mx-auto">
          {/* Contact Information */}
          <div className="space-y-8">
            <div className="bg-card p-8 rounded-lg">
              <h2 className="text-xl font-semibold mb-6">Contact Information</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <Mail className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <h3 className="font-medium">Email</h3>
                    <p className="text-muted-foreground">xianvy0000@gmail.com.com</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <PiDiscordLogo className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <h3 className="font-medium">Discord</h3>
                    <p className="text-muted-foreground">discord.gg/crispysnowflake. </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <MapPin className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <h3 className="font-medium">Location</h3>
                    <p className="text-muted-foreground">Laguna, Philippines</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-card p-8 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Business Hours</h2>
              <div className="space-y-2 text-muted-foreground">
                <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                <p>Saturday: 10:00 AM - 4:00 PM</p>
                <p>Sunday: 10:00 AM - 1:00 PM</p>
              </div>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  )
}

export default ContactPage

'use client'
import { Footer } from '@/components/landing/Footer'
import TopNavigation from '@/components/landing/TopNavigation'
import { Globe,  SquareArrowOutUpRight } from 'lucide-react'
import { PiDiscordLogo, PiMessengerLogo } from "react-icons/pi";
import Link from 'next/link';

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

      <main className="container py-12 sm:py-16 px-6 mx-auto">
        {/* Header */}
        <div className="flex flex-col items-center gap-4 text-center mb-12">
          <span className="rounded-full bg-primary/10 px-4 py-1.5 text-xs sm:text-sm font-medium text-primary">
            Get in Touch
          </span>
          <div className="space-y-1.5">
              <h1 className="text-2xl lg:text-3xl 3xl:!text-4xl max-w-2xl font-bold tracking-tight text-[#333] dark:text-foreground">
                Connect With Us
              </h1>
              <p className="text-muted-foreground text-base sm:text-base 3xl:!text-lg px-4 max-w-[600px] mt-2">
                Have questions? We&apos;d love to hear from you. Send us a message and we&apos;ll respond as soon as possible.
              </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 max-w-xl mx-auto md:mb-10">
                <div className="space-y-6">
                  <div className="flex items-center gap-4 group">
                    <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <Globe className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-sm text-muted-foreground">Website</h3>
                      <p className="text-[0.8rem] sm:text-sm xl:text-base text-foreground hover:text-primary transition-colors">
                          xianvy.vercel.app
                      </p>
                    </div>
                    <Link href="https://xianvy.vercel.app" target='_blank' >
                      <SquareArrowOutUpRight className='size-4 text-foreground/85' />
                    </Link>
                  </div>
                  <div className="flex items-center gap-4 group">
                    <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <PiDiscordLogo className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-sm text-muted-foreground">Discord</h3>
                      <p className="text-[0.8rem] sm:text-sm xl:text-base text-foreground hover:text-primary transition-colors">discord.gg/crispysnowflake.</p>
                    </div>
                    <Link href="https://discord.gg/crispysnowflake." target='_blank' >
                      <SquareArrowOutUpRight className='size-4 text-foreground/85' />
                    </Link>
                  </div>
                  <div className="flex items-center gap-4 group">
                    <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <PiMessengerLogo className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-sm text-muted-foreground">Messenger</h3>
                      <p className="text-[0.8rem] sm:text-sm xl:text-base text-foreground hover:text-primary transition-colors">facebook.com/xzyian.vy</p>
                    </div>
                    <Link href="https://facebook.com/xzyian.vy" target='_blank' >
                      <SquareArrowOutUpRight className='size-4 text-foreground/85' />
                    </Link>
                  </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default ContactPage

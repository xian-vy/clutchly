'use client'
import { Footer } from '@/components/landing/Footer'
import TopNavigation from '@/components/landing/TopNavigation'
import { Mail, Copy, Check } from 'lucide-react'
import { PiDiscordLogo, PiMessengerLogo } from "react-icons/pi";
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

const ContactPage = () => {
  const [copiedStates, setCopiedStates] = useState({
    email: false,
    messenger: false,
    discord: false
  });

  const handleCopy = async (text: string, type: 'email' | 'messenger' | 'discord') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedStates({ ...copiedStates, [type]: true });
      toast.success("Copied to clipboard!");
      
      setTimeout(() => {
        setCopiedStates({ ...copiedStates, [type]: false });
      }, 1000);
    } catch (error) {
      console.error("Failed to copy text:", error);
      toast.error("Failed to copy. Please try again.");
    }
  };

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
          <h1 className="text-2xl lg:text-3xl xl:text-4xl max-w-2xl font-bold tracking-tight text-[#333] dark:text-foreground">
            Connect With Us
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg px-4 max-w-[600px] mt-2">
            Have questions? We&apos;d love to hear from you. Send us a message and we&apos;ll respond as soon as possible.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 max-w-xl mx-auto md:mb-10">
                <div className="space-y-6">
                  <div className="flex items-start gap-4 group">
                    <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-sm text-muted-foreground">Email</h3>
                      <p className="text-foreground hover:text-primary transition-colors">clutchlyreptilehusbandry@gmail.com</p>
                    </div>
                    <Button 
                      onClick={() => handleCopy("clutchlyreptilehusbandry@gmail.com", "email")} 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                    >
                      {copiedStates.email ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <div className="flex items-start gap-4 group">
                    <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <PiDiscordLogo className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-sm text-muted-foreground">Discord</h3>
                      <p className="text-foreground hover:text-primary transition-colors">discord.gg/crispysnowflake.</p>
                    </div>
                    <Button 
                      onClick={() => handleCopy("discord.gg/crispysnowflake.", "discord")} 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                    >
                      {copiedStates.discord ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <div className="flex items-start gap-4 group">
                    <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <PiMessengerLogo className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-sm text-muted-foreground">Messenger</h3>
                      <p className="text-foreground hover:text-primary transition-colors">facebook.com/xzyian.vy</p>
                    </div>
                    <Button 
                      onClick={() => handleCopy("facebook.com/xzyian.vy", "messenger")} 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                    >
                      {copiedStates.messenger ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default ContactPage

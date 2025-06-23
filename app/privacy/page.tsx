import React from 'react'
import { Footer } from '@/components/landing/Footer'
import TopNavigation from '@/components/landing/TopNavigation'
import Link from 'next/link'

const PrivacyPage = () => {
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
            Privacy
          </span>
          <h1 className="text-2xl lg:text-3xl 3xl:!text-4xl max-w-2xl font-bold tracking-tight text-[#333] dark:text-foreground">
            Privacy Policy
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg px-4 max-w-[600px] mt-2">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Introduction */}
        <div className="max-w-[800px] mx-auto mb-8">
          <div className="bg-card p-8">
            <div className="space-y-6">
              <p className="text-base text-muted-foreground text-center">
                At Clutchly, we respect your privacy and are committed to protecting your personal information. 
                This Privacy Policy explains how we collect, use, and safeguard your data when you use our reptile 
                husbandry management platform.
              </p>
            </div>
          </div>
        </div>

        {/* Information We Collect */}
        <div className="max-w-[800px] mx-auto mb-8">
          <div className="bg-card p-8">
            <h2 className="text-xl font-semibold mb-4 text-[#333] dark:text-foreground">1. Information We Collect</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2 text-[#333] dark:text-foreground">Account Information</h3>
                <p className="text-base text-muted-foreground">
                  When you create an account, we collect your email address and any additional information you provide 
                  during registration or profile setup.
                </p>
              </div>
              <div>
                <h3 className="font-medium mb-2 text-[#333] dark:text-foreground">Usage Data</h3>
                <p className="text-base text-muted-foreground">
                  We collect information about how you use our platform, including the features you access and 
                  the data you input for managing your reptile collections.
                </p>
              </div>
              <div>
                <h3 className="font-medium mb-2 text-[#333] dark:text-foreground">Content You Provide</h3>
                <p className="text-base text-muted-foreground">
                  This includes reptile information, breeding records, health data, and any other content you 
                  add to your account.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* How We Use Your Information */}
        <div className="max-w-[800px] mx-auto mb-8">
          <div className="bg-card p-8">
            <h2 className="text-xl font-semibold mb-4 text-[#333] dark:text-foreground">2. How We Use Your Information</h2>
            <ul className="text-base text-muted-foreground space-y-2 ml-4">
              <li>• To provide and maintain our reptile management services</li>
              <li>• To authenticate your account and ensure security</li>
              <li>• To process your requests and provide customer support</li>
              <li>• To improve our platform and develop new features</li>
              <li>• To communicate with you about your account or our services</li>
            </ul>
          </div>
        </div>

        {/* Data Storage and Security */}
        <div className="max-w-[800px] mx-auto mb-8">
          <div className="bg-card p-8">
            <h2 className="text-xl font-semibold mb-4 text-[#333] dark:text-foreground">3. Data Storage and Security</h2>
            <div className="space-y-4">
              <p className="text-base text-muted-foreground">
                Your data is stored securely using Supabase, a trusted cloud database service. We implement 
                security measures to protect your information, including:
              </p>
              <ul className="text-base text-muted-foreground space-y-2 ml-4">
                <li>• Secure authentication through Supabase Auth</li>
                <li>• Regular security updates and monitoring</li>
                <li>• Access controls and user permissions</li>
                <li>• Industry-standard security practices</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Third-Party Services */}
        <div className="max-w-[800px] mx-auto mb-8">
          <div className="bg-card p-8">
            <h2 className="text-xl font-semibold mb-4 text-[#333] dark:text-foreground">4. Third-Party Services</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2 text-[#333] dark:text-foreground">Supabase</h3>
                <p className="text-base text-muted-foreground">
                  We use Supabase for user authentication and database storage. Supabase processes your data 
                  according to their privacy policy and security standards.
                </p>
              </div>
              <div>
                <h3 className="font-medium mb-2 text-[#333] dark:text-foreground">Vercel</h3>
                <p className="text-base text-muted-foreground">
                  Our platform is hosted on Vercel. Vercel may collect basic usage data for hosting purposes, 
                  but does not have access to your personal information stored in our database.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* No Advertising or Analytics */}
        <div className="max-w-[800px] mx-auto mb-8">
          <div className="bg-card p-8">
            <h2 className="text-xl font-semibold mb-4 text-[#333] dark:text-foreground">5. No Advertising or Analytics</h2>
            <p className="text-base text-muted-foreground">
              We do not display advertisements on our platform, nor do we use third-party analytics services 
              to track your behavior. We do not sell your personal information to advertisers or third parties.
            </p>
          </div>
        </div>

        {/* Data Retention */}
        <div className="max-w-[800px] mx-auto mb-8">
          <div className="bg-card p-8">
            <h2 className="text-xl font-semibold mb-4 text-[#333] dark:text-foreground">6. Data Retention</h2>
            <p className="text-base text-muted-foreground">
              We retain your data for as long as your account is active or as needed to provide our services. 
              You can delete your account at any time, which will permanently remove your data from our systems.
            </p>
          </div>
        </div>

        {/* Your Rights */}
        <div className="max-w-[800px] mx-auto mb-8">
          <div className="bg-card p-8">
            <h2 className="text-xl font-semibold mb-4 text-[#333] dark:text-foreground">7. Your Rights</h2>
            <ul className="text-base text-muted-foreground space-y-2 ml-4">
              <li>• Access and view your personal data</li>
              <li>• Update or correct your information</li>
              <li>• Delete your account and associated data</li>
              <li>• Export your data in a portable format</li>
              <li>• Contact us with privacy-related questions</li>
            </ul>
          </div>
        </div>

        {/* Contact Information */}
        <div className="max-w-[800px] mx-auto mb-8">
          <div className="bg-card p-8">
            <h2 className="text-xl font-semibold mb-4 text-[#333] dark:text-foreground">8. Contact Us</h2>
            <p className="text-base text-muted-foreground">
              If you have any questions about this Privacy Policy or how we handle your data, please contact us 
              through our <Link href="/contact" className="text-primary underline">Contact Page</Link>.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-[800px] mx-auto text-center">
          <div className="bg-card p-8">
            <h2 className="text-2xl font-semibold tracking-tight mb-4 text-[#333] dark:text-foreground">
              Questions About Privacy?
            </h2>
            <p className="text-muted-foreground mb-8">
              We&apos;re committed to transparency and protecting your privacy. Reach out if you need clarification.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default PrivacyPage 
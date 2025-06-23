import React from 'react'
import { Footer } from '@/components/landing/Footer'
import TopNavigation from '@/components/landing/TopNavigation'
import Link from 'next/link'

const TermsOfServicePage = () => {
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
            Legal
          </span>
          <h1 className="text-2xl lg:text-3xl 3xl:!text-4xl max-w-2xl font-bold tracking-tight text-[#333] dark:text-foreground">
            Terms of Service
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg px-4 max-w-[600px] mt-2">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Terms Content */}
        <div className="max-w-[800px] mx-auto mb-8">
          <div className="bg-card p-8">
            <div className="space-y-6">
              <p className="text-base text-muted-foreground text-center">
                These Terms of Service (&ldquo;Terms&rdquo;) govern your use of Clutchly, a reptile husbandry management platform. 
                By using our service, you agree to these terms.
              </p>
            </div>
          </div>
        </div>

        {/* Service Description */}
        <div className="max-w-[800px] mx-auto mb-8">
          <div className="bg-card p-8">
            <h2 className="text-xl font-semibold mb-4 text-[#333] dark:text-foreground">1. Service Description</h2>
            <p className="text-base text-muted-foreground">
              Clutchly is a free listing service for reptile keepers and breeders. We provide a platform for users to 
              manage their reptile collections and list animals for sale, but we do not facilitate or process any transactions.
            </p>
          </div>
        </div>

        {/* User Responsibilities */}
        <div className="max-w-[800px] mx-auto mb-8">
          <div className="bg-card p-8">
            <h2 className="text-xl font-semibold mb-4 text-[#333] dark:text-foreground">2. User Responsibilities</h2>
            <ul className="text-base text-muted-foreground space-y-2 ml-4">
              <li>• You are solely responsible for the accuracy and legality of all content you post</li>
              <li>• You must comply with all applicable wildlife laws, including RA 9147 and other relevant regulations</li>
              <li>• You are responsible for all communications and transactions with potential buyers</li>
              <li>• You must ensure you have the legal right to sell any animals you list</li>
              <li>• You are responsible for maintaining the security of your account</li>
            </ul>
          </div>
        </div>

        {/* No Transaction Processing */}
        <div className="max-w-[800px] mx-auto mb-8">
          <div className="bg-card p-8">
            <h2 className="text-xl font-semibold mb-4 text-[#333] dark:text-foreground">3. No Transaction Processing</h2>
            <p className="text-base text-muted-foreground">
              Clutchly does not process, facilitate, or handle any financial transactions between users. 
              All sales negotiations, payments, and transactions are conducted directly between buyers and sellers. 
              We are not responsible for any disputes, refunds, or issues arising from transactions.
            </p>
          </div>
        </div>

        {/* No Legal Verification */}
        <div className="max-w-[800px] mx-auto mb-8">
          <div className="bg-card p-8">
            <h2 className="text-xl font-semibold mb-4 text-[#333] dark:text-foreground">4. No Legal Verification</h2>
            <p className="text-base text-muted-foreground">
              We do not verify the legality of animals listed on our platform. Users are responsible for ensuring 
              compliance with all applicable laws and regulations. We cannot guarantee that any listing is legal 
              in your jurisdiction.
            </p>
          </div>
        </div>

        {/* Content Moderation */}
        <div className="max-w-[800px] mx-auto mb-8">
          <div className="bg-card p-8">
            <h2 className="text-xl font-semibold mb-4 text-[#333] dark:text-foreground">5. Content Moderation</h2>
            <p className="text-base text-muted-foreground">
              We reserve the right to remove any listings, content, or user accounts at our sole discretion, 
              without prior notice. This includes but is not limited to content that violates laws, our policies, 
              or is deemed inappropriate.
            </p>
          </div>
        </div>

        {/* Limitation of Liability */}
        <div className="max-w-[800px] mx-auto mb-8">
          <div className="bg-card p-8">
            <h2 className="text-xl font-semibold mb-4 text-[#333] dark:text-foreground">6. Limitation of Liability</h2>
            <p className="text-base text-muted-foreground">
              Clutchly is provided &ldquo;as is&rdquo; without warranties. We are not liable for any damages arising from 
              your use of the service, including but not limited to financial losses, legal issues, or disputes 
              between users.
            </p>
          </div>
        </div>

        {/* Contact Information */}
        <div className="max-w-[800px] mx-auto mb-8">
          <div className="bg-card p-8">
            <h2 className="text-xl font-semibold mb-4 text-[#333] dark:text-foreground">7. Contact Information</h2>
            <p className="text-base text-muted-foreground">
              If you believe a listing violates the law or our terms, please contact us through our 
              <Link href="/contact" className="text-primary underline ml-1">Contact Page</Link>. 
              We will review reports and take appropriate action as needed.
            </p>
          </div>
        </div>

        {/* Acknowledgment */}
        <div className="max-w-[800px] mx-auto mb-8">
          <div className="bg-card p-8">
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-base text-muted-foreground text-center">
                <strong>By using Clutchly, you acknowledge that you have read, understood, and agree to these Terms of Service.</strong>
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-[800px] mx-auto text-center">
          <div className="bg-card p-8">
            <h2 className="text-2xl font-semibold tracking-tight mb-4 text-[#333] dark:text-foreground">
              Questions About Our Terms?
            </h2>
            <p className="text-muted-foreground mb-8">
              If you have any questions about these terms, please don&apos;t hesitate to reach out to us.
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

export default TermsOfServicePage
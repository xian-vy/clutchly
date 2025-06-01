'use client'
import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

const faqs = [
  {
    question: "What makes Clutchly different from other reptile management apps?",
    answer: "Clutchly offers a comprehensive suite of features specifically designed for reptile breeders and enthusiasts. Our platform combines advanced data management, AI-assisted breeding predictions, detailed health tracking, and complete sales management in one intuitive interface. Plus, we provide a free customizable website for your store."
  },
  {
    question: "Can I manage multiple users within my facility?",
    answer: "Yes! Clutchly's Organization Management feature allows you to create multiple user accounts with customizable permissions. You can control access to specific areas like finance, feeding, growth tracking, breeding records, and more, making it perfect for both individual breeders and larger facilities."
  },
  {
    question: "What kind of health and growth tracking features are available?",
    answer: "Clutchly provides comprehensive health tracking including shedding management, behavior monitoring, and health event logging. Our growth tracking system allows you to record measurements and visualize trends with intuitive charts. You can also generate detailed PDF certificates for each reptile, including their health history and lineage information."
  },
  {
    question: "How does the enclosure and feeding management system work?",
    answer: "Our enclosure management system uses a customizable room-rack-enclosure hierarchy for streamlined organization. The feeding schedule feature allows you to set up flexible feeding routines for selected reptiles or by room/rack, with batch entry capabilities for efficient management."
  },
]

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section className="container relative py-6 sm:py-16 xl:py-20">
      <div className="relative">
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="rounded-full bg-primary/10 px-4 py-1.5 text-xs md:text-sm font-medium text-primary">
            FAQ
          </span>
          <h2 className="text-center text-2xl lg:text-3xl font-bold tracking-tight xl:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground text-sm lg:text-lg max-w-[600px]">
            Everything you need to know about Clutchly
          </p>
        </div>

        <div className="mt-10 max-w-3xl mx-auto">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border-b border-border last:border-0"
            >
              <button
                className="flex w-full items-center justify-between py-4 text-left"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span className="text-base font-medium">{faq.question}</span>
                <ChevronDown
                  className={cn(
                    "h-5 w-5 text-muted-foreground transition-transform",
                    openIndex === index && "rotate-180"
                  )}
                />
              </button>
              <div
                className={cn(
                  "grid transition-all duration-200",
                  openIndex === index
                    ? "grid-rows-[1fr] pb-4"
                    : "grid-rows-[0fr]"
                )}
              >
                <div className="overflow-hidden">
                  <p className="text-muted-foreground text-sm">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
} 
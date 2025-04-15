import { Database, Dna, Heart, LineChart } from 'lucide-react'
import { FeatureCard } from './FeatureCard'

export function FeaturesSection() {
  const features = [
    {
      icon: Database,
      title: 'Morph & Biological Data',
      features: [
        'Advanced genetic tracking and inheritance patterns',
        'Complete lineage and acquisition history',
        'Comprehensive health status monitoring',
        'High-quality photo documentation system'
      ]
    },
    {
      icon: Heart,
      title: 'Health Management',
      features: [
        'Automated vet visit scheduling and alerts',
        'Medication tracking with smart reminders',
        'Detailed shedding and behavior monitoring',
        'Customizable feeding schedule management'
      ]
    },
    {
      icon: LineChart,
      title: 'Growth Analytics',
      features: [
        'Advanced measurement tracking system',
        'AI-powered photo progress analysis',
        'Interactive growth trend visualization',
        'Comparative species benchmarking'
      ]
    },
    {
      icon: Dna,
      title: 'Breeding Management',
      features: [
        'AI-driven breeding compatibility analysis',
        'Advanced clutch tracking system',
        'Environmental parameter optimization',
        'Comprehensive breeding success metrics'
      ]
    }
  ]

  return (
    <section className="container relative py-24">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--color-primary)/5%_0%,transparent_50%)]" />
      <div className="relative">
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            Features
          </span>
          <h2 className="text-center text-2xl lg:text-3xl font-bold tracking-tight xl:text-4xl mb-4">
            Everything you need to manage your collection
          </h2>
          <p className="text-muted-foreground text-sm lg:text-lg max-w-[600px]">
            Comprehensive tools designed specifically for reptile breeders and enthusiasts
          </p>
        </div>
        <div className="mt-16 grid gap-8 md:grid-cols-2 xl:grid-cols-4">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </div>
    </section>
  )
} 
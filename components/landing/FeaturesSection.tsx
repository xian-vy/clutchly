import { Database, Dna, Heart, LineChart, Check, Zap } from 'lucide-react'
import { FeatureCard } from './FeatureCard'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

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

  const subscriptionPlans = [
    {
      id: 'free',
      name: 'Free',
      description: 'Perfect for hobbyists managing a small collection',
      price: 0,
      badge: 'Get Started',
      features: [
        'Manage up to 5 reptiles',
        'Basic health tracking',
        'Photo documentation',
        'Mobile access'
      ]
    },
    {
      id: 'starter',
      name: 'Starter',
      price: 9.99,
      badge: 'Most Popular',
      recommended: true,
      description: 'Enhanced tracking for serious keepers',
      features: [
        'Manage up to 25 reptiles',
        'Advanced health tracking',
        'Breeding records',
        'Growth analytics',
        'Unlimited photos',
        'Premium support'
      ]
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 19.99,
      badge: 'Best Value',
      description: 'Complete solution for breeders & facilities',
      features: [
        'Unlimited reptiles',
        'Complete genetic tracking',
        'Advanced breeding projects',
        'Full analytics dashboard',
        'Facility management',
        'API access',
        'Priority support'
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

        {/* Subscription Plans */}
        <div className="mt-32 mb-8">
          <div className="flex flex-col items-center gap-4 text-center mb-16">
            <span className="rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              Pricing
            </span>
            <h2 className="text-center text-2xl lg:text-3xl font-bold tracking-tight xl:text-4xl mb-4">
              Choose the right plan for your needs
            </h2>
            <p className="text-muted-foreground text-sm lg:text-lg max-w-[600px]">
              Flexible options for every level of hobbyist, breeder, or professional
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {subscriptionPlans.map((plan) => (
              <div 
                key={plan.id} 
                className={cn(
                  "rounded-xl transition-all duration-200 hover:shadow-md overflow-hidden",
                  plan.recommended ? 
                    "border-2 border-primary shadow-sm" : 
                    "border border-border"
                )}
              >
                <div className="h-full flex flex-col">
                  {/* Top accent strip */}
                  <div className={cn(
                    "h-1.5 w-full",
                    plan.recommended ? "bg-primary" : "bg-muted"
                  )} />
                  
                  <div className="p-6 flex-1">
                    {plan.badge && (
                      <span className={cn(
                        "text-xs font-medium px-2.5 py-0.5 rounded-full w-fit mb-4 inline-block",
                        plan.recommended ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                      )}>
                        {plan.badge}
                      </span>
                    )}
                    
                    <h3 className="text-xl font-bold">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1 mb-5">
                      {plan.description}
                    </p>
                    
                    <div className="mb-6">
                      <span className="text-3xl font-bold">${plan.price}</span>
                      {plan.price > 0 && (
                        <span className="text-muted-foreground ml-1">/month</span>
                      )}
                    </div>
                    
                    <div className="mb-8 flex-1">
                      <ul className="space-y-3">
                        {plan.features.map((feature, i) => (
                          <li key={i} className="flex text-sm">
                            <Check className="h-5 w-5 text-primary shrink-0 mr-2" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <Button 
                      className={cn(
                        "w-full",
                        plan.recommended 
                          ? "bg-primary hover:bg-primary/90" 
                          : plan.id === 'free'
                            ? "bg-muted hover:bg-muted/80 text-foreground"
                            : "bg-secondary hover:bg-secondary/90"
                      )}
                    >
                      {plan.id === 'free' ? 'Get Started Free' : 'Choose Plan'}
                      <Zap className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-10 text-center">
            <p className="text-sm text-muted-foreground">
              All plans include a <span className="font-medium text-foreground">14-day free trial</span>. 
              Need a custom solution? <a href="#" className="text-primary hover:underline">Contact us</a>.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
} 
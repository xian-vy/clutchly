import { Cloud, Download, Zap } from 'lucide-react'

export function PWAFeatures() {
  const features = [
    {
      icon: Download,
      title: 'Install Anywhere',
      description: 'Use on any device like a native app with seamless installation'
    },
    {
      icon: Cloud,
      title: 'Offline-First',
      description: 'Full functionality even without internet connection'
    },
    {
      icon: Zap,
      title: 'Real-time Sync',
      description: 'Instant data synchronization across all your devices'
    }
  ]

  return (
    <section className="relative border-t border-border/50">
      {/* <div className="absolute inset-0 bg-gradient-to-b from-secondary/50 to-[##37a52b" /> */}
      <div className="container relative py-24">
        <div className="text-center mb-16">
          <span className="rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            Progressive Web App
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
            Access Your Data Anywhere
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Experience native app-like functionality with the convenience of a web application
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className="group flex flex-col items-center rounded-lg border p-8 transition-all hover:shadow-lg hover:scale-[1.02] bg-background/80 backdrop-blur-sm"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/25 group-hover:bg-primary/20">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
} 
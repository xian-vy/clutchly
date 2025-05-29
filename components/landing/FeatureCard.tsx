
interface FeatureCardProps {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  title: string
  features: string[]
}

export function FeatureCard({ icon: Icon, title, features }: FeatureCardProps) {
  return (
    <div className="group relative">
      <div className="absolute -inset-px rounded-xl bg-gradient-to-r from-primary/50 to-primary/10 opacity-20 blur transition-all group-hover:opacity-30" />
      <div className="flex flex-col justify-start items-center relative h-full rounded-lg border bg-background/80 backdrop-blur-sm p-6 sm:p-6 md:p-8 transition-all hover:shadow-lg hover:scale-[1.01]">
        <div className="mb-4 sm:mb-6 flex flex-col items-center gap-4 sm:gap-5">
          <div className="flex h-9 sm:h-10 xl:h-14 w-9 sm:w-10 xl:w-14 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/25">
            <Icon className="h-4 sm:h-5 xl:h-7 w-4 sm:w-5 xl:w-7" />
          </div>
          <h3 className="text-lg sm:text-xl lg:text-2xl max-w-[200px] md:max-w-full font-bold text-center leading-tight">{title}</h3>
        </div>
        <ul className="space-y-2 sm:space-y-2 md:space-y-3 2xl:space-y-4 text-muted-foreground">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-3">
              <span className="h-1 sm:h-1.5 w-1 sm:w-1.5 rounded-full bg-primary/70 shrink-0" />
              <p className="text-sm xl:text-base">{feature} </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
} 
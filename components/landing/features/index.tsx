'use client'
import { Button } from '@/components/ui/button'
import { ArrowRight, Calendar, DatabaseZap, Globe, Network} from 'lucide-react'
import { useTheme } from 'next-themes'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

type Feature = {
  title: string;
  description: string;
  icon: React.ReactNode; 
  image: string;
  image_dark: string;
}

const features = [
  {
    title: 'Data Management',
    description: 'Comprehensive and intuitive platform for reptile husbandry',
    icon: <DatabaseZap strokeWidth={1.5} className='size-4 sm:size-5' />,
    image: '/features/reptile_light.png',
    image_dark: '/features/reptile_dark.png',
  },
  {
    title: 'Pedigree Tree',
    description: 'Track offspring lineage, visualize morph distribution',
    icon: <Network strokeWidth={1.5} className='size-4 sm:size-5' />, 
    image: '/features/featured_light.png',
    image_dark: '/features/featured_dark.png',
  },
  {
    title: 'Free Website',
    description: 'Create  catalogs and share your collection with the world',
    icon: <Globe strokeWidth={1.5} className='size-4 sm:size-5' />,
    image: '/features/website_light.png',
    image_dark: '/features/website_dark.png',
  },
  {
    title: 'Feeding Scheduler',
    description: 'Create feeding schedules and track feeding history',
    icon: <Calendar strokeWidth={1.5} className='size-4 sm:size-5' />,
    image: '/features/hero_light.png',
    image_dark: '/features/hero_dark.png',
  },
]

export function FeaturesSection() {
  const theme = useTheme()

  const [selectedFeature, setSelectedFeature] = useState<Feature>(features[0]);

  const handleFeatureSelect = (feature: Feature) => {
    setSelectedFeature(feature);
  }

  return (
    <section className="relative py-16 sm:py-24 min-h-screen max-w-screen-xl 2xl:max-w-screen-xl mx-auto bg-background ">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--color-primary)/5%_0%,transparent_50%)]" />
   
      <div className="flex flex-col gap-10 xl:gap-16 items-center  px-2 sm:px-4 md:px-8 xl:px-24">

                  <div className="flex flex-col items-center gap-4 text-center">
                      <span className="rounded-full bg-primary/10 px-4 py-1.5 text-xs md:text-sm font-medium text-primary">
                        Features
                      </span>
                      <div className='space-y-1.5'>
                          <h3 className="text-center text-2xl lg:text-3xl 3xl:!text-4xl font-bold tracking-tight  dark:text-foreground">
                          Everything you need to manage your collection
                          </h3>
                          <p className="text-muted-foreground text-sm lg:text-base 3xl:!text-lg  px-4 max-w-[600px] mt-2">
                            Discover all the powerful tools and features designed to help you manage your reptile collection effectively
                          </p>
                          
                      </div>
                  </div> 
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 xl:gap-6 2xl:gap-7">
                    {features.map((feature, index) => (
                      <div 
                        key={index} 
                        className={`flex flex-col items-center p-3 sm:p-4 md:p-5 lg:p-6 bg-background rounded-lg border z-30 cursor-pointer transition-all duration-300
                          ${selectedFeature.title === feature.title ?
                             ' border border-ring ring-ring/50 ring-[4px] shadow-lg' : 
                             ' transition-colors'}`}
                        onClick={() => handleFeatureSelect(feature)}
                      >
                        <div className={` mb-2 sm:mb-3 md:mb-4  p-2 rounded-full 
                          ${selectedFeature.title === feature.title ? 'text-primary bg-primary/10 dark:bg-primary/15' : 'bg-black/5 dark:bg-white/5 text-muted-foreground'}`}>
                             {feature.icon}
                          </div>
                        <h3 className={`text-sm sm:text-base md:text-lg 3xl:text-xl font-semibold text-center mb-1
                          ${selectedFeature.title === feature.title ? 'text-foreground' : 'text-foreground/75'}`}>
                              {feature.title}
                        </h3>
                        <p className="text-xs  sm:text-sm md:text-[0.95rem] text-muted-foreground text-center mb-4">{feature.description}</p>
                      </div>
                     ))}
                  </div>
                  {selectedFeature && (
                      <div className="w-full   relative pb-10">
                        <div className="relative aspect-[16/9] border w-full rounded-lg shadow-2xl shadow-primary/20 dark:shadow-primary/15 overflow-hidden " >
                          <Image 
                            src={theme.theme === 'dark' ? selectedFeature.image_dark : selectedFeature.image}
                            alt="Data Management Feature"
                            fill
                            loading='lazy'
                            className="object-cover object-left"
                            sizes='(max-width: 768px) 90vw, 70vw'
                          />
                        </div>
                 </div>
                  )}
      </div>
      {/* See All Features Button */}
      <div className="mt-12 flex justify-center z-50">
        <Button
          asChild
          variant="default"
          size="lg"
          className="group relative text-lg font-medium transition-all hover:bg-primary hover:text-primary-foreground"
        >
          <Link href="/features" className="text-xs md:text-sm hover:!text-foreground">
            See All Features
            <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </div>
    </section>
  )
}
'use client'
import React from 'react'
import PedigreeCard from './PedigreeCard'

const PedigreeSection = () => {
  return (
    <div className="mt-24 hidden lg:block">
        <div className="flex flex-col items-center gap-4 text-center mb-8">
        <span className="rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            Spotlight Feature
        </span>
        <h2 className="text-center text-xl lg:text-2xl font-bold tracking-tight xl:text-3xl">
            Interactive Pedigree Analysis
        </h2>
        <p className="text-muted-foreground text-sm lg:text-base max-w-[600px]">
            Visualize your reptile&apos;s complete lineage with our interactive pedigree tree
        </p>
        </div>
        <div className="w-full max-w-screen-lg 3xl:!max-w-screen-2xl mx-auto">
               <PedigreeCard />
        </div>
  </div>
  )
}

export default PedigreeSection

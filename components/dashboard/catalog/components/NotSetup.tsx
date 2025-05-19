import { useTheme } from 'next-themes'
import Image from 'next/image'
import React from 'react'
interface Props {
    isAdmin : boolean
}
const NotSetup = ({isAdmin }:Props) => {
    const { theme } = useTheme()

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center text-center p-4 space-y-6">
        {!isAdmin &&
            <div className="relative w-12 h-12">
            <Image 
                src={ theme === 'dark' ? '/logo_dark.png' : '/logo_light.png'}
                fill
                alt="Clutchly Logo"
                className="object-contain rounded-full"
            />
        </div>}
        <div className="space-y-2">
        <h2 className="text-xl sm:text-2xl font-semibold">Website Under Construction</h2>
        <p className="text-muted-foreground max-w-md">
            We&apos;re getting ready to showcase our amazing reptiles. Check back soon!
        </p>
    </div>
    </div>
  )
}

export default NotSetup

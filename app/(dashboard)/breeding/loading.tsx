import { Loader2 } from 'lucide-react'
import React from 'react'

export default function Loading() {
  return (
    <div className='w-full flex flex-col justify-center items-center min-h-screen'>
        <Loader2 className='w-4 h-4 animate-spin text-black dark:text-white' />
    </div>
  )
}


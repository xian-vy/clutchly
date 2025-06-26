import { CircleCheck, RefreshCcw } from 'lucide-react'
import React, { useEffect, useState } from 'react'

const RealtimeBadge = () => {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 4000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div>
      {loading ? (
        <span className='flex items-center gap-2 font-medium text-[0.8rem] 3xl:!text-sm text-primary capitalize'>
          <RefreshCcw className='inline-block w-3.5 h-3.5 animate-spin text-primary' />
          Syncing...
        </span>
      ) : (
        <span className='flex items-center gap-2 font-medium text-[0.8rem] 3xl:!text-sm text-primary capitalize'>
          <CircleCheck className='inline-block w-3.5 h-3.5 text-primary' />
          Data Synced
        </span>
      )}
    </div>
  )
}

export default RealtimeBadge

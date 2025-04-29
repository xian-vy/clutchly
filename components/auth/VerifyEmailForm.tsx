'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { FiAlertCircle, FiCheckCircle, FiMail } from 'react-icons/fi'
import { TopLoader } from '@/components/ui/TopLoader'

export function VerifyEmailForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleResend = async () => {
    // This would be integrated with your resend email functionality
    setIsLoading(true)
    try {
      // Mock success for now
      setTimeout(() => {
        setStatus('success')
        setMessage('Verification email resent successfully!')
        setIsLoading(false)
      }, 1500)
    } catch (error ) {
      console.error('Error resending verification email:', error)
      setStatus('error')
      setMessage('Failed to resend verification email. Please try again.')
      setIsLoading(false)
    }
  }

  const handleNavigation = (path: string) => {
    setIsLoading(true)
    startTransition(() => {
      router.push(path)
    })
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      {(isLoading || isPending) && <TopLoader />}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md rounded-lg border bg-card p-8 shadow-sm"
      >
        <div className="mb-8 flex flex-col items-center justify-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
            <FiMail className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Check your email</h1>
          <p className="mt-2 text-muted-foreground">
            We&apos;ve sent a verification link to your email address.
          </p>
        </div>

        {status !== 'idle' && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className={`mb-6 flex items-start gap-3 rounded-lg p-4 ${
              status === 'success' 
                ? 'bg-green-500/10 border border-green-500/20' 
                : 'bg-destructive/10 border border-destructive/20'
            }`}
          >
            {status === 'success' ? (
              <FiCheckCircle className="mt-0.5 shrink-0 text-green-500" />
            ) : (
              <FiAlertCircle className="mt-0.5 shrink-0 text-destructive" />
            )}
            <p className={`text-sm ${
              status === 'success' ? 'text-green-500' : 'text-destructive'
            }`}>
              {message}
            </p>
          </motion.div>
        )}

        <div className="space-y-4">
          <button
            onClick={handleResend}
            disabled={status === 'success' || isLoading}
            className="w-full rounded-md bg-primary/10 py-2.5 text-sm font-medium text-primary hover:bg-primary/20 disabled:opacity-50 transition-colors"
          >
            Resend verification email
          </button>
          
          <button
            onClick={() => handleNavigation('/auth/signin')}
            className="w-full rounded-md bg-background py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary/80 transition-colors"
          >
            Back to sign in
          </button>
        </div>
        
        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>
            Didn&apos;t receive an email? Check your spam folder or{' '}
            <button 
              onClick={handleResend}
              className="font-medium text-primary hover:underline"
            >
              try again
            </button>
            .
          </p>
        </div>
      </motion.div>
    </div>
  )
} 
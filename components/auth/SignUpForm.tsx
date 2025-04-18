'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { FiMail, FiLock, FiAlertCircle, FiCheckCircle, FiInfo } from 'react-icons/fi'
import { AuthLayout } from './AuthLayout'
import { signup } from '@/app/auth/signup/actions'
import { useFormStatus } from 'react-dom'
import { TopLoader } from '@/components/ui/TopLoader'

function SubmitButton() {
  const { pending } = useFormStatus()
  
  return (
    <motion.button 
      type="submit" 
      className="relative w-full py-3 px-4 bg-primary text-primary-foreground rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group"
      disabled={pending}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <span className="relative z-10">
        {pending ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Creating account...
          </span>
        ) : (
          'Create Account'
        )}
      </span>
      <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
    </motion.button>
  )
}

interface StatusMessage {
  type: 'error' | 'success' | 'info';
  message: string;
}

export function SignUpForm() {
  const [status, setStatus] = useState<StatusMessage | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSignUp(formData: FormData) {
    setIsLoading(true)
    try {
      const result = await signup(formData)
      
      if (result?.error) {
        setStatus({
          type: 'error',
          message: result.error
        })
      } else if (result?.message) {
        setStatus({
          type: 'success', 
          message: result.message
        })
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setStatus({
          type: 'error',
          message: error.message
        })
      } else {
        setStatus({
          type: 'error',
          message: 'An unexpected error occurred'
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout mode="signup">
      {isLoading && <TopLoader />}
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="text-3xl font-bold">Create Account</h2>
          <p className="mt-2 text-muted-foreground">
            Join HerpTrack today and start managing your collection.
          </p>
        </div>

        <motion.form 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          action={handleSignUp}
          className="space-y-6"
        >
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-foreground/80">
              Email Address
              <span className="ml-1 text-primary">*</span>
            </label>
            <div className="relative mt-1">
              <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                className="w-full px-10 py-3 bg-background/50 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all duration-300 placeholder:text-muted-foreground/50"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-foreground/80">
              Password
              <span className="ml-1 text-primary">*</span>
            </label>
            <div className="relative mt-1">
              <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                className="w-full px-10 py-3 bg-background/50 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all duration-300 placeholder:text-muted-foreground/50"
                required
              />
            </div>
          </div>

          {status && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-lg flex items-start gap-3 ${
                status.type === 'error' 
                  ? 'bg-destructive/10 border border-destructive/20' 
                  : status.type === 'success'
                    ? 'bg-green-500/10 border border-green-500/20'
                    : 'bg-blue-500/10 border border-blue-500/20'
              }`}
            >
              {status.type === 'error' && <FiAlertCircle className="text-destructive shrink-0 mt-0.5" />}
              {status.type === 'success' && <FiCheckCircle className="text-green-500 shrink-0 mt-0.5" />}
              {status.type === 'info' && <FiInfo className="text-blue-500 shrink-0 mt-0.5" />}
              <p className={`text-sm ${
                status.type === 'error' 
                  ? 'text-destructive' 
                  : status.type === 'success'
                    ? 'text-green-500'
                    : 'text-blue-500'
              }`}>{status.message}</p>
            </motion.div>
          )}

          <SubmitButton />

          <div className="text-center text-sm">
            <span className="text-muted-foreground">Already have an account?</span>{' '}
            <Link href="/auth/signin" className="font-medium text-primary hover:text-primary/90 transition-colors">
              Sign in
            </Link>
          </div>
        </motion.form>
      </div>
    </AuthLayout>
  )
} 
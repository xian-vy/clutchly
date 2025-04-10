'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'
import { FiMail, FiLock } from 'react-icons/fi'
import { AuthLayout } from './AuthLayout'

export function SignUpForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error
      router.push('/auth/verify-email')
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError('An unexpected error occurred')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout mode="signup">
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
          onSubmit={handleSignUp} 
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
                type="email"
                placeholder="you@example.com"
                className="w-full px-10 py-3 bg-background/50 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all duration-300 placeholder:text-muted-foreground/50"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
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
                type="password"
                placeholder="••••••••"
                className="w-full px-10 py-3 bg-background/50 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all duration-300 placeholder:text-muted-foreground/50"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-lg bg-destructive/10 border border-destructive/20"
            >
              <p className="text-sm text-destructive">{error}</p>
            </motion.div>
          )}

          <motion.button 
            type="submit" 
            className="relative w-full py-3 px-4 bg-primary text-primary-foreground rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group"
            disabled={loading}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <span className="relative z-10">
              {loading ? (
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
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { FiMail, FiLock, FiAlertCircle } from 'react-icons/fi'
import { AuthLayout } from './AuthLayout'
import { login } from '@/app/auth/signin/actions'
import { TopLoader } from '@/components/ui/TopLoader'
import { Input } from '../ui/input'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'

const formSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type T = {
  isLoading : boolean
}

function SubmitButton({isLoading} : T) {
  
  return (
    <motion.button 
      type="submit" 
      className="relative w-full py-3 px-4 bg-primary text-primary-foreground rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group cursor-pointer"
      disabled={isLoading}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <span className="relative z-10">
        {isLoading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Signing in...
          </span>
        ) : (
          'Sign In'
        )}
      </span>
      <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
    </motion.button>
  )
}

export function SignInForm() {
  const [error, setError] = useState<string | null>(null)
  const [isFormSubmitting, setIsFormSubmitting] = useState(false)
  
  const isLoading =  isFormSubmitting

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsFormSubmitting(true)
    const formData = new FormData()
    formData.append('email', values.email)
    formData.append('password', values.password)
    
    try {
      const result = await login(formData)
      
      if (result?.error) {
        setError(result.error)
        setIsFormSubmitting(false)
      } 
    } catch (error: unknown) {
      setIsFormSubmitting(false)
      if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
        // This is a redirect error, do nothing 
        return;
      }
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError('An unexpected error occurred')
      }
    }
  }

  return (
    <AuthLayout mode="signin">
      {isLoading && <TopLoader />}
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold">Sign In</h2>
          <p className="mt-2 text-muted-foreground">
            Welcome back! Please enter your details.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-foreground/80">
                    Email Address
                    <span className="-ml-1 text-primary">*</span>
                  </FormLabel>
                  <div className="relative">
                    <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        className="w-full px-10 py-6 transition-all duration-500"
                        {...field}
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-foreground/80">
                    Password
                    <span className="-ml-1 text-primary">*</span>
                  </FormLabel>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        className="w-full px-10 py-6 transition-all duration-500"
                        {...field}
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-3"
              >
                <FiAlertCircle className="text-destructive shrink-0 mt-0.5" />
                <p className="text-sm text-destructive">{error}</p>
              </motion.div>
            )}

            <SubmitButton isLoading={isLoading} />

            <div className="text-center text-sm">
              <span className="text-muted-foreground">Don&apos;t have an account?</span>{' '}
              <Link href="/auth/signup" className="font-medium text-primary hover:text-primary/90 transition-colors">
                Sign up
              </Link>
            </div>
          </form>
        </Form>
      </div>
    </AuthLayout>
  )
}
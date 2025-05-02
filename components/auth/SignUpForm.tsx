'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { FiMail, FiLock, FiAlertCircle, FiCheckCircle, FiInfo, FiKey } from 'react-icons/fi'
import { AuthLayout } from './AuthLayout'
import { signup } from '@/app/auth/signup/actions'
import { TopLoader } from '@/components/ui/TopLoader'
import { Input } from '../ui/input'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'

const formSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(32, 'Password must be at most 32 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
  inviteCode: z.string()
    .min(8, 'Invite code must be atleast 8 characters')
    .max(16, 'Invite code must be at most 16 characters')
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
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
  const router = useRouter()
  const [status, setStatus] = useState<StatusMessage | null>(null)
  const [isPending, startTransition] = useTransition()
  const [isFormSubmitting, setIsFormSubmitting] = useState(false)
  
  const isLoading = isPending || isFormSubmitting

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      inviteCode: ''
    }
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsFormSubmitting(true)
    const formData = new FormData()
    formData.append('email', values.email)
    formData.append('password', values.password)
    formData.append('inviteCode', values.inviteCode)
    
    try {
      const result = await signup(formData)
      
      if (result?.error) {
        setStatus({
          type: 'error',
          message: result.error
        })
        setIsFormSubmitting(false)
      } else if (result?.message) {
        setStatus({
          type: 'success', 
          message: result.message
        })
        setIsFormSubmitting(false)
      } else {
        startTransition(() => {
          router.push('/auth/verify-email')
        })
      }
    } catch (error: unknown) {
      setIsFormSubmitting(false)
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
    }
  }

  return (
    <AuthLayout mode="signup">
      {isLoading && <TopLoader />}
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold">Create Account</h2>
          <p className="mt-2 text-muted-foreground">
            Join Clutchly today and start managing your collection.
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

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-foreground/80">
                    Confirm Password
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

            <FormField
              control={form.control}
              name="inviteCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-foreground/80">
                    Invite Code
                    <span className="-ml-1 text-primary">*</span>
                  </FormLabel>
                  <div className="relative">
                    <FiKey className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="XXXXXXXX"
                        className="w-full px-10 py-6 transition-all duration-500 uppercase"
                        maxLength={16}
                        {...field}
                        onChange={(e) => {
                          e.target.value = e.target.value.toUpperCase();
                          field.onChange(e);
                        }}
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

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

            <SubmitButton isLoading={isLoading} />

            <div className="text-center text-sm">
              <span className="text-muted-foreground">Already have an account?</span>{' '}
              <Link href="/auth/signin" className="font-medium text-primary hover:text-primary/90 transition-colors">
                Sign in
              </Link>
            </div>
          </form>
        </Form>
      </div>
    </AuthLayout>
  )
}
'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { FiMail, FiLock, FiAlertCircle, FiCheckCircle, FiKey } from 'react-icons/fi'
import { AuthLayout } from './AuthLayout'
import { signup, SignupState } from '@/app/auth/signup/actions'
import { TopLoader } from '@/components/ui/TopLoader'
import { Input } from '../ui/input'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { APP_NAME } from '@/lib/constants/app'
import { useActionState } from 'react'

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
    .min(8, 'Invite code must be at least 8 characters')
    .max(16, 'Invite code must be at most 16 characters')
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const initialState: SignupState = {
  errors: {},
  message: '',
}

function SubmitButton({isPending} : {isPending : boolean}) {
  
  return (
    <motion.button 
      type="submit" 
      className="relative w-full py-3 px-4 bg-primary text-primary-foreground rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group cursor-pointer"
      disabled={isPending}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <span className="relative z-10">
        {isPending ? (
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

export function SignUpForm() {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(signup, initialState)
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      inviteCode: ''
    }
  })

  // Handle successful signup
  if (state?.message && !state.errors) {
    // Redirect to verify email page after a short delay
    setTimeout(() => {
      router.push('/auth/verify-email')
    }, 2000)
  }

  return (
    <AuthLayout mode="signup">
      {isPending && <TopLoader />}
      <div className="w-full max-w-md space-y-3 sm:space-y-5 md:space-y-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-[#333] dark:text-foreground">Create Account</h2>
          <p className="mt-1 sm:mt-2 text-sm sm:text-base text-muted-foreground">
            Join {APP_NAME} today and start managing your collection.
          </p>
        </div>

        <Form {...form}>
          <form action={formAction} className="space-y-4 sm:space-y-5 3xl:!space-y-6">
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
                  {state?.errors && 'email' in state.errors && state.errors.email && (
                    <p className="text-sm text-destructive">{state.errors.email[0]}</p>
                  )}
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
                  {state?.errors && 'password' in state.errors && state.errors.password && (
                    <p className="text-sm text-destructive">{state.errors.password[0]}</p>
                  )}
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
                  {state?.errors && 'inviteCode' in state.errors && state.errors.inviteCode && (
                    <p className="text-sm text-destructive">{state.errors.inviteCode[0]}</p>
                  )}
                </FormItem>
              )}
            />

            {state?.message && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 flex items-start gap-3"
              >
                <FiCheckCircle className="text-green-500 shrink-0 mt-0.5" />
                <p className="text-sm text-green-500">{state.message}</p>
              </motion.div>
            )}

            {state?.errors && '_form' in state.errors && state.errors._form && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-3"
              >
                <FiAlertCircle className="text-destructive shrink-0 mt-0.5" />
                <p className="text-sm text-destructive">{state.errors._form[0]}</p>
              </motion.div>
            )}

            <SubmitButton isPending={isPending} />

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
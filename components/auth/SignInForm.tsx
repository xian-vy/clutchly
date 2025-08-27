'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { FiMail, FiLock, FiAlertCircle } from 'react-icons/fi'
import { AuthLayout } from './AuthLayout'
import { login, LoginState } from '@/app/auth/signin/actions'
import { TopLoader } from '@/components/ui/TopLoader'
import { Input } from '../ui/input'
import { useActionState } from 'react'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

const formSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const initialState: LoginState = {
  errors: {},
  message: '',
}


function SubmitButton({isPending} : {isPending : boolean}) {
  return (
    <motion.button 
      type="submit" 
      className="relative w-full py-3 px-4 bg-primary text-primary-foreground rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group cursor-pointer"
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      disabled={isPending}
    >
     {isPending ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Signing In...
          </span>
        ) : (
          'Sign In'
        )}
      <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
    </motion.button>
  )
}

export function SignInForm() {
  const [state, formAction, isPending] = useActionState(login, initialState)
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  })

  return (
    <AuthLayout mode="signin">
      {isPending && <TopLoader />}
      <div className="w-full max-w-md space-y-3 sm:space-y-5 md:space-y-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-[#333] dark:text-foreground">Sign In</h2>
          <p className="mt-1 sm:mt-2 text-sm sm:text-base text-muted-foreground">
            Welcome back! Please enter your details.
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
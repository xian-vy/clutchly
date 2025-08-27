'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required').max(30, "Password must be less than 30 characters"),
})

export type LoginState = {
  errors?: {
    email?: string[]
    password?: string[]
    _form?: string[]
  }
  message?: string
}

export async function login(prevState: LoginState, formData: FormData): Promise<LoginState> {
  const validatedFields = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { email, password } = validatedFields.data
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    // Customize error messages for better user experience
    if (error.message.includes('Invalid login credentials')) {
      return {
        errors: {
          _form: ['The email or password you entered is incorrect. Please try again.']
        }
      }
    } else if (error.message.includes('Email not confirmed')) {
      // Resend confirmation email if it hasn't been confirmed
      await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
        },
      })

      return {
        errors: {
          _form: ['Your email has not been verified. We\'ve sent a new verification email to your inbox.']
        }
      }
    } else if (error.message.includes('too many requests')) {
      return {
        errors: {
          _form: ['Too many login attempts. Please try again later.']
        }
      }
    } else if (error.message.includes('rate limited')) {
      return {
        errors: {
          _form: ['Too many login attempts. Please try again in a few minutes.']
        }
      }
    }

    return {
      errors: {
        _form: [error.message]
      }
    }
  }

  revalidatePath('/', 'layout')
  redirect('/overview')
}
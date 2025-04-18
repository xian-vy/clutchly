'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'


export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    // Customize error messages for better user experience
    if (error.message.includes('Invalid login credentials')) {
      return {
        error: 'The email or password you entered is incorrect. Please try again.'
      }
    } else if (error.message.includes('Email not confirmed')) {
      // Resend confirmation email if it hasn't been confirmed
      await supabase.auth.resend({
        type: 'signup',
        email: data.email,
        options: {
          emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
        },
      })

      return {
        error: 'Your email has not been verified. We\'ve sent a new verification email to your inbox.'
      }
    } else if (error.message.includes('too many requests')) {
      return {
        error: 'Too many login attempts. Please try again later.'
      }
    } else if (error.message.includes('rate limited')) {
      return {
        error: 'Too many login attempts. Please try again in a few minutes.'
      }
    }

    return {
      error: error.message
    }
  }

  revalidatePath('/', 'layout')
  redirect('/overview')
}


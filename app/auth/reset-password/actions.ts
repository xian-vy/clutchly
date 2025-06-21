'use server'

import { createClient } from '@/lib/supabase/server'

export async function resetPassword(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string

  if (!email) {
    return {
      error: 'Email is required'
    }
  }

  const redirectUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?type=recovery`


  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: redirectUrl,
  })

  if (error) {
    if (error.message.includes('too many requests')) {
      return {
        error: 'Too many password reset attempts. Please try again later.'
      }
    } else if (error.message.includes('rate limited')) {
      return {
        error: 'Too many password reset attempts. Please try again in a few minutes.'
      }
    }

    return {
      error: error.message
    }
  }

  return {
    message: 'Password reset email sent successfully. Please check your inbox.'
  }
} 
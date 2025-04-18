'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  // First, check if a user with this email already exists
  const { data: { user } } = await supabase.auth.getUser()
  
  // Try to sign in with provided email (without password) to check if it exists
  const { error: checkError } = await supabase.auth.signInWithOtp({
    email: data.email,
    options: {
      shouldCreateUser: false, // Don't create a new user
    }
  })
  
  // If no error or specific error indicating user exists
  const userExists = !checkError || checkError.message.includes('already registered')
  
  if (userExists) {
    // Resend confirmation email
    await supabase.auth.resend({
      type: 'signup',
      email: data.email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    })
    
    return {
      message: 'If an account exists, we sent a confirmation email. Please check your inbox.',
      status: 'confirmation_email_sent'
    }
  }

  // If no user exists, proceed with signup
  const { error, data: signupData } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })

  if (error) {
    if (error.message.includes('already registered')) {
      return {
        error: 'An account with this email already exists. Please sign in instead.',
        status: 'user_exists'
      }
    }
    
    return {
      error: error.message,
      status: 'error'
    }
  }

  redirect('/auth/verify-email')
}
'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { checkInviteCode } from '@/app/api/invite-codes/invite-codes'
import { z } from 'zod'

const signupSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(32, 'Password must be at most 32 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  inviteCode: z.string()
    .min(8, 'Invite code must be at least 8 characters')
    .max(16, 'Invite code must be at most 16 characters')
})

export type SignupState = {
  errors?: {
    email?: string[]
    password?: string[]
    inviteCode?: string[]
    _form?: string[]
  }
  message?: string
}

export async function signup(prevState: SignupState, formData: FormData): Promise<SignupState> {
  const validatedFields = signupSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    inviteCode: formData.get('inviteCode'),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { email, password, inviteCode } = validatedFields.data
  const supabase = await createClient()

  // Validate invite code
  const isInviteCodeValid = await checkInviteCode(inviteCode)
  if (!isInviteCodeValid) {
    return {
      errors: {
        inviteCode: ['Invalid or already used invite code']
      }
    }
  }

  // Check if a user with this email already exists
  const { error: checkError } = await supabase.auth.signInWithOtp({
    email: email,
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
      email: email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    })
    
    return {
      message: 'If an account exists, we sent a confirmation email. Please check your inbox.',
    }
  }

  // If no user exists, proceed with signup
  const { error } = await supabase.auth.signUp({
    email: email,
    password: password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      data: {
        invite_code: inviteCode // Store the invite code with user metadata
      }
    },
  })

  if (error) {
    if (error.message.includes('already registered')) {
      return {
        errors: {
          _form: ['An account with this email already exists. Please sign in instead.']
        }
      }
    }
    
    return {
      errors: {
        _form: [error.message]
      }
    }
  }

  // Note: We'll mark the invite code as used when the user confirms their email
  // This is handled in the auth callback route

  redirect('/auth/verify-email')
}
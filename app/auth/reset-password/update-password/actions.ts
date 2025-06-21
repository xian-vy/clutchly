'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function updatePassword(formData: FormData) {
  const supabase = await createClient()

  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (!password || !confirmPassword) {
    return {
      error: 'Both password fields are required'
    }
  }

  if (password !== confirmPassword) {
    return {
      error: 'Passwords do not match'
    }
  }

  if (password.length < 8) {
    return {
      error: 'Password must be at least 8 characters long'
    }
  }

  const { error } = await supabase.auth.updateUser({
    password: password
  })

  if (error) {
    if (error.message.includes('password')) {
      return {
        error: 'Password must be at least 8 characters long'
      }
    }

    return {
      error: error.message
    }
  }

  revalidatePath('/', 'layout')
  redirect('/overview')
} 
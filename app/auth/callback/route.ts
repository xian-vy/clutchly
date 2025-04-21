import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const error_description = requestUrl.searchParams.get('error_description')
  const next = requestUrl.searchParams.get('next') || '/overview'

  // Handle error cases
  if (error) {
    const errorUrl = new URL('/auth/error', request.url)
    errorUrl.searchParams.set('error', error)
    errorUrl.searchParams.set('error_description', error_description || '')
    return NextResponse.redirect(errorUrl)
  }

  // If no code is present, redirect to sign in
  if (!code) {
    return NextResponse.redirect(new URL('/auth/signin', request.url))
  }

  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session }, error: sessionError } = await supabase.auth.exchangeCodeForSession(code)

    if (sessionError) {
      throw sessionError
    }

    // Check if the user's email is verified
    if (!session?.user.email_confirmed_at) {
      return NextResponse.redirect(new URL('/auth/verify-email', request.url))
    }

    // If user is already registered and verified, redirect to dashboard
    return NextResponse.redirect(new URL(next, request.url))
  } catch (error : unknown) {
    console.error('Auth callback error:', error)
    
    const errorUrl = new URL('/auth/error', request.url)
    errorUrl.searchParams.set('error', 'server_error')
    errorUrl.searchParams.set('error_description',  error instanceof Error ? error.message : 'An unexpected error occurred')
    return NextResponse.redirect(errorUrl)
  }
} 
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// List of public routes that don't require authentication
const publicRoutes = ['/', '/auth/signin', '/auth/signup', '/auth/verify-email', '/auth/callback']

export async function middleware(request: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const isPublicRoute = publicRoutes.includes(request.nextUrl.pathname)

  // Allow access to public routes regardless of auth status
  if (isPublicRoute) {
    return res
  }

  // If user is not signed in and trying to access a protected route,
  // redirect them to signin
  if (!session && !isPublicRoute) {
    return NextResponse.redirect(new URL('/auth/signin', request.url))
  }

  // If user is signed in and trying to access auth pages,
  // redirect them to dashboard
  if (session && request.nextUrl.pathname.startsWith('/auth')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return res
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
} 
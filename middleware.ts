import { type NextRequest } from 'next/server'
import { updateSession } from './lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - manifest.json (manifest file)
     * - sitemap.xml (sitemap file)
     * - robots.txt (robots file)
     * - google52e4890feeed6753.html (Google verification file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|sitemap.xml|robots.txt|google52e4890feeed6753.html|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
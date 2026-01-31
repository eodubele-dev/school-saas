import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}

import { createServerClient } from '@supabase/ssr'
import { SIDEBAR_LINKS, type UserRole } from '@/config/sidebar'

export default async function middleware(req: NextRequest) {
  const url = req.nextUrl
  const hostname = req.headers.get('host')

  // 1. Refresh Supabase Session (Critical for Auth persistence)
  let response = NextResponse.next({
    request: {
      headers: req.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => req.cookies.set(name, value))
          response = NextResponse.next({
            request: {
              headers: req.headers,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, {
              ...options,
              domain: process.env.NODE_ENV === 'production' ? '.eduflow.ng' : undefined
            })
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // 2. Routing Logic

  // Get the subdomain from the hostname
  // e.g. "school1.eduflow.ng" -> "school1"
  // "school1.localhost:3000" -> "school1"
  let currentHost = hostname?.replace(/:\d+$/, '') // remove port first
  currentHost = currentHost?.replace('.localhost', '') // remove .localhost
  currentHost = currentHost?.replace('.eduflow.ng', '') // remove main domain

  // If no subdomain (or it's the main domain/www), allow standard routing
  if (!currentHost || currentHost === 'www' || currentHost === 'localhost' || currentHost.includes(':')) {
    // This will render the pages directly in `app/` (e.g., landing page)
    return response // Return the response with refreshed cookies
  }

  // If there is a subdomain, rewrite to the tenant folder
  // e.g. school1.eduflow.ng/dashboard -> /school1/dashboard
  const searchParams = req.nextUrl.searchParams.toString()

  // Logic: All tenant pages (except auth) are inside /dashboard folder
  // but we want them accessible at root or direct paths (e.g. /cbt)
  let path = `${url.pathname}${searchParams.length > 0 ? `?${searchParams}` : ''}`

  if (!path.startsWith('/login') && !path.startsWith('/signup') && !path.startsWith('/auth') && !path.startsWith('/dashboard')) {
    if (path === '/') {
      path = '/dashboard' + path
    } else {
      path = '/dashboard' + path
    }
  }

  // ... rewrite logic ...
  // Rewrite URL first
  const rewriteUrl = new URL(`/${currentHost}${path}`, req.url)

  // 3. RBAC (Role-Based Access Control) Logic
  // Check if we are on a dashboard route (not login/signup)
  const isDashboardRoute = !path.startsWith('/login') && !path.startsWith('/signup') && !path.startsWith('/auth')

  if (isDashboardRoute && user) {
    // Get Role (from metadata or fetch if missing)
    let role = user.user_metadata?.role as UserRole

    if (!role) {
      // Fallback: Fetch from DB (slightly slower but safe)
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      role = profile?.role as UserRole
    }

    if (role) {
      const allowedLinks = SIDEBAR_LINKS[role] || []
      const currentPath = path.replace('/dashboard', '') || '/' // Normalize path

      // Allow if currentPath is '/' (Overview) or matches any allowed link
      // checking startsWith to allow sub-paths like /classes/123
      const isAllowed = currentPath === '/' || allowedLinks.some(link =>
        link.href !== '/' && currentPath.startsWith(link.href)
      )

      // If not allowed, redirect to root (Overview)
      if (!isAllowed) {
        console.log(`[Middleware] Access Denied for ${role} to ${currentPath}`)
        return NextResponse.redirect(new URL('/', req.url))
      }
    }
  }

  return NextResponse.rewrite(rewriteUrl)
}

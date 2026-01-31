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

  // FORCE TEST
  if (url.pathname === '/') {
    let debugHost = hostname?.replace(/:\d+$/, '')
    debugHost = debugHost?.replace('.localhost', '')
    debugHost = debugHost?.replace('.eduflow.ng', '')

    console.log(`[Middleware Debug] Host: ${debugHost}`)
    // return NextResponse.json({
    //   currentHost: debugHost,
    //   originalHost: hostname,
    //   isLocalhost: debugHost === 'localhost',
    //   willPassthrough: !debugHost || debugHost === 'www' || debugHost === 'localhost' || debugHost.includes(':')
    // })
  }

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
    console.log(`[Middleware] No subdomain detected. CurrentHost: '${currentHost}'. Passing through to landing page.`)
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
      // PROD READY: Redirect root to /dashboard so URL matches sidebar active state
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
  }

  // ... rewrite logic ...
  // Rewrite URL first
  const rewriteUrl = new URL(`/${currentHost}${path}`, req.url)

  // 3. RBAC (Role-Based Access Control) Logic
  // Check if we are on a dashboard route (not login/signup)
  const isDashboardRoute = !path.startsWith('/login') && !path.startsWith('/signup') && !path.startsWith('/auth')

  if (isDashboardRoute) {
    if (!user) {
      // PROD READY: Redirect unauthenticated users to login
      const loginUrl = new URL('/login', req.url)
      // Optional: Add ?next=path to redirect back after login
      loginUrl.searchParams.set('next', path)
      return NextResponse.redirect(loginUrl)
    }

    if (user) {
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

        // FIX: Match full path against allowed links
        const isAllowed = allowedLinks.some(link => {
          // Exact match for dashboard root to prevent it matching all sub-routes
          if (link.href === '/dashboard') {
            return path === '/dashboard' || path === '/dashboard/'
          }
          // Prefix match for sub-routes (e.g. /dashboard/children matches /dashboard/children/edit)
          return path.startsWith(link.href)
        })

        // If not allowed, redirect to root (Overview)
        if (!isAllowed) {
          console.log(`[Middleware] Access Denied for ${role} to ${path}`)
          return NextResponse.redirect(new URL('/dashboard', req.url))
        }
      }
    }
  }

  console.log(`[Middleware] Rewriting to: ${rewriteUrl.toString()}`)

  /* 
     Fixing collision with 'let response' above. 
     Using 'finalResponse' for the rewrite output.
  */
  const finalResponse = NextResponse.rewrite(rewriteUrl)
  // FORCE CACHE CLEARING to ensure browser drops the old Landing Page redirect
  finalResponse.headers.set('Cache-Control', 'no-store, max-age=0')

  return finalResponse
}

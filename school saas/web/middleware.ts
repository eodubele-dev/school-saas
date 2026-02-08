import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { SIDEBAR_LINKS, type UserRole } from '@/config/sidebar'

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}

export default async function middleware(req: NextRequest) {
  const url = req.nextUrl
  const hostname = req.headers.get('host')

  // 0. Setup Supabase Client
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
          cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value))

          // Update the response object (to send Set-Cookie to browser)
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

  // 1. Hostname Analysis & Tenant Extraction
  let currentHost = hostname?.replace(/:\d+$/, '') // remove port
  currentHost = currentHost?.replace('.localhost', '')
  currentHost = currentHost?.replace('.eduflow.ng', '')

  // Handle Main Domain matches
  if (!currentHost || currentHost === 'www' || currentHost === 'localhost' || currentHost.includes(':')) {
    // We are on the Main Domain (Marketing Site)
    // Pass user to 'app/page.tsx' or 'app/onboard/*'
    return response
  }

  // 2. Tenant Verification (The "Filter")
  // We are on a subdomain (e.g. "greenwood")
  // Check if tenant exists
  const { data: tenant } = await supabase
    .from('tenants')
    .select('id, name, slug, logo_url, theme_config')
    .eq('slug', currentHost.toLowerCase()) // assuming slug matches subdomain
    .single()

  if (!tenant) {
    // Tenant not found -> Redirect to 404 (or specific School Not Found page)
    console.log(`[Middleware] Tenant not found for host: ${currentHost}`)
    return NextResponse.rewrite(new URL('/404', req.url))
  }

  // 3. Contextual Branding Injection
  // Create a new Headers object for the rewrite request
  const requestHeaders = new Headers(req.headers)

  requestHeaders.set('x-school-id', tenant.id)
  requestHeaders.set('x-school-name', tenant.name)
  if (tenant.logo_url) requestHeaders.set('x-school-logo', tenant.logo_url)
  if (tenant.theme_config) {
    requestHeaders.set('x-school-theme', JSON.stringify(tenant.theme_config))
  }


  // 4. Onboarding Protection
  // Subdomains should NOT access /onboard/setup. That is for Main Domain only.
  if (url.pathname.startsWith('/onboard')) {
    return NextResponse.redirect(new URL('https://eduflow.ng/onboard/setup')) // Force main domain
  }


  // 5. Rewrite Logic (Path Routing)
  // Rewrite /dashboard -> /greenwood/dashboard
  const searchParams = req.nextUrl.searchParams.toString()
  let path = `${url.pathname}${searchParams.length > 0 ? `?${searchParams}` : ''}`

  // Root redirect for tenants
  if (path === '/') {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // Rewrite URL
  const rewriteUrl = new URL(`/${currentHost}${path}`, req.url)


  // 6. Role-Based Security Gate (The "Role-Gate")
  // Exclude auth routes from checks
  if (!path.startsWith('/login') && !path.startsWith('/signup') && !path.startsWith('/auth')) {

    // a. Authentication Guard
    if (!user) {
      const loginUrl = new URL('/login', req.url)
      loginUrl.searchParams.set('next', path)
      return NextResponse.redirect(loginUrl)
    }

    // b. Fetch User Role & Profile (Platinum Optimized)
    // Try to get context from JWT (Stateless) to avoid DB Call
    let userTenantId = user.app_metadata?.tenantId
    let userRole = user.app_metadata?.role as UserRole
    let userFullName = user.user_metadata?.full_name // user_metadata is standard for profile info

    // Fallback: If JWT claims are missing (e.g. old session), fetch from DB
    if (!userTenantId || !userRole) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id, role, full_name')
        .eq('id', user.id)
        .single()

      if (profile) {
        userTenantId = profile.tenant_id
        userRole = profile.role as UserRole
        userFullName = profile.full_name
      }
    }

    // c. Tenant Isolation Guard
    // Prevent teacher from School A logging into School B
    // 2. Cross-reference user's authorized tenant with the request subdomain
    // EXCEPTION: 'owner' role can access any tenant (Global View)
    if (userTenantId !== tenant.id && userRole !== 'owner') {
      // This is a "Forensic" security violation attempt
      console.warn(`SECURITY ALERT: User ${user.email} attempted to access cross-tenant data at ${currentHost} (Tenant ID Mismatch)`)
      return NextResponse.rewrite(new URL('/403', req.url))
    }

    // d. Strict Route Protection
    const role = userRole

    // Define Forbidden Zones
    const isTryingAdmin = path.startsWith('/dashboard/admin')
    const isTryingBursar = path.startsWith('/dashboard/bursar')

    let isViolation = false

    if (isTryingAdmin && role !== 'admin') isViolation = true
    if (isTryingBursar && role !== 'bursar' && role !== 'admin') isViolation = true

    if (role === 'teacher' || role === 'student' || role === 'parent') {
      if (isTryingAdmin || isTryingBursar) isViolation = true
    }

    if (isViolation) {
      console.log(`[Middleware] Role Violation: ${role} tried accessing ${path}`)

      await supabase.from('audit_logs').insert({
        tenant_id: tenant.id, // The tenant they are IN (which we verified matches their profile)
        actor_id: user.id,
        actor_name: userFullName || user.email,
        actor_role: role,
        action: 'UNAUTHORIZED_ACCESS_ATTEMPT',
        category: 'Security',
        entity_type: 'route',
        details: `Attempted access to ${path}`,
        metadata: { ip: req.ip, user_agent: req.headers.get('user-agent'), claim_source: user.app_metadata?.tenantId ? 'JWT' : 'DB' }
      })

      return NextResponse.rewrite(new URL('/403', req.url))
    }
  }

  // 7. Final Rewrite
  // Pass branding headers in the final response
  const finalResponse = NextResponse.rewrite(rewriteUrl, {
    request: {
      headers: requestHeaders
    }
  })

  // Copy cookies from our temp response (which captured token refreshes) to final response
  // This ensures the browser gets the Set-Cookie headers
  response.cookies.getAll().forEach((cookie) => {
    finalResponse.cookies.set(cookie.name, cookie.value, cookie)
  })

  return finalResponse
}

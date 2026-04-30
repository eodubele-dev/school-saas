import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { SIDEBAR_LINKS, type UserRole } from '@/config/sidebar'

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|visuals|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}

export default async function middleware(req: NextRequest) {
  try {
    const url = req.nextUrl
    const hostname = req.headers.get('host')

    console.log(`[Middleware Check] Hostname: ${hostname}, URL: ${url.pathname}`)

    // Check env vars early
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('[Middleware Error] Missing Supabase Environment Variables!')
      return NextResponse.next()
    }

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
                // Adaptive domain for Vercel/Local
                domain: process.env.NODE_ENV === 'production' && hostname?.includes('eduflow.ng') ? '.eduflow.ng' : undefined
              })
            )
          },
        },
      }
    )
    // 🚨 Platinum Guard: Aggressive Static Asset Bypass
    // This prevents any internal Next.js assets from being touched by the multi-tenant logic
    const isStaticAsset = url.pathname.includes('/_next/') || 
                          url.pathname.includes('/visuals/') ||
                          url.pathname.includes('/api/') ||
                          /\.(svg|png|jpg|jpeg|gif|webp|ico|css|js)$/.test(url.pathname)

    if (isStaticAsset) {
        return response
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError) console.error('[Middleware Auth Error]', authError)

    // 1. Hostname Analysis & Tenant Extraction
    const rootDomain = 'eduflow.ng'
    let host = hostname?.replace(/:\d+$/, '') || '' // remove port
    
    // Normalize host for analysis
    let currentHost: string | null = null

    // Main domain detection logic (PLATINUM ROBUST)
    let isMainDomain = host === rootDomain || 
                         host === `www.${rootDomain}` || 
                         host === 'localhost' || 
                         host === '127.0.0.1' ||
                         host.endsWith('.vercel.app') || 
                         host.endsWith('.amplifyapp.com')

    if (!isMainDomain) {
      // Subdomain Extraction
      // If it ends with .eduflow.ng, extract the part before it
      if (host.endsWith(`.${rootDomain}`)) {
        currentHost = host.replace(`.${rootDomain}`, '')
      } else if (host.endsWith('.localhost')) {
        currentHost = host.replace('.localhost', '')
      } else {
        // Fallback for custom domains in the future
        // For now, assume it's a direct subdomain if not main domain
        currentHost = host.split('.')[0]
      }
    }

    // Continue with the rest of the logic...
    // [I will keep the rest of the file logic but just ensuring it's inside the try block]
    
    // ... (rest of the code remains the same as viewed before)

  // 1b. Path Analysis (Support for Monolithic Desktop / Path-based Tenants)
  let isPathBasedTenant = false
  if (isMainDomain) {
    const segments = url.pathname.split('/').filter(Boolean)
    if (segments.length > 0) {
      const firstSegment = segments[0]
      // Exclude known system paths and auth basics
      const reservedPaths = [
        'onboard', 'setup', 'auth', 'api', '403', '404', 'super-admin', 
        'docs', 'about', 'login', 'privacy', 'success-stories', 'terms',
        'dashboard', 'settings', 'profile', 'billing', 'visuals'
      ]
      if (!reservedPaths.includes(firstSegment) && !firstSegment.includes('[') && !firstSegment.includes(']')) {
        currentHost = firstSegment
        isPathBasedTenant = true
        // Set isMainDomain to false since we found a path-based tenant
        // @ts-ignore
        isMainDomain = false 
        // Adjust the internal pathname for subsequent logic
        const newPathname = '/' + segments.slice(1).join('/')
        url.pathname = newPathname
      }
    }
  }

  console.log(`[Middleware] Host: ${hostname}, CurrentHost: ${currentHost}, Path: ${req.nextUrl.pathname}, InternalPath: ${url.pathname}`)

  // Handle Main Domain matches (No tenant found in subdomain or path)
  if (isMainDomain) {
    console.log('[Middleware] Main domain detected')

    // 🚨 Super-Admin Protection Gate
    if (url.pathname.startsWith('/super-admin') && url.pathname !== '/super-admin/login') {
      if (!user) {
        return NextResponse.redirect(new URL(`/super-admin/login?next=${url.pathname}`, req.url))
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      const developers = ['devimagined@gmail.com', 'e.odubele@gmail.com']
      if (profile?.role !== 'super-admin' && profile?.role !== 'owner' && !developers.includes(user.email || '')) {
        console.warn(`UNAUTHORIZED PLATFORM ACCESS ATTEMPT: ${user.email} with role ${profile?.role} attempted to visit /super-admin`)
        return NextResponse.rewrite(new URL('/403', req.url))
      }
    }

    // Reset internal pathname if it was accidentally modified by path-based branch
    return response
  }

  // 🚨 Subdomain-to-Main Redirect for Platform Tools
  if (url.pathname.startsWith('/super-admin')) {
    const mainUrl = new URL(url.pathname, `https://eduflow.ng`)
    return NextResponse.redirect(mainUrl)
  }

  // 2. Tenant Verification (The "Filter")
  if (!currentHost) {
    console.log('[Middleware] Skip tenant check: No host resolved')
    return response
  }

  const { data: tenant, error: tenantErr } = await supabase
    .from('tenants')
    .select('id, name, slug, logo_url, theme_config')
    .eq('slug', currentHost.toLowerCase())
    .single()

  if (tenantErr || !tenant) {
    console.log(`[Middleware] Tenant not found Error:`, tenantErr)
    return NextResponse.rewrite(new URL('/404', req.url))
  }
  console.log(`[Middleware] Tenant found: ${tenant.id}`)

  // 3. Contextual Branding Injection
  // Create a new Headers object for the rewrite request
  const requestHeaders = new Headers(req.headers)

  requestHeaders.set('x-school-id', tenant.id)
  requestHeaders.set('x-school-name', tenant.name)
  requestHeaders.set('x-school-slug', tenant.slug)
  if (tenant.logo_url) requestHeaders.set('x-school-logo', tenant.logo_url)
  if (tenant.theme_config) {
    requestHeaders.set('x-school-theme', JSON.stringify(tenant.theme_config))
  }


  // 4. Onboarding Protection
  // Subdomains should NOT access /onboard/setup. That is for Main Domain only.
  if (url.pathname.startsWith('/onboard')) {
    return NextResponse.redirect(new URL('https://eduflow.ng/onboard/setup')) // Force main domain
  }


  // 5. Root Redirect Logic
  // Redirect /school1/ -> /school1/dashboard
  const path = url.pathname
  const searchParams = req.nextUrl.searchParams.toString()

  if (path === '/' && currentHost && currentHost !== 'localhost' && currentHost !== 'www') {
    const redirectUrl = isPathBasedTenant ? `/${currentHost}/dashboard` : '/dashboard'
    return NextResponse.redirect(new URL(redirectUrl, req.url))
  }

  // 6. Rewrite Logic (Path Routing)
  // For subdomains (school1.eduflow.ng), we must internalize the slug: /dashboard -> /school1/dashboard
  // For path-based tenants (localhost:3000/school1/dashboard), we DON'T rewrite as it already manifests the slug.
  
  let finalResponse: NextResponse

  if (isPathBasedTenant) {
    // Already has /school1/... structure
    finalResponse = NextResponse.next({
      request: {
        headers: requestHeaders
      }
    })
  } else {
    // Subdomain mode: Add /school1 prefix to path
    // CRITICAL: Prevent recursive rewrite if already rewritten
    const isAlreadyRewritten = path.startsWith(`/${currentHost}/`) || path === `/${currentHost}`
    
    if (isAlreadyRewritten) {
      console.log(`[Middleware] Path already matches internal slug structure: ${path}. Skipping rewrite.`)
      finalResponse = NextResponse.next({
        request: {
          headers: requestHeaders
        }
      })
    } else {
      const rewriteUrl = new URL(
        `/${currentHost}${path}${searchParams.length > 0 ? `?${searchParams}` : ''}`, 
        req.url
      )
      
      console.log(`[Middleware] Rewriting to: ${rewriteUrl.pathname}`)
      
      finalResponse = NextResponse.rewrite(rewriteUrl, {
        request: {
          headers: requestHeaders
        }
      })
    }
  }


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
    if (userTenantId !== tenant.id && userRole !== 'owner' && userRole !== 'super-admin') {
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

    // Allow owners to access admin routes natively. Staff can ONLY access specific admin sub-routes like Gate Control.
    if (isTryingAdmin) {
      if (role === 'owner' || role === 'admin' || role === 'super-admin') {
        // Built-in logic: Fully permitted
      } else if (role === 'staff' && (path.startsWith('/dashboard/admin/security/gate') || path.startsWith('/dashboard/admin/health'))) {
        // Staff logic: Permitted ONLY for Gate Control & Health
      } else if (role === 'teacher' && path.startsWith('/dashboard/admin/curriculum')) {
        // Teacher logic: Permitted ONLY for Curriculum Planning
      } else {
        isViolation = true
      }
    }

    if (isTryingBursar && role !== 'bursar' && role !== 'admin' && role !== 'owner' && role !== 'super-admin') {
      // Permission-based "Sub-Role" bypass
      const { data: perm } = await supabase
        .from('staff_permissions')
        .select('can_view_financials')
        .eq('staff_id', user.id)
        .single()

      if (!perm?.can_view_financials) {
        isViolation = true
      }
    }

    if (role === 'student' || role === 'parent') {
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

  // Copy cookies from our temp response (which captured token refreshes) to final response
  // This ensures the browser gets the Set-Cookie headers
  if (finalResponse) {
    response.cookies.getAll().forEach((cookie) => {
      finalResponse.cookies.set(cookie.name, cookie.value, cookie)
    })
    return finalResponse
  }

  return response

  } catch (e) {
    console.error('[Middleware Fatal Error]', e)
    return NextResponse.next()
  }
}

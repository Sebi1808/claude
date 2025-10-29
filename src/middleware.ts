import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  
  // DEMO MODE: Komplett deaktiviert für Testing ohne Auth
  // Alle Routes sind frei zugänglich
  return res

  // Original Auth-Code (auskommentiert für Demo)
  /*
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Fallback: In Dev nicht crashen, wenn Env fehlt
  if (!supabaseUrl || !supabaseAnonKey) {
    return res
  }

  const supabase = createMiddlewareClient({
    req,
    res,
    supabaseUrl,
    supabaseKey: supabaseAnonKey,
  })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Check if user is accessing auth pages
  const isAuthPage = req.nextUrl.pathname.startsWith('/auth')

  // If user is logged in and trying to access auth pages, redirect to home
  if (session && isAuthPage && !req.nextUrl.pathname.includes('/callback')) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  // If user is not logged in and trying to access protected pages, redirect to login
  if (!session && !isAuthPage) {
    const redirectUrl = new URL('/auth/login', req.url)
    redirectUrl.searchParams.set('redirect', req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  return res
  */
}

export const config = {
  matcher: [
    // Temporarily disabled to debug
    // '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

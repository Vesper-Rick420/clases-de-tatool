// src/lib/supabase/middleware.ts
// Cliente Supabase específico para el middleware de Next.js
// Se usa SOLO en: src/middleware.ts

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '@/types/database'

export async function updateSession(request: NextRequest) {
  // Creamos una respuesta inicial que podemos modificar
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Actualizar cookies tanto en request como en response
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANTE: getUser() refresca el token de sesión automáticamente
  // Nunca usar getSession() aquí — puede no ser confiable en el servidor
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // ── PROTECCIÓN DE RUTAS ──────────────────────────────────

  const path = request.nextUrl.pathname

  // Si el usuario NO está autenticado e intenta acceder al dashboard
  if (!user && path.startsWith('/dashboard')) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirectTo', path) // Recordamos a dónde quería ir
    return NextResponse.redirect(url)
  }

  // Si el usuario YA está autenticado e intenta acceder a login/register
  if (user && (path === '/login' || path === '/register')) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
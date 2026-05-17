// src/lib/supabase/server.ts
// Cliente Supabase para componentes del LADO DEL SERVIDOR
// Se usa en: Server Components, Route Handlers, Server Actions

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'

export async function createClient() {
  // En el servidor, leemos las cookies para la sesión del usuario
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // setAll puede fallar en Server Components (solo lectura)
            // Es normal, el middleware se encarga de refrescar la sesión
          }
        },
      },
    }
  )
}
// src/lib/supabase/client.ts
// Cliente Supabase para componentes del LADO DEL CLIENTE (browser)
// Se usa en: componentes con "use client", hooks, formularios

import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database'

// Creamos una sola instancia para toda la app (singleton)
export function createClient() {
  return createBrowserClient<Database>(
    // Estas variables están disponibles en el cliente porque tienen NEXT_PUBLIC_
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
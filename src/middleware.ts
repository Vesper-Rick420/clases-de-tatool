// src/middleware.ts
// El middleware se ejecuta ANTES de cada request
// Aquí protegemos rutas y verificamos autenticación

import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  // Delegamos toda la lógica a nuestra función de supabase
  return await updateSession(request)
}

// Configurar en qué rutas se ejecuta el middleware
// Excluimos archivos estáticos y rutas de API internas de Next.js
export const config = {
  matcher: [
    /*
     * Ejecutar en todas las rutas EXCEPTO:
     * - _next/static (archivos estáticos)
     * - _next/image (optimización de imágenes)
     * - favicon.ico, archivos de imagen
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
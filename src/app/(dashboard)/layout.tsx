// src/app/(dashboard)/layout.tsx
// Layout raíz para todas las rutas protegidas del dashboard
// Verifica autenticación y renderiza Sidebar + Header

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/layout/Sidebar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  // Verificar que el usuario está autenticado
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  // Obtener perfil del usuario desde nuestra tabla
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) {
    redirect('/login')
  }

  // Verificar que el usuario no esté bloqueado
  if (profile.status === 'blocked') {
    redirect('/login?error=blocked')
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Sidebar fijo */}
      <Sidebar
        role={profile.role}
        userName={profile.full_name || profile.email}
        userEmail={profile.email}
        avatarUrl={profile.avatar_url}
      />

      {/* Contenido principal con margen izquierdo del sidebar */}
      <main
        className="min-h-screen"
        style={{ marginLeft: 'var(--sidebar-width)' }}
      >
        {children}
      </main>
    </div>
  )
}
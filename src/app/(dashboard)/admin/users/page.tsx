// src/app/(dashboard)/admin/users/page.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/Header'
import { UsersTable } from '@/components/admin/UsersTable'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Gestión de Usuarios' }

export default async function UsersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/student')

  const { data: users } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <Header
        title="Gestión de Usuarios"
        subtitle={`${users?.length ?? 0} usuarios registrados en la plataforma`}
      />
      <div className="p-6">
        <UsersTable users={users ?? []} />
      </div>
    </div>
  )
}
// src/app/(dashboard)/student/profile/page.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/Header'
import { ProfileForm } from '@/components/student/ProfileForm'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Mi Perfil' }

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single()
  if (!profile) redirect('/login')

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      <Header title="Mi Perfil" subtitle="Gestiona tu información personal" />
      <div className="p-6 max-w-2xl mx-auto">
        <ProfileForm profile={profile} />
      </div>
    </div>
  )
}
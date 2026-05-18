// src/app/(dashboard)/admin/courses/page.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/Header'
import { AdminCoursesClient } from '@/components/admin/courses/AdminCoursesClient'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Gestión de Cursos' }

export default async function AdminCoursesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/student')

  // Cargar cursos con su categoría
  const { data: courses } = await supabase
    .from('courses')
    .select(`
      *,
      categories ( name, color )
    `)
    .order('created_at', { ascending: false })

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      <Header
        title="Gestión de Cursos"
        subtitle={`${courses?.length ?? 0} cursos en la plataforma`}
      />
      <div className="p-6">
        <AdminCoursesClient
          initialCourses={courses ?? []}
          categories={categories ?? []}
          adminId={user.id}
        />
      </div>
    </div>
  )
}
// src/app/(dashboard)/admin/categories/page.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/Header'
import { CategoriesClient } from '@/components/admin/CategoriesClient'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Categorías' }

export default async function CategoriesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/student')

  const { data: categories } = await supabase
    .from('categories').select('*').order('name')

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      <Header title="Categorías" subtitle="Organiza tus cursos por categoría" />
      <div className="p-6 max-w-3xl">
        <CategoriesClient initialCategories={categories ?? []} />
      </div>
    </div>
  )
}
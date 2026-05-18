// src/app/(dashboard)/admin/courses/[courseId]/page.tsx
import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/Header'
import { LevelsManager } from '@/components/admin/courses/content/LevelsManager'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ courseId: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { courseId } = await params
  const supabase = await createClient()
  const { data } = await supabase
    .from('courses').select('title').eq('id', courseId).single()
  return { title: `Gestionar: ${data?.title ?? 'Curso'}` }
}

export default async function ManageCoursePage({ params }: PageProps) {
  const { courseId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/student')

  // Cargar curso con niveles y lecciones
  const { data: course } = await supabase
    .from('courses').select('*').eq('id', courseId).single()
  if (!course) notFound()

  const { data: levels } = await supabase
    .from('levels').select('*')
    .eq('course_id', courseId).order('sort_order')

  const levelsWithLessons = await Promise.all(
    (levels ?? []).map(async (level) => {
      const { data: lessons } = await supabase
        .from('lessons').select('*')
        .eq('level_id', level.id).order('sort_order')
      return { ...level, lessons: lessons ?? [] }
    })
  )

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      <Header
        title={course.title}
        subtitle="Gestión de niveles y lecciones"
      />
      <div className="p-6 max-w-4xl mx-auto space-y-4">
        <Link
          href="/admin/courses"
          className="inline-flex items-center gap-1.5 text-sm transition-colors"
          style={{ color: 'var(--text-muted)' }}
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a cursos
        </Link>

        <LevelsManager
          course={course}
          initialLevels={levelsWithLessons}
        />
      </div>
    </div>
  )
}
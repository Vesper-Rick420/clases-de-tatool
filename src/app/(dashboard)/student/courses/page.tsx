// src/app/(dashboard)/student/courses/page.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/Header'
import { CourseProgressCard } from '@/components/courses/CourseProgressCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { BookOpen } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Mis Cursos' }

export default async function StudentCoursesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Verificar rol
  const { data: profile } = await supabase
    .from('profiles').select('role, full_name').eq('id', user.id).single()
  if (profile?.role === 'admin') redirect('/admin')

  // Cursos con acceso
  const { data: accessRows } = await supabase
    .from('course_access')
    .select('course_id')
    .eq('user_id', user.id)
    .eq('is_active', true)

  const courseIds = (accessRows ?? []).map(a => a.course_id)

  const { data: courses } = courseIds.length > 0
    ? await supabase
        .from('courses')
        .select('*')
        .in('id', courseIds)
        .eq('status', 'published')
        .order('title')
    : { data: [] }

  // Progreso de cada curso
  const { data: allProgress } = await supabase
    .from('lesson_progress')
    .select('*')
    .eq('user_id', user.id)

  // Calcular progreso por curso
  const progressData: Record<string, {
    progress: number; completedLessons: number; totalLessons: number
  }> = {}

  for (const course of courses ?? []) {
    const { data: lessons } = await supabase
      .from('lessons').select('id')
      .eq('course_id', course.id).eq('is_published', true)
    const total     = lessons?.length ?? 0
    const completed = (allProgress ?? []).filter(
      p => p.course_id === course.id && p.is_completed
    ).length
    progressData[course.id] = {
      progress: total > 0 ? Math.round((completed / total) * 100) : 0,
      completedLessons: completed,
      totalLessons: total,
    }
  }

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      <Header
        title="Mis Cursos"
        subtitle={`${courses?.length ?? 0} cursos disponibles para ti`}
      />

      <div className="p-6">
        {!courses || courses.length === 0 ? (
          <div className="card">
            <EmptyState
              icon={BookOpen}
              title="No tienes cursos asignados"
              description="El administrador debe asignarte acceso a los cursos para que aparezcan aquí."
            />
          </div>
        ) : (
          <>
            {/* Filtros rápidos */}
            <div className="flex gap-3 mb-6 flex-wrap">
              {['Todos', 'En progreso', 'Completados', 'Sin iniciar'].map(f => (
                <button
                  key={f}
                  className="px-3 py-1.5 rounded-[var(--radius-sm)] text-xs font-medium transition-all"
                  style={{
                    background: f === 'Todos' ? 'var(--accent)' : 'var(--bg-elevated)',
                    color: f === 'Todos' ? '#fff' : 'var(--text-secondary)',
                  }}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Grid de cursos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {courses.map((course, i) => (
                <div
                  key={course.id}
                  className={`stagger-${Math.min(i + 1, 6)}`}
                >
                  <CourseProgressCard
                    course={course}
                    progress={progressData[course.id]?.progress ?? 0}
                    completedLessons={progressData[course.id]?.completedLessons ?? 0}
                    totalLessons={progressData[course.id]?.totalLessons ?? 0}
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
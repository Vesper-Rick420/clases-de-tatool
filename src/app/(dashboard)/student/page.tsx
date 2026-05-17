// src/app/(dashboard)/student/page.tsx
// Dashboard principal del estudiante
// Muestra bienvenida, cursos con progreso y lecciones recientes

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/Header'
import { WelcomeBanner } from '@/components/dashboard/WelcomeBanner'
import { CourseProgressCard } from '@/components/courses/CourseProgressCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { LessonItem } from '@/components/dashboard/LessonItem'
import { BookOpen, Clock } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Mi Dashboard' }

export default async function StudentDashboardPage() {
  const supabase = await createClient()

  // ── Auth ────────────────────────────────────────────────
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')
  // Admins van a su propio dashboard
  if (profile.role === 'admin') redirect('/admin')

  // ── Cursos con acceso ───────────────────────────────────
  const { data: accessRows } = await supabase
    .from('course_access')
    .select('course_id')
    .eq('user_id', user.id)
    .eq('is_active', true)

  const courseIds = (accessRows ?? []).map(a => a.course_id)

  // Si no tiene acceso a ningún curso
  if (courseIds.length === 0) {
    return (
      <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
        <Header
          title="Mi Dashboard"
          subtitle={`Bienvenido, ${profile.full_name || profile.email}`}
        />
        <div className="p-6 space-y-6">
          <WelcomeBanner
            userName={profile.full_name || profile.email}
            totalCourses={0}
            completedCourses={0}
            overallProgress={0}
          />
          <div className="card">
            <EmptyState
              icon={BookOpen}
              title="Aún no tienes cursos asignados"
              description="Contacta al administrador para que te dé acceso a los cursos disponibles."
            />
          </div>
        </div>
      </div>
    )
  }

  // ── Cargar cursos y progreso en paralelo ────────────────
  const [{ data: courses }, { data: allProgress }] = await Promise.all([
    supabase
      .from('courses')
      .select('*')
      .in('id', courseIds)
      .eq('status', 'published'),
    supabase
      .from('lesson_progress')
      .select('*')
      .eq('user_id', user.id)
      .in('course_id', courseIds),
  ])

  // ── Calcular progreso por curso ─────────────────────────
  const courseProgressMap: Record<string, {
    progress: number
    completedLessons: number
    totalLessons: number
  }> = {}

  for (const course of courses ?? []) {
    const { data: lessons } = await supabase
      .from('lessons')
      .select('id')
      .eq('course_id', course.id)
      .eq('is_published', true)

    const totalLessons     = lessons?.length ?? 0
    const completedLessons = (allProgress ?? []).filter(
      p => p.course_id === course.id && p.is_completed
    ).length

    const progress = totalLessons > 0
      ? Math.round((completedLessons / totalLessons) * 100)
      : 0

    courseProgressMap[course.id] = { progress, completedLessons, totalLessons }
  }

  // ── Calcular progreso general ───────────────────────────
  const totalLessonsAll    = Object.values(courseProgressMap).reduce((s, c) => s + c.totalLessons, 0)
  const completedLessonsAll = Object.values(courseProgressMap).reduce((s, c) => s + c.completedLessons, 0)
  const overallProgress    = totalLessonsAll > 0
    ? Math.round((completedLessonsAll / totalLessonsAll) * 100)
    : 0
  const completedCourses   = Object.values(courseProgressMap).filter(c => c.progress === 100).length

  // ── Lecciones recientes (en curso) ─────────────────────
  const recentProgressItems = (allProgress ?? [])
    .filter(p => !p.is_completed && p.watch_time > 0)
    .sort((a, b) =>
      new Date(b.last_watched_at).getTime() - new Date(a.last_watched_at).getTime()
    )
    .slice(0, 5)

  // Cargar detalles de lecciones recientes
  const recentLessonIds = recentProgressItems.map(p => p.lesson_id)
  const { data: recentLessons } = recentLessonIds.length > 0
    ? await supabase.from('lessons').select('*').in('id', recentLessonIds)
    : { data: [] }

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      <Header
        title="Mi Dashboard"
        subtitle={`Bienvenido, ${profile.full_name || profile.email}`}
      />

      <div className="p-6 space-y-6">

        {/* ── Banner de bienvenida ─────────────────────── */}
        <WelcomeBanner
          userName={profile.full_name || profile.email}
          totalCourses={courses?.length ?? 0}
          completedCourses={completedCourses}
          overallProgress={overallProgress}
        />

        {/* ── Grid: Mis cursos + En progreso ───────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* Mis cursos (2/3 del ancho) */}
          <div className="xl:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold text-lg"
                style={{ color: 'var(--text-primary)' }}>
                Mis Cursos
              </h2>
              
                href="/student/courses"
                className="text-xs font-medium"
                style={{ color: 'var(--accent)' }}
              >
                Ver todos →
              </a>
            </div>

            {!courses || courses.length === 0 ? (
              <div className="card">
                <EmptyState
                  icon={BookOpen}
                  title="No hay cursos disponibles"
                  description="Los cursos asignados aparecerán aquí."
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {courses.slice(0, 4).map((course, i) => (
                  <div key={course.id} className={`stagger-${i + 1}`}>
                    <CourseProgressCard
                      course={course}
                      progress={courseProgressMap[course.id]?.progress ?? 0}
                      completedLessons={courseProgressMap[course.id]?.completedLessons ?? 0}
                      totalLessons={courseProgressMap[course.id]?.totalLessons ?? 0}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar: En progreso ───────────────────────── */}
          <div className="space-y-4">
            <h2 className="font-display font-bold text-lg"
              style={{ color: 'var(--text-primary)' }}>
              Continuar viendo
            </h2>

            <div className="card p-4">
              {recentLessons && recentLessons.length > 0 ? (
                <div className="space-y-1">
                  {recentLessons.map((lesson) => {
                    const prog = recentProgressItems.find(p => p.lesson_id === lesson.id)
                    return (
                      <LessonItem
                        key={lesson.id}
                        lesson={lesson}
                        progress={prog ?? null}
                        courseId={lesson.course_id}
                      />
                    )
                  })}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <Clock className="w-8 h-8 mx-auto mb-2"
                    style={{ color: 'var(--text-muted)' }} />
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    No hay lecciones en curso
                  </p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                    Comienza un curso para verlo aquí
                  </p>
                </div>
              )}
            </div>

            {/* Estadísticas rápidas */}
            <div className="card p-4 space-y-3">
              <h3 className="font-display font-semibold text-sm"
                style={{ color: 'var(--text-primary)' }}>
                Mis estadísticas
              </h3>
              {[
                { label: 'Lecciones completadas', value: completedLessonsAll, color: 'var(--success)' },
                { label: 'Total de lecciones',    value: totalLessonsAll,     color: 'var(--info)'    },
                { label: 'Cursos en progreso',
                  value: (courses?.length ?? 0) - completedCourses,
                  color: 'var(--accent)' },
                { label: 'Cursos completados',    value: completedCourses,    color: 'var(--warning)' },
              ].map(stat => (
                <div key={stat.label} className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {stat.label}
                  </span>
                  <span
                    className="text-sm font-bold font-display"
                    style={{ color: stat.color }}
                  >
                    {stat.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
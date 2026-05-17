// src/app/(dashboard)/student/courses/[courseId]/page.tsx
import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/Header'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { LessonItem } from '@/components/dashboard/LessonItem'
import { Badge } from '@/components/ui/Badge'
import { BookOpen, Clock, ChevronDown } from 'lucide-react'
import { formatDuration } from '@/lib/utils'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ courseId: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { courseId } = await params
  const supabase = await createClient()
  const { data } = await supabase
    .from('courses').select('title').eq('id', courseId).single()
  return { title: data?.title ?? 'Curso' }
}

export default async function CourseDetailPage({ params }: PageProps) {
  const { courseId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Verificar acceso al curso
  const { data: access } = await supabase
    .from('course_access')
    .select('id')
    .eq('user_id', user.id)
    .eq('course_id', courseId)
    .eq('is_active', true)
    .single()

  if (!access) redirect('/student/courses')

  // Cargar curso, niveles y lecciones en paralelo
  const [
    { data: course },
    { data: levels },
    { data: allProgress },
  ] = await Promise.all([
    supabase.from('courses').select('*').eq('id', courseId).single(),
    supabase.from('levels').select('*').eq('course_id', courseId)
      .order('sort_order'),
    supabase.from('lesson_progress').select('*')
      .eq('user_id', user.id).eq('course_id', courseId),
  ])

  if (!course) notFound()

  // Cargar lecciones de cada nivel
  const levelsWithLessons = await Promise.all(
    (levels ?? []).map(async (level) => {
      const { data: lessons } = await supabase
        .from('lessons')
        .select('*')
        .eq('level_id', level.id)
        .eq('is_published', true)
        .order('sort_order')
      return { ...level, lessons: lessons ?? [] }
    })
  )

  // Calcular progreso
  const totalLessons     = levelsWithLessons.reduce((s, l) => s + l.lessons.length, 0)
  const completedLessons = (allProgress ?? []).filter(p => p.is_completed).length
  const progress         = totalLessons > 0
    ? Math.round((completedLessons / totalLessons) * 100)
    : 0

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      <Header title={course.title} subtitle="Detalle del curso" />

      <div className="p-6 max-w-4xl mx-auto space-y-6">

        {/* ── Hero del curso ───────────────────────────── */}
        <div
          className="card p-0 overflow-hidden slide-up"
          style={{ background: 'var(--bg-card)' }}
        >
          {/* Thumbnail */}
          {course.thumbnail_url && (
            <div className="w-full h-52 overflow-hidden">
              <img
                src={course.thumbnail_url}
                alt={course.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-6">
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge variant={
                course.status === 'published' ? 'success' :
                course.status === 'draft' ? 'warning' : 'default'
              }>
                {course.status === 'published' ? 'Publicado' : 'Borrador'}
              </Badge>
              {course.is_featured && (
                <Badge variant="accent">⭐ Destacado</Badge>
              )}
            </div>

            <h1
              className="text-2xl font-display font-bold mb-2"
              style={{ color: 'var(--text-primary)' }}
            >
              {course.title}
            </h1>

            {course.description && (
              <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                {course.description}
              </p>
            )}

            {/* Stats del curso */}
            <div className="flex flex-wrap gap-4 mb-4">
              {[
                { icon: BookOpen, label: `${totalLessons} lecciones` },
                { icon: Clock,    label: course.total_duration > 0
                    ? formatDuration(course.total_duration * 60)
                    : 'Sin duración' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <Icon className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {label}
                  </span>
                </div>
              ))}
            </div>

            {/* Progreso */}
            <ProgressBar
              value={progress}
              showLabel
              size="md"
              color={progress >= 100 ? 'success' : 'accent'}
            />
            <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>
              {completedLessons} de {totalLessons} lecciones completadas
            </p>
          </div>
        </div>

        {/* ── Contenido del curso (niveles y lecciones) ── */}
        <div className="space-y-3">
          <h2
            className="font-display font-bold text-lg"
            style={{ color: 'var(--text-primary)' }}
          >
            Contenido del curso
          </h2>

          {levelsWithLessons.length === 0 ? (
            <div className="card p-8 text-center">
              <p style={{ color: 'var(--text-muted)' }}>
                Este curso no tiene contenido disponible aún.
              </p>
            </div>
          ) : (
            levelsWithLessons.map((level, levelIdx) => {
              const levelCompleted = level.lessons.filter(l =>
                (allProgress ?? []).some(p => p.lesson_id === l.id && p.is_completed)
              ).length

              return (
                <div key={level.id} className="card overflow-hidden slide-up"
                  style={{ animationDelay: `${levelIdx * 0.05}s` }}>

                  {/* Header del nivel */}
                  <div
                    className="flex items-center justify-between px-5 py-4"
                    style={{ borderBottom: '1px solid var(--border)' }}
                  >
                    <div>
                      <h3
                        className="font-display font-bold text-sm"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {levelIdx + 1}. {level.title}
                      </h3>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        {levelCompleted}/{level.lessons.length} completadas
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <ProgressBar
                        value={level.lessons.length > 0
                          ? Math.round((levelCompleted / level.lessons.length) * 100)
                          : 0}
                        size="sm"
                        className="w-24"
                      />
                      <ChevronDown
                        className="w-4 h-4"
                        style={{ color: 'var(--text-muted)' }}
                      />
                    </div>
                  </div>

                  {/* Lecciones */}
                  <div className="p-2">
                    {level.lessons.length === 0 ? (
                      <p className="text-xs text-center py-4"
                        style={{ color: 'var(--text-muted)' }}>
                        Sin lecciones publicadas
                      </p>
                    ) : (
                      level.lessons.map(lesson => {
                        const prog = (allProgress ?? []).find(
                          p => p.lesson_id === lesson.id
                        )
                        return (
                          <LessonItem
                            key={lesson.id}
                            lesson={lesson}
                            progress={prog ?? null}
                            courseId={courseId}
                          />
                        )
                      })
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
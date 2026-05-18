// src/app/(dashboard)/student/courses/[courseId]/lesson/[lessonId]/page.tsx
import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/Header'
import { VideoPlayer } from '@/components/courses/VideoPlayer'
import { LessonItem } from '@/components/dashboard/LessonItem'
import { Badge } from '@/components/ui/Badge'
import { ArrowLeft, ArrowRight, Download } from 'lucide-react'
import Link from 'next/link'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ courseId: string; lessonId: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lessonId } = await params
  const supabase = await createClient()
  const { data } = await supabase
    .from('lessons').select('title').eq('id', lessonId).single()
  return { title: data?.title ?? 'Lección' }
}

export default async function LessonPage({ params }: PageProps) {
  const { courseId, lessonId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Verificar acceso al curso
  const { data: access } = await supabase
    .from('course_access').select('id')
    .eq('user_id', user.id).eq('course_id', courseId)
    .eq('is_active', true).single()
  if (!access) redirect('/student/courses')

  // Cargar lección
  const { data: lesson } = await supabase
    .from('lessons').select('*').eq('id', lessonId).single()
  if (!lesson || !lesson.is_published) notFound()

  // Cargar archivos de la lección
  const { data: files } = await supabase
    .from('lesson_files').select('*')
    .eq('lesson_id', lessonId).order('sort_order')

  // Cargar todas las lecciones del curso para la barra lateral
  const { data: allLessons } = await supabase
    .from('lessons').select('*')
    .eq('course_id', courseId).eq('is_published', true)
    .order('sort_order')

  // Progreso del usuario
  const { data: progress } = await supabase
    .from('lesson_progress').select('*')
    .eq('user_id', user.id).eq('course_id', courseId)

  // Lección anterior y siguiente
  const idx  = (allLessons ?? []).findIndex(l => l.id === lessonId)
  const prev = idx > 0 ? allLessons![idx - 1] : null
  const next = idx < (allLessons?.length ?? 0) - 1 ? allLessons![idx + 1] : null

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      <Header title={lesson.title} subtitle="Reproduciendo lección" />

      <div className="flex h-[calc(100vh-var(--header-height))]">
        {/* ── Área principal (video) ───────────────── */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 max-w-4xl mx-auto space-y-4">
            {/* Volver al curso */}
            <Link
              href={`/student/courses/${courseId}`}
              className="inline-flex items-center gap-1.5 text-sm transition-colors"
              style={{ color: 'var(--text-muted)' }}
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al curso
            </Link>

            {/* Video */}
            {lesson.video_url ? (
              <VideoPlayer
                lessonId={lessonId}
                courseId={courseId}
                videoPath={lesson.video_url}
              />
            ) : (
              <div
                className="w-full aspect-video rounded-[var(--radius)] flex items-center justify-center"
                style={{ background: 'var(--bg-elevated)' }}
              >
                <p style={{ color: 'var(--text-muted)' }}>
                  Esta lección no tiene video
                </p>
              </div>
            )}

            {/* Info de la lección */}
            <div className="card p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1
                    className="text-xl font-display font-bold mb-2"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {lesson.title}
                  </h1>
                  {lesson.description && (
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {lesson.description}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  {lesson.is_free && <Badge variant="success">Gratis</Badge>}
                  {lesson.allow_download && <Badge variant="info">Descargable</Badge>}
                </div>
              </div>

              {/* Archivos descargables */}
              {files && files.length > 0 && (
                <div
                  className="mt-4 pt-4"
                  style={{ borderTop: '1px solid var(--border)' }}
                >
                  <p
                    className="text-xs font-semibold uppercase tracking-wider mb-3"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    Archivos adjuntos
                  </p>
                  <div className="space-y-2">
                    {files.map(file => (
                      
                        key={file.id}
                        href={`/api/downloads/${file.id}`}
                        className="flex items-center gap-3 p-3 rounded-[var(--radius-sm)] transition-colors"
                        style={{ background: 'var(--bg-elevated)' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-dim)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                      >
                        <Download className="w-4 h-4 flex-shrink-0"
                          style={{ color: 'var(--accent)' }} />
                        <span className="text-sm flex-1" style={{ color: 'var(--text-primary)' }}>
                          {file.file_name}
                        </span>
                        {file.file_size && (
                          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            {Math.round(file.file_size / 1024)} KB
                          </span>
                        )}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Navegación entre lecciones */}
            <div className="flex gap-3">
              {prev && (
                <Link
                  href={`/student/courses/${courseId}/lesson/${prev.id}`}
                  className="btn-ghost flex-1 justify-center"
                  style={{ border: '1px solid var(--border)' }}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Anterior
                </Link>
              )}
              {next && (
                <Link
                  href={`/student/courses/${courseId}/lesson/${next.id}`}
                  className="btn-primary flex-1 justify-center"
                >
                  Siguiente
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* ── Barra lateral: lista de lecciones ────── */}
        <div
          className="w-80 flex-shrink-0 overflow-y-auto hidden lg:block"
          style={{
            borderLeft: '1px solid var(--border)',
            background:  'var(--bg-secondary)',
          }}
        >
          <div
            className="px-4 py-3 sticky top-0 z-10"
            style={{
              background:   'var(--bg-secondary)',
              borderBottom: '1px solid var(--border)',
            }}
          >
            <p className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: 'var(--text-muted)' }}>
              Contenido del curso
            </p>
          </div>

          <div className="p-2">
            {(allLessons ?? []).map(l => {
              const prog = (progress ?? []).find(p => p.lesson_id === l.id)
              const isActive = l.id === lessonId
              return (
                <div
                  key={l.id}
                  className="rounded-[var(--radius-sm)] overflow-hidden"
                  style={{
                    background: isActive ? 'var(--accent-dim)' : 'transparent',
                    border:     isActive ? '1px solid var(--accent)' : '1px solid transparent',
                    marginBottom: '2px',
                  }}
                >
                  <LessonItem
                    lesson={l}
                    progress={prog ?? null}
                    courseId={courseId}
                  />
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
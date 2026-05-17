// src/components/courses/CourseProgressCard.tsx
'use client'

import { ProgressBar } from '@/components/ui/ProgressBar'
import { BookOpen, Clock, CheckCircle2, PlayCircle } from 'lucide-react'
import Link from 'next/link'
import type { Course } from '@/types/database'
import { cn } from '@/lib/utils'

interface CourseProgressCardProps {
  course: Course
  progress: number          // 0-100
  completedLessons: number
  totalLessons: number
  lastAccessedAt?: string | null
  className?: string
}

export function CourseProgressCard({
  course,
  progress,
  completedLessons,
  totalLessons,
  lastAccessedAt,
  className,
}: CourseProgressCardProps) {
  const isCompleted = progress >= 100
  const isStarted   = progress > 0

  return (
    <Link
      href={`/student/courses/${course.id}`}
      className={cn(
        'card block p-5 group transition-all duration-200 hover:shadow-card-hover',
        className
      )}
    >
      {/* Thumbnail */}
      <div
        className="w-full h-40 rounded-[var(--radius-sm)] mb-4 overflow-hidden relative flex-shrink-0"
        style={{ background: 'var(--bg-elevated)' }}
      >
        {course.thumbnail_url ? (
          <img
            src={course.thumbnail_url}
            alt={course.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="w-12 h-12" style={{ color: 'var(--text-muted)' }} />
          </div>
        )}

        {/* Badge de estado superpuesto */}
        <div className="absolute top-2 right-2">
          {isCompleted ? (
            <span className="badge badge-success">
              <CheckCircle2 className="w-3 h-3" />
              Completado
            </span>
          ) : isStarted ? (
            <span className="badge badge-accent">
              <PlayCircle className="w-3 h-3" />
              En progreso
            </span>
          ) : (
            <span className="badge badge-info">
              Nuevo
            </span>
          )}
        </div>

        {/* Overlay al hover */}
        <div
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          style={{ background: 'rgba(0,0,0,0.5)' }}
        >
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ background: 'var(--accent)', boxShadow: '0 0 20px var(--accent-glow)' }}
          >
            <PlayCircle className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>

      {/* Info del curso */}
      <h3
        className="font-display font-bold text-sm mb-1 line-clamp-2 leading-snug"
        style={{ color: 'var(--text-primary)' }}
      >
        {course.title}
      </h3>

      {course.short_desc && (
        <p
          className="text-xs mb-3 line-clamp-2"
          style={{ color: 'var(--text-muted)' }}
        >
          {course.short_desc}
        </p>
      )}

      {/* Stats row */}
      <div className="flex items-center gap-3 mb-3">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5" style={{ color: 'var(--success)' }} />
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {completedLessons}/{totalLessons} lecciones
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {course.total_duration > 0 ? `${course.total_duration} min` : 'Sin duración'}
          </span>
        </div>
      </div>

      {/* Barra de progreso */}
      <ProgressBar
        value={progress}
        color={isCompleted ? 'success' : isStarted ? 'accent' : 'info'}
        size="sm"
        showLabel
      />
    </Link>
  )
}
// src/components/dashboard/LessonItem.tsx
import { CheckCircle2, Circle, PlayCircle, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDuration } from '@/lib/utils'
import type { Lesson, LessonProgress } from '@/types/database'
import Link from 'next/link'

interface LessonItemProps {
  lesson: Lesson
  progress?: LessonProgress | null
  courseId: string
  isLocked?: boolean
}

export function LessonItem({
  lesson,
  progress,
  courseId,
  isLocked = false,
}: LessonItemProps) {
  const isCompleted = progress?.is_completed ?? false
  const isStarted   = (progress?.watch_time ?? 0) > 0

  const content = (
    <div
      className={cn(
        'flex items-center gap-3 p-3 rounded-[var(--radius-sm)] transition-all duration-150 group',
        isLocked
          ? 'opacity-50 cursor-not-allowed'
          : 'cursor-pointer hover:bg-[var(--bg-elevated)]'
      )}
    >
      {/* Ícono de estado */}
      <div className="flex-shrink-0">
        {isLocked ? (
          <Lock className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
        ) : isCompleted ? (
          <CheckCircle2 className="w-5 h-5" style={{ color: 'var(--success)' }} />
        ) : isStarted ? (
          <PlayCircle className="w-5 h-5" style={{ color: 'var(--accent)' }} />
        ) : (
          <Circle className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
        )}
      </div>

      {/* Info de la lección */}
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            'text-sm font-medium truncate',
            isCompleted
              ? 'line-through'
              : 'group-hover:text-[var(--accent)]'
          )}
          style={{
            color: isCompleted ? 'var(--text-muted)' : 'var(--text-primary)',
            transition: 'color 0.15s',
          }}
        >
          {lesson.title}
        </p>

        {/* Duración */}
        {lesson.video_duration && (
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {formatDuration(lesson.video_duration)}
          </p>
        )}
      </div>

      {/* Badge de progreso */}
      {isStarted && !isCompleted && (
        <span className="badge badge-accent text-[10px]">En curso</span>
      )}
      {isCompleted && (
        <span className="badge badge-success text-[10px]">✓ Listo</span>
      )}
    </div>
  )

  if (isLocked) return content

  return (
    <Link href={`/student/courses/${courseId}/lesson/${lesson.id}`}>
      {content}
    </Link>
  )
}
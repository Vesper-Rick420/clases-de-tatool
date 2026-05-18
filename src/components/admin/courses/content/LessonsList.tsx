// src/components/admin/courses/content/LessonsList.tsx
'use client'

import { Badge } from '@/components/ui/Badge'
import { Pencil, Trash2, Video, FileText, Download } from 'lucide-react'
import { formatDuration } from '@/lib/utils'
import type { Lesson } from '@/types/database'

interface LessonsListProps {
  lessons: Lesson[]
  onEdit:   (lesson: Lesson) => void
  onDelete: (lesson: Lesson) => void
}

export function LessonsList({ lessons, onEdit, onDelete }: LessonsListProps) {
  if (lessons.length === 0) {
    return (
      <p className="text-xs text-center py-4" style={{ color: 'var(--text-muted)' }}>
        Sin lecciones — agrega la primera abajo
      </p>
    )
  }

  return (
    <div className="space-y-1">
      {lessons.map((lesson, idx) => (
        <div
          key={lesson.id}
          className="flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-sm)] group transition-colors"
          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          {/* Número */}
          <span
            className="text-xs font-bold w-5 text-center flex-shrink-0"
            style={{ color: 'var(--text-muted)' }}
          >
            {idx + 1}
          </span>

          {/* Ícono de tipo */}
          <div
            className="w-7 h-7 rounded flex items-center justify-center flex-shrink-0"
            style={{ background: lesson.video_url ? 'var(--accent-dim)' : 'var(--info-dim)' }}
          >
            {lesson.video_url
              ? <Video   className="w-3.5 h-3.5" style={{ color: 'var(--accent)'  }} />
              : <FileText className="w-3.5 h-3.5" style={{ color: 'var(--info)'    }} />
            }
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate"
              style={{ color: 'var(--text-primary)' }}>
              {lesson.title}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              {lesson.video_duration && (
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {formatDuration(lesson.video_duration)}
                </span>
              )}
              {lesson.allow_download && (
                <span className="flex items-center gap-0.5 text-xs"
                  style={{ color: 'var(--success)' }}>
                  <Download className="w-3 h-3" /> Descargable
                </span>
              )}
            </div>
          </div>

          {/* Badges */}
          <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            {lesson.is_free && (
              <Badge variant="success">Gratis</Badge>
            )}
            <Badge variant={lesson.is_published ? 'success' : 'warning'}>
              {lesson.is_published ? 'Publicada' : 'Borrador'}
            </Badge>
          </div>

          {/* Acciones */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(lesson)}
              className="btn-ghost p-1.5"
              title="Editar"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDelete(lesson)}
              className="btn-ghost p-1.5"
              title="Eliminar"
              style={{ color: 'var(--danger)' }}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
// src/components/dashboard/RecentCourses.tsx
import { Badge } from '@/components/ui/Badge'
import type { Course } from '@/types/database'
import { BookOpen, Clock } from 'lucide-react'

interface RecentCoursesProps {
  courses: Course[]
}

export function RecentCourses({ courses }: RecentCoursesProps) {
  return (
    <div className="card p-5 slide-up stagger-5">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-display font-bold text-base"
          style={{ color: 'var(--text-primary)' }}>
          Cursos recientes
        </h3>
        
          href="/admin/courses"
          className="text-xs font-medium"
          style={{ color: 'var(--accent)' }}
        >
          Ver todos →
        </a>
      </div>

      <div className="space-y-2">
        {courses.length === 0 ? (
          <p className="text-sm text-center py-6" style={{ color: 'var(--text-muted)' }}>
            No hay cursos creados
          </p>
        ) : (
          courses.map((course) => (
            <div
              key={course.id}
              className="flex items-center gap-3 p-3 rounded-[var(--radius-sm)] transition-all"
              style={{ background: 'var(--bg-elevated)' }}
            >
              {/* Thumbnail o placeholder */}
              <div
                className="w-10 h-10 rounded-[var(--radius-sm)] flex items-center justify-center flex-shrink-0 overflow-hidden"
                style={{ background: 'var(--bg-card)' }}
              >
                {course.thumbnail_url ? (
                  <img
                    src={course.thumbnail_url}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <BookOpen className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate"
                  style={{ color: 'var(--text-primary)' }}>
                  {course.title}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <Clock className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {course.total_lessons} lecciones
                  </span>
                </div>
              </div>

              <Badge
                variant={
                  course.status === 'published' ? 'success' :
                  course.status === 'draft' ? 'warning' : 'default'
                }
              >
                {course.status === 'published' ? 'Publicado' :
                 course.status === 'draft' ? 'Borrador' : 'Archivado'}
              </Badge>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
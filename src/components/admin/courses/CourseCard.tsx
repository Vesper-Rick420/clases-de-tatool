// src/components/admin/courses/CourseCard.tsx
'use client'

import { Badge } from '@/components/ui/Badge'
import { BookOpen, Edit2, Trash2, Eye, MoreVertical, Users } from 'lucide-react'
import { useState } from 'react'
import type { Course } from '@/types/database'
import { cn } from '@/lib/utils'

interface CourseCardProps {
  course: Course & { categories?: { name: string; color: string } | null }
  onEdit:   (course: Course) => void
  onDelete: (course: Course) => void
  onManage: (courseId: string) => void
}

export function CourseCard({ course, onEdit, onDelete, onManage }: CourseCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="card group overflow-hidden">
      {/* Thumbnail */}
      <div
        className="w-full h-36 overflow-hidden relative"
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
            <BookOpen className="w-10 h-10" style={{ color: 'var(--text-muted)' }} />
          </div>
        )}

        {/* Status badge */}
        <div className="absolute top-2 left-2">
          <Badge variant={
            course.status === 'published' ? 'success' :
            course.status === 'draft'     ? 'warning' : 'default'
          }>
            {course.status === 'published' ? 'Publicado' :
             course.status === 'draft'     ? 'Borrador'  : 'Archivado'}
          </Badge>
        </div>

        {/* Menú de acciones */}
        <div className="absolute top-2 right-2">
          <div className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen) }}
              className="w-7 h-7 rounded-[var(--radius-sm)] flex items-center justify-center transition-all"
              style={{
                background: 'rgba(0,0,0,0.6)',
                color: '#fff',
              }}
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>

            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setMenuOpen(false)}
                />
                <div
                  className="absolute right-0 top-8 z-20 w-44 rounded-[var(--radius-sm)] overflow-hidden shadow-card"
                  style={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-strong)',
                  }}
                >
                  {[
                    {
                      icon: Eye,    label: 'Gestionar',
                      action: () => { onManage(course.id); setMenuOpen(false) },
                      color: 'var(--text-secondary)'
                    },
                    {
                      icon: Edit2,  label: 'Editar curso',
                      action: () => { onEdit(course);     setMenuOpen(false) },
                      color: 'var(--accent-bright)'
                    },
                    {
                      icon: Trash2, label: 'Eliminar',
                      action: () => { onDelete(course);   setMenuOpen(false) },
                      color: 'var(--danger)'
                    },
                  ].map(item => (
                    <button
                      key={item.label}
                      onClick={item.action}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors text-left"
                      style={{ color: item.color }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <item.icon className="w-3.5 h-3.5" />
                      {item.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        {/* Categoría */}
        {course.categories && (
          <div className="flex items-center gap-1.5 mb-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{ background: course.categories.color }}
            />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {course.categories.name}
            </span>
          </div>
        )}

        <h3
          className="font-display font-bold text-sm mb-1 line-clamp-2"
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

        {/* Stats */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {course.total_lessons} lecciones
            </span>
          </div>
        </div>

        {/* Botón gestionar */}
        <button
          onClick={() => onManage(course.id)}
          className="btn-ghost w-full justify-center mt-3 text-xs"
          style={{ border: '1px solid var(--border)' }}
        >
          <Eye className="w-3.5 h-3.5" />
          Gestionar contenido
        </button>
      </div>
    </div>
  )
}
// src/components/admin/courses/AdminCoursesClient.tsx
'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { CourseCard } from './CourseCard'
import { CourseForm } from './CourseForm'
import { Modal } from '@/components/ui/Modal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { Plus, BookOpen, Search } from 'lucide-react'
import type { Course, Category } from '@/types/database'
import { cn } from '@/lib/utils'

interface AdminCoursesClientProps {
  initialCourses: (Course & { categories?: { name: string; color: string } | null })[]
  categories: Category[]
  adminId: string
}

type StatusFilter = 'all' | 'published' | 'draft' | 'archived'

export function AdminCoursesClient({
  initialCourses, categories, adminId
}: AdminCoursesClientProps) {
  const [courses, setCourses] = useState(initialCourses)
  const [search,  setSearch]  = useState('')
  const [filter,  setFilter]  = useState<StatusFilter>('all')

  // Modales
  const [formOpen,   setFormOpen]   = useState(false)
  const [editCourse, setEditCourse] = useState<Course | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Course | null>(null)
  const [deleting, startDelete]     = useTransition()

  const router = useRouter()
  const supabase = createClient()

  // Filtrar cursos
  const filtered = courses.filter(c => {
    const matchSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      (c.short_desc?.toLowerCase() || '').includes(search.toLowerCase())
    const matchFilter = filter === 'all' || c.status === filter
    return matchSearch && matchFilter
  })

  // Abrir formulario de edición
  function handleEdit(course: Course) {
    setEditCourse(course)
    setFormOpen(true)
  }

  // Abrir formulario de creación
  function handleCreate() {
    setEditCourse(null)
    setFormOpen(true)
  }

  // Después de guardar (crear o editar)
  function handleFormSuccess(saved: Course) {
    if (editCourse) {
      setCourses(prev => prev.map(c => c.id === saved.id ? { ...c, ...saved } : c))
    } else {
      setCourses(prev => [{ ...saved, categories: null }, ...prev])
    }
    setFormOpen(false)
    setEditCourse(null)
  }

  // Eliminar curso
  function handleDelete(course: Course) { setDeleteTarget(course) }

  async function confirmDelete() {
    if (!deleteTarget) return
    startDelete(async () => {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', deleteTarget.id)
      if (!error) {
        setCourses(prev => prev.filter(c => c.id !== deleteTarget.id))
      }
      setDeleteTarget(null)
    })
  }

  return (
    <div className="space-y-5 fade-in">

      {/* ── Toolbar ─────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        {/* Búsqueda */}
        <div className="relative w-full sm:w-72">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
            style={{ color: 'var(--text-muted)' }}
          />
          <input
            type="text"
            placeholder="Buscar cursos..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input pl-9"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {/* Filtros de estado */}
          {(['all', 'published', 'draft', 'archived'] as StatusFilter[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'px-3 py-1.5 rounded-[var(--radius-sm)] text-xs font-medium transition-all',
                filter === f
                  ? 'bg-[var(--accent)] text-white'
                  : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              )}
            >
              {f === 'all' ? 'Todos' : f === 'published' ? 'Publicados' :
               f === 'draft' ? 'Borradores' : 'Archivados'}
            </button>
          ))}

          {/* Botón crear */}
          <button onClick={handleCreate} className="btn-primary">
            <Plus className="w-4 h-4" />
            Nuevo curso
          </button>
        </div>
      </div>

      {/* ── Grid de cursos ──────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={BookOpen}
            title={search ? 'No se encontraron cursos' : 'No hay cursos aún'}
            description={search
              ? 'Intenta con otro término de búsqueda'
              : 'Crea el primer curso de la plataforma'}
            action={!search ? { label: 'Crear primer curso', href: '#' } : undefined}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((course, i) => (
            <div key={course.id} className={`stagger-${Math.min(i + 1, 6)}`}>
              <CourseCard
                course={course}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onManage={(id) => router.push(`/admin/courses/${id}`)}
              />
            </div>
          ))}
        </div>
      )}

      {/* ── Modal: Crear/Editar curso ────────────────── */}
      <Modal
        isOpen={formOpen}
        onClose={() => { setFormOpen(false); setEditCourse(null) }}
        title={editCourse ? 'Editar curso' : 'Nuevo curso'}
        size="lg"
      >
        <CourseForm
          course={editCourse}
          categories={categories}
          adminId={adminId}
          onSuccess={handleFormSuccess}
          onCancel={() => { setFormOpen(false); setEditCourse(null) }}
        />
      </Modal>

      {/* ── Diálogo: Confirmar eliminación ──────────── */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Eliminar curso"
        description={`¿Estás seguro de que deseas eliminar "${deleteTarget?.title}"? Esta acción eliminará también todos sus niveles y lecciones. No se puede deshacer.`}
        confirmLabel="Sí, eliminar"
        loading={deleting}
      />
    </div>
  )
}
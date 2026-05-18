// src/components/admin/courses/content/LevelsManager.tsx
'use client'

import { useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { LessonsList } from './LessonsList'
import { LessonForm } from './LessonForm'
import { Modal } from '@/components/ui/Modal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import {
  Plus, Pencil, Trash2, ChevronDown,
  ChevronUp, GripVertical, FolderOpen
} from 'lucide-react'
import type { Course, Level, Lesson } from '@/types/database'
import { cn } from '@/lib/utils'

type LevelWithLessons = Level & { lessons: Lesson[] }

interface LevelsManagerProps {
  course: Course
  initialLevels: LevelWithLessons[]
}

export function LevelsManager({ course, initialLevels }: LevelsManagerProps) {
  const [levels, setLevels]           = useState(initialLevels)
  const [expandedLevel, setExpanded]  = useState<string | null>(
    initialLevels[0]?.id ?? null
  )

  // Estado para crear/editar nivel
  const [levelName,    setLevelName]    = useState('')
  const [editingLevel, setEditingLevel] = useState<Level | null>(null)
  const [levelModal,   setLevelModal]   = useState(false)
  const [deleteLevel,  setDeleteLevel]  = useState<Level | null>(null)

  // Estado para lección
  const [lessonModal,    setLessonModal]    = useState(false)
  const [editingLesson,  setEditingLesson]  = useState<Lesson | null>(null)
  const [targetLevelId,  setTargetLevelId]  = useState<string | null>(null)

  const [isPending, startTransition] = useTransition()
  const supabase = createClient()

  // ── CRUD Niveles ──────────────────────────────────────

  async function handleSaveLevel(e: React.FormEvent) {
    e.preventDefault()
    if (!levelName.trim()) return
    startTransition(async () => {
      if (editingLevel) {
        const { data } = await supabase
          .from('levels')
          .update({ title: levelName.trim() })
          .eq('id', editingLevel.id)
          .select().single()
        if (data) {
          setLevels(prev => prev.map(l =>
            l.id === editingLevel.id ? { ...l, title: data.title } : l
          ))
        }
      } else {
        const { data } = await supabase
          .from('levels')
          .insert({
            course_id:  course.id,
            title:      levelName.trim(),
            sort_order: levels.length,
          })
          .select().single()
        if (data) {
          setLevels(prev => [...prev, { ...data, lessons: [] }])
          setExpanded(data.id)
        }
      }
      setLevelModal(false)
      setLevelName('')
      setEditingLevel(null)
    })
  }

  function openEditLevel(level: Level) {
    setEditingLevel(level)
    setLevelName(level.title)
    setLevelModal(true)
  }

  async function confirmDeleteLevel() {
    if (!deleteLevel) return
    startTransition(async () => {
      await supabase.from('levels').delete().eq('id', deleteLevel.id)
      setLevels(prev => prev.filter(l => l.id !== deleteLevel.id))
      setDeleteLevel(null)
    })
  }

  // ── CRUD Lecciones ───────────────────────────────────

  function openCreateLesson(levelId: string) {
    setEditingLesson(null)
    setTargetLevelId(levelId)
    setLessonModal(true)
  }

  function openEditLesson(lesson: Lesson) {
    setEditingLesson(lesson)
    setTargetLevelId(lesson.level_id)
    setLessonModal(true)
  }

  function handleLessonSaved(lesson: Lesson, isNew: boolean) {
    setLevels(prev => prev.map(l => {
      if (l.id !== lesson.level_id) return l
      return {
        ...l,
        lessons: isNew
          ? [...l.lessons, lesson]
          : l.lessons.map(les => les.id === lesson.id ? lesson : les)
      }
    }))
    setLessonModal(false)
  }

  async function handleDeleteLesson(lesson: Lesson) {
    await supabase.from('lessons').delete().eq('id', lesson.id)
    setLevels(prev => prev.map(l => ({
      ...l,
      lessons: l.lessons.filter(les => les.id !== lesson.id)
    })))
  }

  return (
    <div className="space-y-4 fade-in">
      {/* ── Header + botón nuevo nivel ──────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-lg"
            style={{ color: 'var(--text-primary)' }}>
            Contenido del curso
          </h2>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {levels.length} nivel{levels.length !== 1 ? 'es' : ''} ·{' '}
            {levels.reduce((s, l) => s + l.lessons.length, 0)} lecciones
          </p>
        </div>
        <button
          onClick={() => { setEditingLevel(null); setLevelName(''); setLevelModal(true) }}
          className="btn-primary"
        >
          <Plus className="w-4 h-4" />
          Nuevo nivel
        </button>
      </div>

      {/* ── Lista de niveles ────────────────────────── */}
      {levels.length === 0 ? (
        <div className="card p-12 text-center">
          <FolderOpen className="w-10 h-10 mx-auto mb-3"
            style={{ color: 'var(--text-muted)' }} />
          <p className="font-medium" style={{ color: 'var(--text-secondary)' }}>
            No hay niveles todavía
          </p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Crea el primer nivel para empezar a agregar lecciones
          </p>
        </div>
      ) : (
        levels.map((level, idx) => {
          const isExpanded = expandedLevel === level.id
          return (
            <div
              key={level.id}
              className="card overflow-hidden slide-up"
              style={{ animationDelay: `${idx * 0.05}s` }}
            >
              {/* Header del nivel */}
              <div
                className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none"
                style={{ background: 'var(--bg-elevated)' }}
                onClick={() => setExpanded(isExpanded ? null : level.id)}
              >
                <GripVertical
                  className="w-4 h-4 flex-shrink-0"
                  style={{ color: 'var(--text-muted)' }}
                />

                <div
                  className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ background: 'var(--accent-dim)', color: 'var(--accent-bright)' }}
                >
                  {idx + 1}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-bold text-sm truncate"
                    style={{ color: 'var(--text-primary)' }}>
                    {level.title}
                  </h3>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {level.lessons.length} lección{level.lessons.length !== 1 ? 'es' : ''}
                  </p>
                </div>

                {/* Acciones del nivel */}
                <div
                  className="flex items-center gap-1"
                  onClick={e => e.stopPropagation()}
                >
                  <button
                    onClick={() => openEditLevel(level)}
                    className="btn-ghost p-1.5"
                    title="Editar nivel"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteLevel(level)}
                    className="btn-ghost p-1.5"
                    title="Eliminar nivel"
                    style={{ color: 'var(--danger)' }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {isExpanded
                  ? <ChevronUp  className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
                  : <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
                }
              </div>

              {/* Lecciones (colapsable) */}
              {isExpanded && (
                <div className="p-4">
                  <LessonsList
                    lessons={level.lessons}
                    onEdit={openEditLesson}
                    onDelete={handleDeleteLesson}
                  />
                  <button
                    onClick={() => openCreateLesson(level.id)}
                    className="btn-ghost w-full justify-center mt-3 text-sm"
                    style={{
                      border: '1px dashed var(--border-strong)',
                      color: 'var(--accent)',
                    }}
                  >
                    <Plus className="w-4 h-4" />
                    Agregar lección
                  </button>
                </div>
              )}
            </div>
          )
        })
      )}

      {/* ── Modal: Crear/Editar nivel ────────────────── */}
      <Modal
        isOpen={levelModal}
        onClose={() => setLevelModal(false)}
        title={editingLevel ? 'Editar nivel' : 'Nuevo nivel'}
        size="sm"
      >
        <form onSubmit={handleSaveLevel} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5"
              style={{ color: 'var(--text-secondary)' }}>
              Nombre del nivel
            </label>
            <input
              type="text"
              value={levelName}
              onChange={e => setLevelName(e.target.value)}
              placeholder="Ej: Módulo 1 - Fundamentos"
              className="input"
              autoFocus
              required
            />
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setLevelModal(false)}
              className="btn-ghost flex-1 justify-center" disabled={isPending}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary flex-1 justify-center"
              disabled={isPending}>
              {isPending && (
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              {editingLevel ? 'Guardar' : 'Crear nivel'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Modal: Crear/Editar lección ──────────────── */}
      <Modal
        isOpen={lessonModal}
        onClose={() => setLessonModal(false)}
        title={editingLesson ? 'Editar lección' : 'Nueva lección'}
        size="lg"
      >
        {targetLevelId && (
          <LessonForm
            lesson={editingLesson}
            levelId={targetLevelId}
            courseId={course.id}
            sortOrder={
              levels.find(l => l.id === targetLevelId)?.lessons.length ?? 0
            }
            onSuccess={handleLessonSaved}
            onCancel={() => setLessonModal(false)}
          />
        )}
      </Modal>

      {/* ── Confirmar eliminar nivel ─────────────────── */}
      <ConfirmDialog
        isOpen={!!deleteLevel}
        onClose={() => setDeleteLevel(null)}
        onConfirm={confirmDeleteLevel}
        title="Eliminar nivel"
        description={`¿Eliminar "${deleteLevel?.title}" y todas sus lecciones?`}
        confirmLabel="Eliminar"
        loading={isPending}
      />
    </div>
  )
}
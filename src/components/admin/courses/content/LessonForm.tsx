// src/components/admin/courses/content/LessonForm.tsx
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { FileUpload } from '@/components/ui/FileUpload'
import { useFileUpload } from '@/hooks/useFileUpload'
import { Save, X } from 'lucide-react'
import type { Lesson } from '@/types/database'

interface LessonFormProps {
  lesson?:    Lesson | null
  levelId:    string
  courseId:   string
  sortOrder:  number
  onSuccess:  (lesson: Lesson, isNew: boolean) => void
  onCancel:   () => void
}

export function LessonForm({
  lesson, levelId, courseId, sortOrder, onSuccess, onCancel
}: LessonFormProps) {
  const [title,       setTitle]       = useState(lesson?.title       ?? '')
  const [description, setDescription] = useState(lesson?.description ?? '')
  const [duration,    setDuration]    = useState(
    lesson?.video_duration ? String(lesson.video_duration) : ''
  )
  const [allowDownload, setAllowDownload] = useState(lesson?.allow_download ?? false)
  const [isFree,        setIsFree]        = useState(lesson?.is_free        ?? false)
  const [isPublished,   setIsPublished]   = useState(lesson?.is_published   ?? false)
  const [saving,        setSaving]        = useState(false)
  const [error,         setError]         = useState<string | null>(null)

  // Upload de video
  const videoUpload = useFileUpload({ bucket: 'lesson-videos', folder: `courses/${courseId}` })

  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) { setError('El título es obligatorio'); return }
    setSaving(true); setError(null)

    const videoUrl = videoUpload.url ?? lesson?.video_url ?? null

    const payload = {
      level_id:       levelId,
      course_id:      courseId,
      title:          title.trim(),
      description:    description.trim() || null,
      video_url:      videoUrl,
      video_duration: duration ? parseInt(duration) : null,
      allow_download: allowDownload,
      is_free:        isFree,
      is_published:   isPublished,
      sort_order:     lesson?.sort_order ?? sortOrder,
    }

    let result
    if (lesson) {
      result = await supabase
        .from('lessons').update(payload).eq('id', lesson.id).select().single()
    } else {
      result = await supabase
        .from('lessons').insert(payload).select().single()
    }

    if (result.error) {
      setError(result.error.message)
      setSaving(false)
      return
    }

    onSuccess(result.data, !lesson)
  }

  const labelClass = "block text-sm font-medium mb-1.5"
  const Toggle = ({
    value, onChange, label
  }: { value: boolean; onChange: (v: boolean) => void; label: string }) => (
    <label className="flex items-center gap-3 cursor-pointer">
      <div
        onClick={() => onChange(!value)}
        className="relative w-9 h-5 rounded-full transition-colors duration-200 flex-shrink-0"
        style={{ background: value ? 'var(--accent)' : 'var(--border-strong)' }}
      >
        <div
          className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200"
          style={{ transform: value ? 'translateX(16px)' : 'translateX(2px)' }}
        />
      </div>
      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{label}</span>
    </label>
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-[var(--radius-sm)] text-sm"
          style={{ background: 'var(--danger-dim)', color: 'var(--danger)' }}>
          <X className="w-4 h-4 flex-shrink-0" /> {error}
        </div>
      )}

      {/* Título */}
      <div>
        <label className={labelClass} style={{ color: 'var(--text-secondary)' }}>
          Título de la lección <span style={{ color: 'var(--danger)' }}>*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Ej: Introducción a React Hooks"
          className="input"
          required
          autoFocus
        />
      </div>

      {/* Descripción */}
      <div>
        <label className={labelClass} style={{ color: 'var(--text-secondary)' }}>
          Descripción
        </label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Qué aprenderán en esta lección..."
          className="input"
          rows={3}
          style={{ resize: 'vertical' }}
        />
      </div>

      {/* Upload de video */}
      <div>
        <label className={labelClass} style={{ color: 'var(--text-secondary)' }}>
          Video de la lección
          {lesson?.video_url && !videoUpload.url && (
            <span className="ml-2 text-xs badge badge-success">
              Video actual
            </span>
          )}
        </label>
        <FileUpload
          accept="video/mp4,video/webm"
          maxSize={500 * 1024 * 1024}
          type="video"
          onFileSelect={videoUpload.upload}
          uploading={videoUpload.uploading}
          progress={videoUpload.progress}
        />
        {videoUpload.error && (
          <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>
            {videoUpload.error}
          </p>
        )}
      </div>

      {/* Duración */}
      <div>
        <label className={labelClass} style={{ color: 'var(--text-secondary)' }}>
          Duración del video (segundos)
        </label>
        <input
          type="number"
          value={duration}
          onChange={e => setDuration(e.target.value)}
          placeholder="300"
          className="input"
          min={0}
        />
        {duration && (
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            ≈ {Math.floor(parseInt(duration) / 60)} min {parseInt(duration) % 60} seg
          </p>
        )}
      </div>

      {/* Toggles */}
      <div
        className="space-y-3 py-3"
        style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}
      >
        <Toggle
          value={isPublished}
          onChange={setIsPublished}
          label="Lección publicada (visible para estudiantes)"
        />
        <Toggle
          value={isFree}
          onChange={setIsFree}
          label="Vista previa gratuita (sin acceso)"
        />
        <Toggle
          value={allowDownload}
          onChange={setAllowDownload}
          label="Permitir descarga del video"
        />
      </div>

      {/* Botones */}
      <div className="flex gap-3 pt-1">
        <button
          type="button" onClick={onCancel}
          className="btn-ghost flex-1 justify-center"
          disabled={saving}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="btn-primary flex-1 justify-center"
          disabled={saving || videoUpload.uploading}
        >
          {(saving || videoUpload.uploading) && (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          )}
          <Save className="w-4 h-4" />
          {lesson ? 'Guardar' : 'Crear lección'}
        </button>
      </div>
    </form>
  )
}
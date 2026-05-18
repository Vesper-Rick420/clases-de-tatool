// src/components/admin/courses/CourseForm.tsx
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { FileUpload } from '@/components/ui/FileUpload'
import { useFileUpload } from '@/hooks/useFileUpload'
import { slugify } from '@/lib/utils'
import { Save, X } from 'lucide-react'
import type { Course, Category } from '@/types/database'

interface CourseFormProps {
  course?: Course | null        // null = crear nuevo
  categories: Category[]
  adminId: string
  onSuccess: (course: Course) => void
  onCancel: () => void
}

export function CourseForm({
  course, categories, adminId, onSuccess, onCancel
}: CourseFormProps) {
  // ── Estado del formulario ────────────────────────────
  const [title,       setTitle]       = useState(course?.title       ?? '')
  const [slug,        setSlug]        = useState(course?.slug        ?? '')
  const [description, setDescription] = useState(course?.description ?? '')
  const [shortDesc,   setShortDesc]   = useState(course?.short_desc  ?? '')
  const [categoryId,  setCategoryId]  = useState(course?.category_id ?? '')
  const [status,      setStatus]      = useState<'draft'|'published'|'archived'>(
    course?.status ?? 'draft'
  )
  const [isFeatured,  setIsFeatured]  = useState(course?.is_featured ?? false)
  const [saving,      setSaving]      = useState(false)
  const [error,       setError]       = useState<string | null>(null)

  // Upload de thumbnail
  const thumbnailUpload = useFileUpload({
    bucket: 'course-thumbnails',
    folder: 'thumbnails',
  })

  // Auto-generar slug desde el título
  useEffect(() => {
    if (!course) setSlug(slugify(title))
  }, [title, course])

  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) { setError('El título es obligatorio'); return }
    if (!slug.trim())  { setError('El slug es obligatorio');  return }

    setSaving(true); setError(null)

    // Determinar la URL del thumbnail
    const thumbnailUrl = thumbnailUpload.url
      ?? course?.thumbnail_url
      ?? null

    const payload = {
      title:         title.trim(),
      slug:          slug.trim(),
      description:   description.trim() || null,
      short_desc:    shortDesc.trim()   || null,
      category_id:   categoryId         || null,
      status,
      is_featured:   isFeatured,
      thumbnail_url: thumbnailUrl,
      created_by:    adminId,
    }

    let result
    if (course) {
      // Editar curso existente
      result = await supabase
        .from('courses')
        .update(payload)
        .eq('id', course.id)
        .select()
        .single()
    } else {
      // Crear nuevo curso
      result = await supabase
        .from('courses')
        .insert(payload)
        .select()
        .single()
    }

    if (result.error) {
      setError(result.error.message.includes('slug')
        ? 'Este slug ya existe. Elige uno diferente.'
        : result.error.message)
      setSaving(false)
      return
    }

    onSuccess(result.data)
  }

  const inputClass = "input"
  const labelClass = "block text-sm font-medium mb-1.5"

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div
          className="flex items-center gap-2 p-3 rounded-[var(--radius-sm)] text-sm"
          style={{ background: 'var(--danger-dim)', color: 'var(--danger)' }}
        >
          <X className="w-4 h-4 flex-shrink-0" /> {error}
        </div>
      )}

      {/* Thumbnail */}
      <div>
        <label className={labelClass} style={{ color: 'var(--text-secondary)' }}>
          Imagen de portada
        </label>
        <FileUpload
          accept="image/jpeg,image/png,image/webp"
          maxSize={5 * 1024 * 1024}
          type="image"
          onFileSelect={thumbnailUpload.upload}
          uploading={thumbnailUpload.uploading}
          progress={thumbnailUpload.progress}
          currentUrl={course?.thumbnail_url}
        />
      </div>

      {/* Título */}
      <div>
        <label className={labelClass} style={{ color: 'var(--text-secondary)' }}>
          Título del curso <span style={{ color: 'var(--danger)' }}>*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Ej: Programación Web con React"
          className={inputClass}
          required
        />
      </div>

      {/* Slug */}
      <div>
        <label className={labelClass} style={{ color: 'var(--text-secondary)' }}>
          Slug (URL)
          <span className="ml-1 text-xs" style={{ color: 'var(--text-muted)' }}>
            (se genera automáticamente)
          </span>
        </label>
        <div className="flex items-center gap-2">
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>/curso/</span>
          <input
            type="text"
            value={slug}
            onChange={e => setSlug(slugify(e.target.value))}
            placeholder="programacion-web-react"
            className={inputClass}
          />
        </div>
      </div>

      {/* Descripción corta */}
      <div>
        <label className={labelClass} style={{ color: 'var(--text-secondary)' }}>
          Descripción corta
          <span className="ml-1 text-xs" style={{ color: 'var(--text-muted)' }}>
            (aparece en la tarjeta del curso)
          </span>
        </label>
        <input
          type="text"
          value={shortDesc}
          onChange={e => setShortDesc(e.target.value)}
          placeholder="Aprende React desde cero hasta nivel avanzado"
          className={inputClass}
          maxLength={120}
        />
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
          {shortDesc.length}/120 caracteres
        </p>
      </div>

      {/* Descripción larga */}
      <div>
        <label className={labelClass} style={{ color: 'var(--text-secondary)' }}>
          Descripción completa
        </label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Descripción detallada del curso..."
          className={inputClass}
          rows={4}
          style={{ resize: 'vertical' }}
        />
      </div>

      {/* Fila: Categoría + Estado */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass} style={{ color: 'var(--text-secondary)' }}>
            Categoría
          </label>
          <select
            value={categoryId}
            onChange={e => setCategoryId(e.target.value)}
            className={inputClass}
            style={{ background: 'var(--bg-secondary)' }}
          >
            <option value="">Sin categoría</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass} style={{ color: 'var(--text-secondary)' }}>
            Estado
          </label>
          <select
            value={status}
            onChange={e => setStatus(e.target.value as typeof status)}
            className={inputClass}
            style={{ background: 'var(--bg-secondary)' }}
          >
            <option value="draft">Borrador</option>
            <option value="published">Publicado</option>
            <option value="archived">Archivado</option>
          </select>
        </div>
      </div>

      {/* Destacado */}
      <label className="flex items-center gap-3 cursor-pointer group">
        <div
          onClick={() => setIsFeatured(!isFeatured)}
          className="relative w-10 h-5 rounded-full transition-colors duration-200 flex-shrink-0"
          style={{ background: isFeatured ? 'var(--accent)' : 'var(--border-strong)' }}
        >
          <div
            className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200"
            style={{ transform: isFeatured ? 'translateX(20px)' : 'translateX(2px)' }}
          />
        </div>
        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Marcar como curso destacado
        </span>
      </label>

      {/* Botones */}
      <div
        className="flex gap-3 pt-2"
        style={{ borderTop: '1px solid var(--border)' }}
      >
        <button
          type="button"
          onClick={onCancel}
          className="btn-ghost flex-1 justify-center"
          disabled={saving}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="btn-primary flex-1 justify-center"
          disabled={saving || thumbnailUpload.uploading}
        >
          {saving ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {course ? 'Guardar cambios' : 'Crear curso'}
        </button>
      </div>
    </form>
  )
}
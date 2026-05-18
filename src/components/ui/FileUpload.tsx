// src/components/ui/FileUpload.tsx
'use client'

import { useRef, useState, useCallback } from 'react'
import { Upload, X, File, Image, Video } from 'lucide-react'
import { cn, formatFileSize } from '@/lib/utils'

interface FileUploadProps {
  accept?: string
  maxSize?: number           // bytes, default 50MB
  onFileSelect: (file: File) => void
  uploading?: boolean
  progress?: number          // 0-100
  currentUrl?: string | null
  type?: 'image' | 'video' | 'file'
  className?: string
}

export function FileUpload({
  accept,
  maxSize = 50 * 1024 * 1024,
  onFileSelect,
  uploading = false,
  progress = 0,
  currentUrl,
  type = 'file',
  className,
}: FileUploadProps) {
  const inputRef             = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError]    = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null)

  const IconMap = { image: Image, video: Video, file: File }
  const Icon = IconMap[type]

  const validate = (file: File): string | null => {
    if (file.size > maxSize)
      return `El archivo excede el límite de ${formatFileSize(maxSize)}`
    return null
  }

  const handleFile = useCallback((file: File) => {
    const err = validate(file)
    if (err) { setError(err); return }
    setError(null)
    // Preview para imágenes
    if (type === 'image') {
      const reader = new FileReader()
      reader.onload = e => setPreview(e.target?.result as string)
      reader.readAsDataURL(file)
    }
    onFileSelect(file)
  }, [maxSize, onFileSelect, type])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  return (
    <div className={cn('space-y-2', className)}>
      {/* Zona de drop */}
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        onDrop={onDrop}
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        className={cn(
          'relative border-2 border-dashed rounded-[var(--radius)] transition-all duration-200',
          uploading ? 'cursor-wait' : 'cursor-pointer',
          dragOver
            ? 'border-[var(--accent)] bg-[var(--accent-dim)]'
            : 'border-[var(--border-strong)] hover:border-[var(--accent)] hover:bg-[var(--accent-dim)]'
        )}
      >
        {/* Preview de imagen */}
        {type === 'image' && preview ? (
          <div className="relative h-40 overflow-hidden rounded-[var(--radius)]">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            <div
              className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
              style={{ background: 'rgba(0,0,0,0.5)' }}
            >
              <p className="text-white text-sm font-medium">
                Clic para cambiar
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 px-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
              style={{ background: 'var(--accent-dim)' }}
            >
              <Icon className="w-6 h-6" style={{ color: 'var(--accent)' }} />
            </div>
            <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
              {uploading ? 'Subiendo archivo...' : 'Arrastra o haz clic para subir'}
            </p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Máximo {formatFileSize(maxSize)}
            </p>
          </div>
        )}

        {/* Barra de progreso */}
        {uploading && (
          <div className="absolute bottom-0 left-0 right-0 h-1 rounded-b-[var(--radius)] overflow-hidden"
            style={{ background: 'var(--border)' }}>
            <div
              className="h-full transition-all duration-300"
              style={{ width: `${progress}%`, background: 'var(--accent)' }}
            />
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <p className="text-xs flex items-center gap-1" style={{ color: 'var(--danger)' }}>
          <X className="w-3 h-3" /> {error}
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={e => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
          e.target.value = ''
        }}
      />
    </div>
  )
}
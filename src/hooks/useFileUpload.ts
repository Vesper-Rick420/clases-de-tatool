// src/hooks/useFileUpload.ts
// Hook reutilizable para subir archivos con estado de progreso

import { useState, useCallback } from 'react'
import { uploadFile, generateFilePath } from '@/lib/storage'
import type { BucketName } from '@/lib/storage'

// Re-exportar el tipo para usarlo en otros archivos
export type { BucketName }

interface UseFileUploadOptions {
  bucket: 'course-thumbnails' | 'lesson-videos' | 'lesson-files'
  folder: string
}

interface UploadState {
  uploading: boolean
  progress: number
  error: string | null
  url: string | null
  path: string | null
}

export function useFileUpload({ bucket, folder }: UseFileUploadOptions) {
  const [state, setState] = useState<UploadState>({
    uploading: false,
    progress:  0,
    error:     null,
    url:       null,
    path:      null,
  })

  const upload = useCallback(async (file: File) => {
    setState({ uploading: true, progress: 0, error: null, url: null, path: null })

    const filePath = generateFilePath(folder, file.name)
    const result   = await uploadFile(
      bucket,
      file,
      filePath,
      (p) => setState(prev => ({ ...prev, progress: p }))
    )

    if ('error' in result) {
      setState(prev => ({ ...prev, uploading: false, error: result.error }))
      return null
    }

    setState({
      uploading: false,
      progress:  100,
      error:     null,
      url:       result.url,
      path:      result.path,
    })

    return result
  }, [bucket, folder])

  const reset = useCallback(() => {
    setState({ uploading: false, progress: 0, error: null, url: null, path: null })
  }, [])

  return { ...state, upload, reset }
}
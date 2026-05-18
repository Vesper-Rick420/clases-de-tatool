// src/lib/storage.ts
// Funciones para subir y eliminar archivos en Supabase Storage

import { createClient } from '@/lib/supabase/client'

type BucketName = 'course-thumbnails' | 'lesson-videos' | 'lesson-files'

/**
 * Sube un archivo a Supabase Storage
 * Retorna la URL pública (para thumbnails) o la ruta (para privados)
 */
export async function uploadFile(
  bucket: BucketName,
  file: File,
  path: string,
  onProgress?: (progress: number) => void
): Promise<{ url: string; path: string } | { error: string }> {
  const supabase = createClient()

  // Simular progreso (Supabase JS v2 no tiene onUploadProgress nativo)
  const progressInterval = onProgress
    ? setInterval(() => {
        onProgress(Math.min(90, Math.random() * 30 + 60))
      }, 200)
    : null

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: true,         // Sobreescribir si existe
    })

  if (progressInterval) {
    clearInterval(progressInterval)
    onProgress?.(100)
  }

  if (error) return { error: error.message }

  // Para buckets públicos, obtener URL pública
  if (bucket === 'course-thumbnails') {
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path)
    return { url: urlData.publicUrl, path: data.path }
  }

  // Para buckets privados, retornar la ruta (la URL se genera bajo demanda)
  return { url: data.path, path: data.path }
}

/**
 * Genera una URL firmada temporal para archivos privados
 * Válida por 1 hora por defecto
 */
export async function getSignedUrl(
  bucket: BucketName,
  path: string,
  expiresIn = 3600
): Promise<string | null> {
  const supabase = createClient()
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn)
  if (error) return null
  return data.signedUrl
}

/**
 * Elimina un archivo de Storage
 */
export async function deleteFile(
  bucket: BucketName,
  path: string
): Promise<boolean> {
  const supabase = createClient()
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path])
  return !error
}

/**
 * Genera una ruta única para un archivo
 * Formato: folder/timestamp-nombre-limpio.ext
 */
export function generateFilePath(
  folder: string,
  fileName: string
): string {
  const timestamp = Date.now()
  const ext       = fileName.split('.').pop()?.toLowerCase() ?? 'bin'
  // Limpiar el nombre: sin espacios ni caracteres especiales
  const clean     = fileName
    .replace(/\.[^/.]+$/, '')        // quitar extensión
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')      // solo alfanuméricos
    .replace(/-+/g, '-')
    .slice(0, 40)
  return `${folder}/${timestamp}-${clean}.${ext}`
}
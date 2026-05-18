// src/app/api/downloads/[fileId]/route.ts
// Endpoint seguro para descargas con registro de auditoría

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface RouteParams {
  params: Promise<{ fileId: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { fileId } = await params
  const supabase   = await createClient()

  // ── 1. Verificar autenticación ─────────────────────────
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  // ── 2. Obtener perfil del usuario ──────────────────────
  const { data: profile } = await supabase
    .from('profiles').select('full_name, email, status')
    .eq('id', user.id).single()

  if (!profile || profile.status === 'blocked') {
    return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
  }

  // ── 3. Obtener el archivo ──────────────────────────────
  const { data: file } = await supabase
    .from('lesson_files').select('*, lessons(course_id)')
    .eq('id', fileId).single()

  if (!file) {
    return NextResponse.json({ error: 'Archivo no encontrado' }, { status: 404 })
  }

  const courseId = (file.lessons as any)?.course_id

  // ── 4. Verificar acceso al curso ───────────────────────
  const { data: access } = await supabase
    .from('course_access').select('id')
    .eq('user_id', user.id)
    .eq('course_id', courseId)
    .eq('is_active', true)
    .single()

  if (!access) {
    return NextResponse.json({ error: 'Sin acceso al curso' }, { status: 403 })
  }

  // ── 5. Registrar la descarga en auditoría ──────────────
  await supabase.from('downloads').insert({
    user_id:       user.id,
    lesson_file_id: fileId,
    lesson_id:     file.lesson_id,
    course_id:     courseId,
    user_email:    profile.email,
    user_name:     profile.full_name ?? profile.email,
    ip_address:    request.headers.get('x-forwarded-for') ?? null,
    user_agent:    request.headers.get('user-agent') ?? null,
  })

  // ── 6. Generar URL firmada (1 hora de validez) ─────────
  const { data: signedData, error } = await supabase.storage
    .from('lesson-files')
    .createSignedUrl(file.file_url, 3600, {
      download: file.file_name,   // Nombre del archivo al descargar
    })

  if (error || !signedData) {
    return NextResponse.json(
      { error: 'Error al generar URL de descarga' },
      { status: 500 }
    )
  }

  // ── 7. Redirigir al archivo ────────────────────────────
  return NextResponse.redirect(signedData.signedUrl)
}
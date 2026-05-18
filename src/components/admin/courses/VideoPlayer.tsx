// src/components/courses/VideoPlayer.tsx
'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getSignedUrl } from '@/lib/storage'
import {
  Play, Pause, Volume2, VolumeX,
  Maximize, RotateCcw, CheckCircle2
} from 'lucide-react'
import { formatDuration } from '@/lib/utils'

interface VideoPlayerProps {
  lessonId:   string
  courseId:   string
  videoPath:  string            // Ruta en Supabase Storage
  isPublic?:  boolean           // true = bucket público
  onComplete?: () => void
}

export function VideoPlayer({
  lessonId, courseId, videoPath, isPublic = false, onComplete
}: VideoPlayerProps) {
  const videoRef    = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const [videoUrl,  setVideoUrl]  = useState<string | null>(null)
  const [playing,   setPlaying]   = useState(false)
  const [muted,     setMuted]     = useState(false)
  const [currentTime, setCurrent] = useState(0)
  const [duration,  setDuration]  = useState(0)
  const [volume,    setVolume]    = useState(1)
  const [completed, setCompleted] = useState(false)
  const [loading,   setLoading]   = useState(true)
  const [showControls, setShowControls] = useState(true)

  const progressSaveRef = useRef<NodeJS.Timeout>()
  const controlsTimeout = useRef<NodeJS.Timeout>()
  const supabase        = createClient()

  // ── Cargar URL del video ─────────────────────────────
  useEffect(() => {
    async function loadUrl() {
      if (isPublic) {
        setVideoUrl(videoPath)
      } else {
        const url = await getSignedUrl('lesson-videos', videoPath)
        setVideoUrl(url)
      }
      setLoading(false)
    }
    loadUrl()
  }, [videoPath, isPublic])

  // ── Cargar progreso guardado ─────────────────────────
  useEffect(() => {
    async function loadProgress() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('lesson_progress')
        .select('last_position, is_completed, watch_time')
        .eq('user_id', user.id)
        .eq('lesson_id', lessonId)
        .single()
      if (data && videoRef.current) {
        if (data.last_position > 0) {
          videoRef.current.currentTime = data.last_position
        }
        if (data.is_completed) setCompleted(true)
      }
    }
    loadProgress()
  }, [lessonId])

  // ── Guardar progreso en Supabase ─────────────────────
  const saveProgress = useCallback(async (position: number, watchTime: number, done: boolean) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('lesson_progress').upsert({
      user_id:        user.id,
      lesson_id:      lessonId,
      course_id:      courseId,
      last_position:  Math.floor(position),
      watch_time:     Math.floor(watchTime),
      is_completed:   done,
      completed_at:   done ? new Date().toISOString() : undefined,
    }, { onConflict: 'user_id,lesson_id' })
  }, [lessonId, courseId, supabase])

  // ── Eventos del video ────────────────────────────────
  function onTimeUpdate() {
    const v = videoRef.current
    if (!v) return
    setCurrent(v.currentTime)

    // Guardar progreso cada 10 segundos
    clearTimeout(progressSaveRef.current)
    progressSaveRef.current = setTimeout(() => {
      const isCompleted = v.duration > 0 && (v.currentTime / v.duration) >= 0.9
      saveProgress(v.currentTime, v.currentTime, isCompleted)
      if (isCompleted && !completed) {
        setCompleted(true)
        onComplete?.()
      }
    }, 10_000)
  }

  function onLoadedMetadata() {
    if (videoRef.current) setDuration(videoRef.current.duration)
  }

  function onEnded() {
    saveProgress(duration, duration, true)
    setCompleted(true)
    setPlaying(false)
    onComplete?.()
  }

  // ── Controles ────────────────────────────────────────
  function togglePlay() {
    const v = videoRef.current
    if (!v) return
    if (playing) { v.pause(); setPlaying(false) }
    else         { v.play();  setPlaying(true)  }
  }

  function toggleMute() {
    const v = videoRef.current
    if (!v) return
    v.muted = !muted
    setMuted(!muted)
  }

  function onSeek(e: React.ChangeEvent<HTMLInputElement>) {
    const v = videoRef.current
    if (!v) return
    v.currentTime = Number(e.target.value)
    setCurrent(Number(e.target.value))
  }

  function onVolumeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = videoRef.current
    if (!v) return
    const vol = Number(e.target.value)
    v.volume = vol
    setVolume(vol)
    setMuted(vol === 0)
  }

  function toggleFullscreen() {
    if (!containerRef.current) return
    if (document.fullscreenElement) document.exitFullscreen()
    else containerRef.current.requestFullscreen()
  }

  // Auto-ocultar controles
  function handleMouseMove() {
    setShowControls(true)
    clearTimeout(controlsTimeout.current)
    controlsTimeout.current = setTimeout(() => {
      if (playing) setShowControls(false)
    }, 3000)
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  if (loading) {
    return (
      <div
        className="w-full aspect-video rounded-[var(--radius)] flex items-center justify-center"
        style={{ background: '#000' }}
      >
        <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  if (!videoUrl) {
    return (
      <div
        className="w-full aspect-video rounded-[var(--radius)] flex items-center justify-center"
        style={{ background: '#000' }}
      >
        <p className="text-white/50 text-sm">Video no disponible</p>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-video rounded-[var(--radius)] overflow-hidden group"
      style={{ background: '#000' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => playing && setShowControls(false)}
    >
      {/* Video */}
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full h-full"
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={onLoadedMetadata}
        onEnded={onEnded}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onClick={togglePlay}
        style={{ cursor: 'pointer' }}
      />

      {/* Badge completado */}
      {completed && (
        <div
          className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
          style={{ background: 'var(--success)', color: '#fff' }}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          Completado
        </div>
      )}

      {/* Controles */}
      <div
        className="absolute bottom-0 left-0 right-0 transition-all duration-200"
        style={{
          opacity: showControls ? 1 : 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)',
          padding: '32px 16px 12px',
        }}
      >
        {/* Barra de progreso */}
        <div className="relative mb-2 group/progress">
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.1}
            value={currentTime}
            onChange={onSeek}
            className="w-full h-1 appearance-none rounded-full cursor-pointer"
            style={{
              background: `linear-gradient(to right, var(--accent) ${progress}%, rgba(255,255,255,0.3) ${progress}%)`,
            }}
          />
        </div>

        {/* Botones de control */}
        <div className="flex items-center gap-2">
          {/* Play/Pause */}
          <button
            onClick={togglePlay}
            className="w-8 h-8 flex items-center justify-center rounded-full transition-colors"
            style={{ color: '#fff' }}
          >
            {playing
              ? <Pause  className="w-4 h-4" />
              : <Play   className="w-4 h-4" />
            }
          </button>

          {/* Reiniciar */}
          <button
            onClick={() => {
              if (videoRef.current) videoRef.current.currentTime = 0
            }}
            className="w-7 h-7 flex items-center justify-center rounded-full transition-colors"
            style={{ color: 'rgba(255,255,255,0.7)' }}
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Tiempo */}
          <span className="text-xs text-white/70 ml-1">
            {formatDuration(Math.floor(currentTime))} / {formatDuration(Math.floor(duration))}
          </span>

          {/* Espaciador */}
          <div className="flex-1" />

          {/* Volumen */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={toggleMute}
              className="w-7 h-7 flex items-center justify-center"
              style={{ color: 'rgba(255,255,255,0.7)' }}
            >
              {muted || volume === 0
                ? <VolumeX className="w-4 h-4" />
                : <Volume2 className="w-4 h-4" />
              }
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={muted ? 0 : volume}
              onChange={onVolumeChange}
              className="w-16 h-1 appearance-none rounded-full cursor-pointer"
              style={{
                background: `linear-gradient(to right, #fff ${(muted ? 0 : volume) * 100}%, rgba(255,255,255,0.3) ${(muted ? 0 : volume) * 100}%)`
              }}
            />
          </div>

          {/* Pantalla completa */}
          <button
            onClick={toggleFullscreen}
            className="w-7 h-7 flex items-center justify-center"
            style={{ color: 'rgba(255,255,255,0.7)' }}
          >
            <Maximize className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
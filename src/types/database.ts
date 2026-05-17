// src/types/database.ts
// Tipos TypeScript que reflejan exactamente nuestra base de datos
// Esto nos da autocompletado y seguridad de tipos en todo el proyecto

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// ── ENUMS ─────────────────────────────────────────────────
export type UserRole = 'admin' | 'student'
export type UserStatus = 'active' | 'inactive' | 'blocked'
export type CourseStatus = 'draft' | 'published' | 'archived'
export type LessonFileType = 'video' | 'pdf' | 'image' | 'document' | 'other'

// ── TIPOS DE TABLAS ───────────────────────────────────────

export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  phone: string | null
  role: UserRole
  status: UserStatus
  last_login: string | null
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  color: string
  icon: string | null
  created_at: string
  updated_at: string
}

export interface Course {
  id: string
  category_id: string | null
  created_by: string
  title: string
  slug: string
  description: string | null
  short_desc: string | null
  thumbnail_url: string | null
  preview_url: string | null
  status: CourseStatus
  is_featured: boolean
  sort_order: number
  total_lessons: number
  total_duration: number
  created_at: string
  updated_at: string
}

export interface Level {
  id: string
  course_id: string
  title: string
  description: string | null
  sort_order: number
  total_lessons: number
  created_at: string
  updated_at: string
}

export interface Lesson {
  id: string
  level_id: string
  course_id: string
  title: string
  description: string | null
  sort_order: number
  video_url: string | null
  video_duration: number | null
  thumbnail_url: string | null
  allow_download: boolean
  is_free: boolean
  is_published: boolean
  created_at: string
  updated_at: string
}

export interface LessonFile {
  id: string
  lesson_id: string
  file_name: string
  file_url: string
  file_type: LessonFileType
  file_size: number | null
  mime_type: string | null
  sort_order: number
  created_at: string
}

export interface CourseAccess {
  id: string
  user_id: string
  course_id: string
  granted_by: string
  granted_at: string
  level_id: string | null
  expires_at: string | null
  is_active: boolean
}

export interface LessonProgress {
  id: string
  user_id: string
  lesson_id: string
  course_id: string
  is_completed: boolean
  watch_time: number
  last_position: number
  started_at: string
  completed_at: string | null
  last_watched_at: string
}

export interface Download {
  id: string
  user_id: string
  lesson_file_id: string
  lesson_id: string
  course_id: string
  user_email: string
  user_name: string
  downloaded_at: string
  ip_address: string | null
  user_agent: string | null
  watermarked_url: string | null
}

// ── TIPO DATABASE COMPLETO (para el cliente Supabase) ─────
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at' | 'updated_at'>
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>
      }
      categories: {
        Row: Category
        Insert: Omit<Category, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Category, 'id' | 'created_at'>>
      }
      courses: {
        Row: Course
        Insert: Omit<Course, 'id' | 'created_at' | 'updated_at' | 'total_lessons' | 'total_duration'>
        Update: Partial<Omit<Course, 'id' | 'created_at'>>
      }
      levels: {
        Row: Level
        Insert: Omit<Level, 'id' | 'created_at' | 'updated_at' | 'total_lessons'>
        Update: Partial<Omit<Level, 'id' | 'created_at'>>
      }
      lessons: {
        Row: Lesson
        Insert: Omit<Lesson, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Lesson, 'id' | 'created_at'>>
      }
      lesson_files: {
        Row: LessonFile
        Insert: Omit<LessonFile, 'id' | 'created_at'>
        Update: Partial<Omit<LessonFile, 'id' | 'created_at'>>
      }
      course_access: {
        Row: CourseAccess
        Insert: Omit<CourseAccess, 'id' | 'granted_at'>
        Update: Partial<Omit<CourseAccess, 'id' | 'granted_at'>>
      }
      lesson_progress: {
        Row: LessonProgress
        Insert: Omit<LessonProgress, 'id' | 'started_at' | 'last_watched_at'>
        Update: Partial<Omit<LessonProgress, 'id' | 'started_at'>>
      }
      downloads: {
        Row: Download
        Insert: Omit<Download, 'id' | 'downloaded_at'>
        Update: never
      }
    }
    Functions: {
      get_course_progress: {
        Args: { p_user_id: string; p_course_id: string }
        Returns: number
      }
    }
  }
}
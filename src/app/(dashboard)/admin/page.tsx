// src/app/(dashboard)/admin/page.tsx
// Dashboard principal del administrador
// Este es un Server Component — los datos se cargan en el servidor

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/Header'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { ActivityChart } from '@/components/dashboard/ActivityChart'
import { RecentUsers } from '@/components/dashboard/RecentUsers'
import { RecentCourses } from '@/components/dashboard/RecentCourses'
import {
  Users, BookOpen, Download, TrendingUp,
  GraduationCap, Activity
} from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Dashboard Admin' }

// Datos del gráfico de actividad (en producción vendrían de la DB)
const activityData = [
  { name: 'Lun', estudiantes: 4,  lecciones: 12 },
  { name: 'Mar', estudiantes: 7,  lecciones: 23 },
  { name: 'Mié', estudiantes: 5,  lecciones: 18 },
  { name: 'Jue', estudiantes: 11, lecciones: 34 },
  { name: 'Vie', estudiantes: 9,  lecciones: 28 },
  { name: 'Sáb', estudiantes: 3,  lecciones: 10 },
  { name: 'Dom', estudiantes: 2,  lecciones: 7  },
]

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  // ── Verificar que es admin ──────────────────────────────
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/student')

  // ── Cargar datos del dashboard en paralelo ──────────────
  const [
    { count: totalUsers },
    { count: totalStudents },
    { count: totalCourses },
    { count: totalDownloads },
    { data: recentUsers },
    { data: recentCourses },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true })
      .eq('role', 'student'),
    supabase.from('courses').select('*', { count: 'exact', head: true }),
    supabase.from('downloads').select('*', { count: 'exact', head: true }),
    supabase.from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase.from('courses')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(4),
  ])

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <Header
        title="Dashboard"
        subtitle="Bienvenido de vuelta — aquí está el resumen de hoy"
      />

      <div className="p-6 space-y-6">

        {/* ── Stat Cards ────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="stagger-1">
            <StatsCard
              title="Total usuarios"
              value={totalUsers ?? 0}
              change={{ value: 12, label: 'vs mes anterior' }}
              icon={Users}
              color="accent"
            />
          </div>
          <div className="stagger-2">
            <StatsCard
              title="Estudiantes activos"
              value={totalStudents ?? 0}
              change={{ value: 8, label: 'vs mes anterior' }}
              icon={GraduationCap}
              color="success"
            />
          </div>
          <div className="stagger-3">
            <StatsCard
              title="Cursos publicados"
              value={totalCourses ?? 0}
              change={{ value: 5, label: 'nuevos este mes' }}
              icon={BookOpen}
              color="info"
            />
          </div>
          <div className="stagger-4">
            <StatsCard
              title="Descargas totales"
              value={totalDownloads ?? 0}
              change={{ value: 23, label: 'vs mes anterior' }}
              icon={Download}
              color="warning"
            />
          </div>
        </div>

        {/* ── Gráfico + Actividad ───────────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* Gráfico ocupa 2/3 */}
          <div className="xl:col-span-2">
            <ActivityChart data={activityData} />
          </div>

          {/* Resumen rápido */}
          <div className="card p-5 slide-up stagger-4 flex flex-col">
            <h3 className="font-display font-bold text-base mb-4"
              style={{ color: 'var(--text-primary)' }}>
              Resumen del sistema
            </h3>

            {[
              { label: 'Tasa de completado', value: '67%',  color: 'var(--success)' },
              { label: 'Sesiones hoy',        value: '23',   color: 'var(--accent)'  },
              { label: 'Descargas hoy',       value: '8',    color: 'var(--warning)' },
              { label: 'Nuevos esta semana',  value: '4',    color: 'var(--info)'    },
            ].map((item, i) => (
              <div
                key={item.label}
                className="flex items-center justify-between py-3"
                style={{
                  borderBottom: i < 3 ? '1px solid var(--border)' : 'none'
                }}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-1.5 h-6 rounded-full"
                    style={{ background: item.color }}
                  />
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {item.label}
                  </span>
                </div>
                <span
                  className="font-display font-bold text-lg"
                  style={{ color: item.color }}
                >
                  {item.value}
                </span>
              </div>
            ))}

            <div className="mt-auto pt-4">
              
                href="/admin/stats"
                className="btn-ghost w-full justify-center text-sm"
                style={{ border: '1px solid var(--border)' }}
              >
                <Activity className="w-4 h-4" />
                Ver estadísticas completas
              </a>
            </div>
          </div>
        </div>

        {/* ── Usuarios y Cursos Recientes ───────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <RecentUsers users={recentUsers ?? []} />
          <RecentCourses courses={recentCourses ?? []} />
        </div>

      </div>
    </div>
  )
}
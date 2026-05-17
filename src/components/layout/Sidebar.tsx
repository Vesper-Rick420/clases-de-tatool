// src/components/layout/Sidebar.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, Users, BookOpen, BarChart3,
  Settings, LogOut, ChevronRight, GraduationCap,
  Download, Tag, Shield
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { UserRole } from '@/types/database'

// ── Tipos ─────────────────────────────────────────────────
interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  badge?: string
}

interface SidebarProps {
  role: UserRole
  userName: string
  userEmail: string
  avatarUrl?: string | null
}

// ── Navegación por rol ────────────────────────────────────
const adminNav: NavItem[] = [
  { label: 'Dashboard',   href: '/admin',           icon: LayoutDashboard },
  { label: 'Usuarios',    href: '/admin/users',     icon: Users           },
  { label: 'Cursos',      href: '/admin/courses',   icon: BookOpen        },
  { label: 'Categorías',  href: '/admin/categories',icon: Tag             },
  { label: 'Estadísticas',href: '/admin/stats',     icon: BarChart3       },
  { label: 'Descargas',   href: '/admin/downloads', icon: Download        },
  { label: 'Permisos',    href: '/admin/access',    icon: Shield          },
]

const studentNav: NavItem[] = [
  { label: 'Mi Dashboard', href: '/student',         icon: LayoutDashboard },
  { label: 'Mis Cursos',   href: '/student/courses', icon: BookOpen        },
  { label: 'Mi Progreso',  href: '/student/progress',icon: BarChart3       },
  { label: 'Mi Perfil',    href: '/student/profile', icon: Settings        },
]

// ── Componente NavItem ────────────────────────────────────
function NavLink({ item, isActive }: { item: NavItem; isActive: boolean }) {
  return (
    <Link
      href={item.href}
      className={cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-sm)] text-sm transition-all duration-150 group',
        isActive
          ? 'bg-[var(--accent-dim)] text-[var(--accent-bright)] font-medium'
          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]'
      )}
    >
      <item.icon
        className={cn(
          'w-[18px] h-[18px] flex-shrink-0 transition-transform duration-150',
          isActive ? 'text-[var(--accent-bright)]' : 'group-hover:scale-110'
        )}
      />
      <span className="flex-1">{item.label}</span>

      {/* Indicador activo */}
      {isActive && (
        <ChevronRight className="w-3.5 h-3.5 text-[var(--accent-bright)]" />
      )}
    </Link>
  )
}

// ── Sidebar principal ─────────────────────────────────────
export function Sidebar({ role, userName, userEmail }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const navItems = role === 'admin' ? adminNav : studentNav

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside
      className="fixed left-0 top-0 h-screen flex flex-col z-40"
      style={{
        width: 'var(--sidebar-width)',
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border)',
      }}
    >
      {/* ── Logo ─────────────────────────────────────── */}
      <div
        className="flex items-center gap-3 px-5 flex-shrink-0"
        style={{ height: 'var(--header-height)', borderBottom: '1px solid var(--border)' }}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: 'var(--accent)', boxShadow: '0 0 16px var(--accent-glow)' }}
        >
          <GraduationCap className="w-4 h-4 text-white" />
        </div>
        <span className="font-display font-bold text-lg tracking-tight" style={{ color: 'var(--text-primary)' }}>
          Tatool
        </span>
        {/* Badge de rol */}
        <span
          className="ml-auto text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
          style={{
            background: role === 'admin' ? 'var(--accent-dim)' : 'var(--success-dim)',
            color: role === 'admin' ? 'var(--accent-bright)' : 'var(--success)',
          }}
        >
          {role}
        </span>
      </div>

      {/* ── Navegación ───────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {/* Label sección */}
        <p
          className="text-[10px] font-bold uppercase tracking-widest px-3 pb-2 pt-1"
          style={{ color: 'var(--text-muted)' }}
        >
          {role === 'admin' ? 'Administración' : 'Aprendizaje'}
        </p>

        {navItems.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            isActive={pathname === item.href || pathname.startsWith(item.href + '/')}
          />
        ))}
      </nav>

      {/* ── Usuario + Logout ──────────────────────────── */}
      <div
        className="flex-shrink-0 p-3"
        style={{ borderTop: '1px solid var(--border)' }}
      >
        {/* Info usuario */}
        <div className="flex items-center gap-2.5 px-3 py-2 mb-1 rounded-[var(--radius-sm)]"
          style={{ background: 'var(--bg-elevated)' }}
        >
          {/* Avatar con inicial */}
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
            style={{ background: 'var(--accent-dim)', color: 'var(--accent-bright)' }}
          >
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
              {userName}
            </p>
            <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
              {userEmail}
            </p>
          </div>
        </div>

        {/* Botón logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-sm)] text-sm transition-all duration-150 group"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'var(--danger-dim)'
            e.currentTarget.style.color = 'var(--danger)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = 'var(--text-muted)'
          }}
        >
          <LogOut className="w-4 h-4" />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  )
}
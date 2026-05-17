// src/components/admin/UsersTable.tsx
'use client'

import { useState, useTransition } from 'react'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import {
  Search, UserPlus, MoreHorizontal,
  ShieldCheck, ShieldOff, Trash2, UserCheck
} from 'lucide-react'
import type { Profile } from '@/types/database'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface UsersTableProps {
  users: Profile[]
}

export function UsersTable({ users: initialUsers }: UsersTableProps) {
  const [users, setUsers] = useState(initialUsers)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'active' | 'blocked' | 'admin'>('all')
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const supabase = createClient()

  // Filtrar usuarios
  const filtered = users.filter(u => {
    const matchSearch =
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.full_name?.toLowerCase() || '').includes(search.toLowerCase())
    const matchFilter =
      filter === 'all' ? true :
      filter === 'active' ? u.status === 'active' :
      filter === 'blocked' ? u.status === 'blocked' :
      filter === 'admin' ? u.role === 'admin' : true
    return matchSearch && matchFilter
  })

  // Actualizar estado de usuario
  async function updateUserStatus(userId: string, status: 'active' | 'blocked' | 'inactive') {
    startTransition(async () => {
      const { error } = await supabase
        .from('profiles')
        .update({ status })
        .eq('id', userId)

      if (!error) {
        setUsers(prev => prev.map(u =>
          u.id === userId ? { ...u, status } : u
        ))
      }
      setOpenMenu(null)
    })
  }

  // Cambiar rol de usuario
  async function updateUserRole(userId: string, role: 'admin' | 'student') {
    startTransition(async () => {
      const { error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', userId)

      if (!error) {
        setUsers(prev => prev.map(u =>
          u.id === userId ? { ...u, role } : u
        ))
      }
      setOpenMenu(null)
    })
  }

  return (
    <div className="space-y-4 fade-in">

      {/* ── Barra de herramientas ──────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        {/* Búsqueda */}
        <div className="relative w-full sm:w-72">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
            style={{ color: 'var(--text-muted)' }}
          />
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input pl-9"
          />
        </div>

        <div className="flex gap-2">
          {/* Filtros */}
          {(['all', 'active', 'blocked', 'admin'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'px-3 py-1.5 rounded-[var(--radius-sm)] text-xs font-medium transition-all',
                filter === f
                  ? 'bg-[var(--accent)] text-white'
                  : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              )}
            >
              {f === 'all' ? 'Todos' :
               f === 'active' ? 'Activos' :
               f === 'blocked' ? 'Bloqueados' : 'Admins'}
            </button>
          ))}

          {/* Botón nuevo usuario */}
          <button
            className="btn-primary"
            onClick={() => router.push('/admin/users/new')}
          >
            <UserPlus className="w-4 h-4" />
            Nuevo usuario
          </button>
        </div>
      </div>

      {/* ── Tabla ─────────────────────────────────────── */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Usuario', 'Rol', 'Estado', 'Registro', 'Último acceso', ''].map(h => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <p style={{ color: 'var(--text-muted)' }}>
                      No se encontraron usuarios
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((user) => (
                  <tr
                    key={user.id}
                    className="transition-colors"
                    style={{ borderBottom: '1px solid var(--border)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    {/* Usuario */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar
                          name={user.full_name || user.email}
                          src={user.avatar_url}
                          size="sm"
                        />
                        <div>
                          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                            {user.full_name || 'Sin nombre'}
                          </p>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Rol */}
                    <td className="px-4 py-3">
                      <Badge variant={user.role === 'admin' ? 'accent' : 'info'}>
                        {user.role === 'admin' ? '⚡ Admin' : '🎓 Estudiante'}
                      </Badge>
                    </td>

                    {/* Estado */}
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          user.status === 'active' ? 'success' :
                          user.status === 'blocked' ? 'danger' : 'warning'
                        }
                      >
                        {user.status === 'active' ? 'Activo' :
                         user.status === 'blocked' ? 'Bloqueado' : 'Inactivo'}
                      </Badge>
                    </td>

                    {/* Registro */}
                    <td className="px-4 py-3">
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {formatDistanceToNow(new Date(user.created_at), {
                          addSuffix: true, locale: es
                        })}
                      </span>
                    </td>

                    {/* Último acceso */}
                    <td className="px-4 py-3">
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {user.last_login
                          ? formatDistanceToNow(new Date(user.last_login), {
                              addSuffix: true, locale: es
                            })
                          : 'Nunca'}
                      </span>
                    </td>

                    {/* Acciones */}
                    <td className="px-4 py-3 relative">
                      <button
                        onClick={() => setOpenMenu(openMenu === user.id ? null : user.id)}
                        className="btn-ghost p-1.5"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>

                      {/* Menú desplegable */}
                      {openMenu === user.id && (
                        <div
                          className="absolute right-4 top-10 z-50 w-48 rounded-[var(--radius-sm)] overflow-hidden shadow-card"
                          style={{
                            background: 'var(--bg-elevated)',
                            border: '1px solid var(--border-strong)',
                          }}
                        >
                          {/* Activar */}
                          {user.status !== 'active' && (
                            <button
                              onClick={() => updateUserStatus(user.id, 'active')}
                              className="w-full flex items-center gap-2 px-3 py-2.5 text-sm transition-colors text-left"
                              style={{ color: 'var(--success)' }}
                              onMouseEnter={e => e.currentTarget.style.background = 'var(--success-dim)'}
                              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                              <UserCheck className="w-4 h-4" />
                              Activar usuario
                            </button>
                          )}
                          {/* Bloquear */}
                          {user.status !== 'blocked' && (
                            <button
                              onClick={() => updateUserStatus(user.id, 'blocked')}
                              className="w-full flex items-center gap-2 px-3 py-2.5 text-sm transition-colors text-left"
                              style={{ color: 'var(--warning)' }}
                              onMouseEnter={e => e.currentTarget.style.background = 'var(--warning-dim)'}
                              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                              <ShieldOff className="w-4 h-4" />
                              Bloquear usuario
                            </button>
                          )}
                          {/* Hacer admin */}
                          {user.role !== 'admin' && (
                            <button
                              onClick={() => updateUserRole(user.id, 'admin')}
                              className="w-full flex items-center gap-2 px-3 py-2.5 text-sm transition-colors text-left"
                              style={{ color: 'var(--accent-bright)' }}
                              onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-dim)'}
                              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                              <ShieldCheck className="w-4 h-4" />
                              Hacer administrador
                            </button>
                          )}
                          {/* Quitar admin */}
                          {user.role === 'admin' && (
                            <button
                              onClick={() => updateUserRole(user.id, 'student')}
                              className="w-full flex items-center gap-2 px-3 py-2.5 text-sm transition-colors text-left"
                              style={{ color: 'var(--text-secondary)' }}
                              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card)'}
                              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                              <ShieldCheck className="w-4 h-4" />
                              Quitar admin
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer de la tabla */}
        <div
          className="px-4 py-3 flex items-center justify-between"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Mostrando {filtered.length} de {users.length} usuarios
          </p>
        </div>
      </div>
    </div>
  )
}
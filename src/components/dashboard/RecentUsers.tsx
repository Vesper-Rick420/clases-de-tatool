// src/components/dashboard/RecentUsers.tsx
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import type { Profile } from '@/types/database'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

interface RecentUsersProps {
  users: Profile[]
}

export function RecentUsers({ users }: RecentUsersProps) {
  return (
    <div className="card p-5 slide-up stagger-4">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-display font-bold text-base"
          style={{ color: 'var(--text-primary)' }}>
          Usuarios recientes
        </h3>
        
          href="/admin/users"
          className="text-xs font-medium transition-colors"
          style={{ color: 'var(--accent)' }}
        >
          Ver todos →
        </a>
      </div>

      <div className="space-y-3">
        {users.length === 0 ? (
          <p className="text-sm text-center py-6" style={{ color: 'var(--text-muted)' }}>
            No hay usuarios aún
          </p>
        ) : (
          users.map((user) => (
            <div
              key={user.id}
              className="flex items-center gap-3 p-2.5 rounded-[var(--radius-sm)] transition-colors"
              style={{ background: 'transparent' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <Avatar
                name={user.full_name || user.email}
                src={user.avatar_url}
                size="sm"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate"
                  style={{ color: 'var(--text-primary)' }}>
                  {user.full_name || 'Sin nombre'}
                </p>
                <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                  {user.email}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Badge
                  variant={
                    user.status === 'active' ? 'success' :
                    user.status === 'blocked' ? 'danger' : 'warning'
                  }
                >
                  {user.status === 'active' ? 'Activo' :
                   user.status === 'blocked' ? 'Bloqueado' : 'Inactivo'}
                </Badge>
                <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  {formatDistanceToNow(new Date(user.created_at), {
                    addSuffix: true,
                    locale: es
                  })}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
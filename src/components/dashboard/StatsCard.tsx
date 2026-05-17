// src/components/dashboard/StatsCard.tsx
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  change?: {
    value: number
    label: string
  }
  icon: LucideIcon
  color?: 'accent' | 'success' | 'warning' | 'danger' | 'info'
  className?: string
}

const colorMap = {
  accent:  { bg: 'var(--accent-dim)',   text: 'var(--accent-bright)', icon: 'var(--accent)' },
  success: { bg: 'var(--success-dim)',  text: 'var(--success)',       icon: 'var(--success)' },
  warning: { bg: 'var(--warning-dim)',  text: 'var(--warning)',       icon: 'var(--warning)' },
  danger:  { bg: 'var(--danger-dim)',   text: 'var(--danger)',        icon: 'var(--danger)' },
  info:    { bg: 'var(--info-dim)',     text: 'var(--info)',          icon: 'var(--info)' },
}

export function StatsCard({
  title, value, change, icon: Icon, color = 'accent', className
}: StatsCardProps) {
  const colors = colorMap[color]
  const isPositive = (change?.value ?? 0) >= 0

  return (
    <div className={cn('card p-5 slide-up', className)}>
      <div className="flex items-start justify-between">
        {/* Texto */}
        <div className="flex-1">
          <p className="text-xs font-medium uppercase tracking-wider mb-3"
            style={{ color: 'var(--text-muted)' }}>
            {title}
          </p>
          <p className="text-3xl font-display font-bold"
            style={{ color: 'var(--text-primary)' }}>
            {value}
          </p>
          {/* Cambio porcentual */}
          {change && (
            <p className="text-xs mt-2 flex items-center gap-1"
              style={{ color: isPositive ? 'var(--success)' : 'var(--danger)' }}>
              <span>{isPositive ? '↑' : '↓'} {Math.abs(change.value)}%</span>
              <span style={{ color: 'var(--text-muted)' }}>{change.label}</span>
            </p>
          )}
        </div>

        {/* Ícono */}
        <div
          className="w-11 h-11 rounded-[var(--radius-sm)] flex items-center justify-center flex-shrink-0"
          style={{ background: colors.bg }}
        >
          <Icon className="w-5 h-5" style={{ color: colors.icon }} />
        </div>
      </div>

      {/* Barra de progreso decorativa */}
      <div className="mt-4 h-0.5 rounded-full overflow-hidden"
        style={{ background: 'var(--border)' }}>
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{
            width: `${Math.min(100, (Number(value) / 100) * 100) || 60}%`,
            background: colors.icon
          }}
        />
      </div>
    </div>
  )
}
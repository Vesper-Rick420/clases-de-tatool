// src/components/ui/EmptyState.tsx
import type { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  action?: {
    label: string
    href: string
  }
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {/* Ícono con glow */}
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
        style={{ background: 'var(--accent-dim)' }}
      >
        <Icon className="w-8 h-8" style={{ color: 'var(--accent)' }} />
      </div>

      <h3
        className="text-lg font-display font-bold mb-2"
        style={{ color: 'var(--text-primary)' }}
      >
        {title}
      </h3>

      {description && (
        <p className="text-sm max-w-xs" style={{ color: 'var(--text-muted)' }}>
          {description}
        </p>
      )}

      {action && (
        <a href={action.href} className="btn-primary mt-6">
          {action.label}
        </a>
      )}
    </div>
  )
}
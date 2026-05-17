// src/components/ui/ProgressBar.tsx
import { cn } from '@/lib/utils'

interface ProgressBarProps {
  value: number          // 0-100
  color?: 'accent' | 'success' | 'warning' | 'danger' | 'info'
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  animated?: boolean
  className?: string
}

const colorMap = {
  accent:  'var(--accent)',
  success: 'var(--success)',
  warning: 'var(--warning)',
  danger:  'var(--danger)',
  info:    'var(--info)',
}

const sizeMap = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
}

export function ProgressBar({
  value,
  color = 'accent',
  size = 'md',
  showLabel = false,
  animated = true,
  className,
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value))

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
            Progreso
          </span>
          <span
            className="text-xs font-bold"
            style={{ color: colorMap[color] }}
          >
            {clamped}%
          </span>
        </div>
      )}
      <div
        className={cn('w-full rounded-full overflow-hidden', sizeMap[size])}
        style={{ background: 'var(--border)' }}
      >
        <div
          className={cn(
            'h-full rounded-full',
            animated && 'transition-all duration-700 ease-out'
          )}
          style={{
            width: `${clamped}%`,
            background: colorMap[color],
            boxShadow: clamped > 0 ? `0 0 8px ${colorMap[color]}60` : 'none',
          }}
        />
      </div>
    </div>
  )
}
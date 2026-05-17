// src/components/ui/Avatar.tsx
import { cn } from '@/lib/utils'

interface AvatarProps {
  name: string
  src?: string | null
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

// Genera un color de avatar basado en el nombre
function getAvatarColor(name: string): string {
  const colors = [
    '#7c6fff', '#f87171', '#34d399', '#fbbf24',
    '#60a5fa', '#a78bfa', '#f472b6', '#2dd4bf',
  ]
  const index = name.charCodeAt(0) % colors.length
  return colors[index]
}

export function Avatar({ name, src, size = 'md', className }: AvatarProps) {
  const sizes = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl',
  }

  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn('rounded-full object-cover', sizes[size], className)}
      />
    )
  }

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-display font-bold flex-shrink-0',
        sizes[size],
        className
      )}
      style={{ backgroundColor: getAvatarColor(name) + '33', color: getAvatarColor(name) }}
    >
      {initials}
    </div>
  )
}
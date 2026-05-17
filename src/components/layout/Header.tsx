// src/components/layout/Header.tsx
'use client'

import { Bell, Search, Menu } from 'lucide-react'
import { useState } from 'react'

interface HeaderProps {
  title: string
  subtitle?: string
}

export function Header({ title, subtitle }: HeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <header
      className="sticky top-0 z-30 flex items-center px-6 gap-4"
      style={{
        height: 'var(--header-height)',
        background: 'var(--bg-primary)88',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      {/* Título de la página */}
      <div className="flex-1">
        <h1
          className="text-lg font-display font-bold leading-none"
          style={{ color: 'var(--text-primary)' }}
        >
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {subtitle}
          </p>
        )}
      </div>

      {/* Búsqueda */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setSearchOpen(!searchOpen)}
          className="btn-ghost p-2"
          style={{ color: 'var(--text-muted)' }}
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Notificaciones */}
        <button
          className="btn-ghost p-2 relative"
          style={{ color: 'var(--text-muted)' }}
        >
          <Bell className="w-4 h-4" />
          {/* Indicador de notificación */}
          <span
            className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full"
            style={{ background: 'var(--accent)' }}
          />
        </button>
      </div>
    </header>
  )
}
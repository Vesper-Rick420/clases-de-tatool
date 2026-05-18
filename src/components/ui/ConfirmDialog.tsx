// src/components/ui/ConfirmDialog.tsx
'use client'

import { AlertTriangle } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmLabel?: string
  variant?: 'danger' | 'warning'
  loading?: boolean
}

export function ConfirmDialog({
  isOpen, onClose, onConfirm,
  title, description,
  confirmLabel = 'Confirmar',
  variant = 'danger',
  loading = false,
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="space-y-4">
        {/* Ícono de advertencia */}
        <div className="flex items-start gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              background: variant === 'danger' ? 'var(--danger-dim)' : 'var(--warning-dim)'
            }}
          >
            <AlertTriangle
              className="w-5 h-5"
              style={{ color: variant === 'danger' ? 'var(--danger)' : 'var(--warning)' }}
            />
          </div>
          <p className="text-sm pt-1.5" style={{ color: 'var(--text-secondary)' }}>
            {description}
          </p>
        </div>

        {/* Botones */}
        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="btn-ghost" disabled={loading}>
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={variant === 'danger' ? 'btn-danger' : 'btn-primary'}
            style={{
              background: variant === 'danger' ? 'var(--danger)' : 'var(--warning)',
              color: '#fff',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading && (
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  )
}
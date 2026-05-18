// src/components/admin/CategoriesClient.tsx
'use client'

import { useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Modal } from '@/components/ui/Modal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import type { Category } from '@/types/database'
import { slugify } from '@/lib/utils'

interface CategoriesClientProps {
  initialCategories: Category[]
}

const COLORS = [
  '#6366f1','#ec4899','#f59e0b','#10b981',
  '#60a5fa','#a78bfa','#f472b6','#2dd4bf',
  '#fb923c','#4ade80',
]

export function CategoriesClient({ initialCategories }: CategoriesClientProps) {
  const [categories, setCategories] = useState(initialCategories)
  const [modalOpen,  setModalOpen]  = useState(false)
  const [editing,    setEditing]    = useState<Category | null>(null)
  const [deleting,   setDeleting]   = useState<Category | null>(null)
  const [isPending,  startTransition] = useTransition()

  // Form state
  const [name,  setName]  = useState('')
  const [color, setColor] = useState(COLORS[0])
  const [icon,  setIcon]  = useState('')

  const supabase = createClient()

  function openCreate() {
    setEditing(null); setName(''); setColor(COLORS[0]); setIcon('')
    setModalOpen(true)
  }

  function openEdit(cat: Category) {
    setEditing(cat); setName(cat.name); setColor(cat.color); setIcon(cat.icon ?? '')
    setModalOpen(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    startTransition(async () => {
      const payload = { name: name.trim(), slug: slugify(name), color, icon: icon || null }
      if (editing) {
        const { data } = await supabase
          .from('categories').update(payload).eq('id', editing.id).select().single()
        if (data) setCategories(prev => prev.map(c => c.id === editing.id ? data : c))
      } else {
        const { data } = await supabase
          .from('categories').insert(payload).select().single()
        if (data) setCategories(prev => [...prev, data])
      }
      setModalOpen(false)
    })
  }

  async function confirmDelete() {
    if (!deleting) return
    startTransition(async () => {
      await supabase.from('categories').delete().eq('id', deleting.id)
      setCategories(prev => prev.filter(c => c.id !== deleting.id))
      setDeleting(null)
    })
  }

  return (
    <div className="space-y-4 fade-in">
      <div className="flex justify-end">
        <button onClick={openCreate} className="btn-primary">
          <Plus className="w-4 h-4" />
          Nueva categoría
        </button>
      </div>

      <div className="card overflow-hidden">
        {categories.length === 0 ? (
          <p className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
            No hay categorías. Crea la primera.
          </p>
        ) : (
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Categoría', 'Slug', 'Cursos', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider"
                    style={{ color: 'var(--text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {categories.map(cat => (
                <tr key={cat.id}
                  style={{ borderBottom: '1px solid var(--border)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ background: cat.color }} />
                      <span className="text-sm font-medium"
                        style={{ color: 'var(--text-primary)' }}>{cat.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <code className="text-xs px-1.5 py-0.5 rounded"
                      style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>
                      {cat.slug}
                    </code>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>—</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <button onClick={() => openEdit(cat)} className="btn-ghost p-1.5">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setDeleting(cat)} className="btn-ghost p-1.5"
                        style={{ color: 'var(--danger)' }}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal crear/editar */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}
        title={editing ? 'Editar categoría' : 'Nueva categoría'} size="sm">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5"
              style={{ color: 'var(--text-secondary)' }}>Nombre</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)}
              className="input" placeholder="Programación" required autoFocus />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2"
              style={{ color: 'var(--text-secondary)' }}>Color</label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map(c => (
                <button key={c} type="button" onClick={() => setColor(c)}
                  className="w-7 h-7 rounded-full transition-transform"
                  style={{
                    background: c,
                    transform: color === c ? 'scale(1.25)' : 'scale(1)',
                    boxShadow: color === c ? `0 0 0 2px var(--bg-card), 0 0 0 4px ${c}` : 'none',
                  }}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={() => setModalOpen(false)}
              className="btn-ghost flex-1 justify-center" disabled={isPending}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary flex-1 justify-center"
              disabled={isPending}>
              {editing ? 'Guardar' : 'Crear'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleting} onClose={() => setDeleting(null)}
        onConfirm={confirmDelete} title="Eliminar categoría"
        description={`¿Eliminar la categoría "${deleting?.name}"?`}
        confirmLabel="Eliminar" loading={isPending}
      />
    </div>
  )
}
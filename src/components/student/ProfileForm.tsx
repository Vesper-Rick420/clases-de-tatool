// src/components/student/ProfileForm.tsx
'use client'

import { useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Avatar } from '@/components/ui/Avatar'
import { User, Mail, Phone, Lock, Eye, EyeOff, Save, CheckCircle2, AlertCircle } from 'lucide-react'
import type { Profile } from '@/types/database'

interface ProfileFormProps {
  profile: Profile
}

type AlertType = { type: 'success' | 'error'; message: string } | null

export function ProfileForm({ profile }: ProfileFormProps) {
  // ── Estado del formulario de perfil ──────────────────
  const [fullName, setFullName] = useState(profile.full_name ?? '')
  const [phone, setPhone]       = useState(profile.phone ?? '')
  const [profileAlert, setProfileAlert] = useState<AlertType>(null)

  // ── Estado del formulario de contraseña ─────────────
  const [currentPass, setCurrentPass]   = useState('')
  const [newPass, setNewPass]           = useState('')
  const [confirmPass, setConfirmPass]   = useState('')
  const [showPasses, setShowPasses]     = useState(false)
  const [passAlert, setPassAlert]       = useState<AlertType>(null)

  const [isPending, startTransition] = useTransition()
  const supabase = createClient()

  // ── Guardar perfil ────────────────────────────────────
  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName, phone })
        .eq('id', profile.id)

      setProfileAlert(
        error
          ? { type: 'error', message: 'Error al guardar. Intenta de nuevo.' }
          : { type: 'success', message: 'Perfil actualizado correctamente.' }
      )
      setTimeout(() => setProfileAlert(null), 3000)
    })
  }

  // ── Cambiar contraseña ────────────────────────────────
  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    if (newPass !== confirmPass) {
      setPassAlert({ type: 'error', message: 'Las contraseñas nuevas no coinciden.' })
      return
    }
    if (newPass.length < 8) {
      setPassAlert({ type: 'error', message: 'La contraseña debe tener al menos 8 caracteres.' })
      return
    }

    startTransition(async () => {
      const { error } = await supabase.auth.updateUser({ password: newPass })
      if (error) {
        setPassAlert({ type: 'error', message: 'Error al cambiar la contraseña.' })
      } else {
        setPassAlert({ type: 'success', message: '¡Contraseña actualizada correctamente!' })
        setCurrentPass(''); setNewPass(''); setConfirmPass('')
      }
      setTimeout(() => setPassAlert(null), 3000)
    })
  }

  // ── Componente Alert ─────────────────────────────────
  const Alert = ({ alert }: { alert: AlertType }) => {
    if (!alert) return null
    return (
      <div
        className="flex items-center gap-2 p-3 rounded-[var(--radius-sm)] text-sm mb-4"
        style={{
          background: alert.type === 'success' ? 'var(--success-dim)' : 'var(--danger-dim)',
          color:      alert.type === 'success' ? 'var(--success)'     : 'var(--danger)',
        }}
      >
        {alert.type === 'success'
          ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          : <AlertCircle  className="w-4 h-4 flex-shrink-0" />}
        {alert.message}
      </div>
    )
  }

  return (
    <div className="space-y-6 fade-in">

      {/* ── Card: Información del perfil ──────────────── */}
      <div className="card p-6">
        {/* Avatar + info */}
        <div
          className="flex items-center gap-4 mb-6 pb-6"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <Avatar
            name={profile.full_name || profile.email}
            src={profile.avatar_url}
            size="xl"
          />
          <div>
            <h2
              className="font-display font-bold text-xl"
              style={{ color: 'var(--text-primary)' }}
            >
              {profile.full_name || 'Sin nombre'}
            </h2>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {profile.email}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span
                className="badge"
                style={{
                  background: profile.role === 'admin' ? 'var(--accent-dim)' : 'var(--info-dim)',
                  color:      profile.role === 'admin' ? 'var(--accent-bright)' : 'var(--info)',
                }}
              >
                {profile.role === 'admin' ? '⚡ Admin' : '🎓 Estudiante'}
              </span>
              <span
                className="badge badge-success"
              >
                ● Activo
              </span>
            </div>
          </div>
        </div>

        {/* Formulario */}
        <Alert alert={profileAlert} />

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <h3
            className="font-display font-semibold text-sm mb-4"
            style={{ color: 'var(--text-secondary)' }}
          >
            Información personal
          </h3>

          {/* Nombre completo */}
          <div>
            <label
              className="block text-sm font-medium mb-1.5"
              style={{ color: 'var(--text-secondary)' }}
            >
              Nombre completo
            </label>
            <div className="relative">
              <User
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                style={{ color: 'var(--text-muted)' }}
              />
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Tu nombre completo"
                className="input pl-10"
              />
            </div>
          </div>

          {/* Email (solo lectura) */}
          <div>
            <label
              className="block text-sm font-medium mb-1.5"
              style={{ color: 'var(--text-secondary)' }}
            >
              Correo electrónico
              <span
                className="ml-2 text-xs"
                style={{ color: 'var(--text-muted)' }}
              >
                (no editable)
              </span>
            </label>
            <div className="relative">
              <Mail
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                style={{ color: 'var(--text-muted)' }}
              />
              <input
                type="email"
                value={profile.email}
                disabled
                className="input pl-10 opacity-50 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Teléfono */}
          <div>
            <label
              className="block text-sm font-medium mb-1.5"
              style={{ color: 'var(--text-secondary)' }}
            >
              Teléfono
            </label>
            <div className="relative">
              <Phone
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                style={{ color: 'var(--text-muted)' }}
              />
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+593 99 999 9999"
                className="input pl-10"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="btn-primary"
          >
            {isPending ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Guardar cambios
          </button>
        </form>
      </div>

      {/* ── Card: Cambiar contraseña ───────────────────── */}
      <div className="card p-6">
        <h3
          className="font-display font-bold text-base mb-4"
          style={{ color: 'var(--text-primary)' }}
        >
          <Lock className="w-4 h-4 inline mr-2" style={{ color: 'var(--accent)' }} />
          Cambiar contraseña
        </h3>

        <Alert alert={passAlert} />

        <form onSubmit={handleChangePassword} className="space-y-4">
          {/* Nueva contraseña */}
          <div>
            <label
              className="block text-sm font-medium mb-1.5"
              style={{ color: 'var(--text-secondary)' }}
            >
              Nueva contraseña
            </label>
            <div className="relative">
              <Lock
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                style={{ color: 'var(--text-muted)' }}
              />
              <input
                type={showPasses ? 'text' : 'password'}
                value={newPass}
                onChange={e => setNewPass(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                className="input pl-10 pr-10"
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPasses(!showPasses)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--text-muted)' }}
              >
                {showPasses ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirmar contraseña */}
          <div>
            <label
              className="block text-sm font-medium mb-1.5"
              style={{ color: 'var(--text-secondary)' }}
            >
              Confirmar contraseña
            </label>
            <div className="relative">
              <Lock
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                style={{ color: 'var(--text-muted)' }}
              />
              <input
                type={showPasses ? 'text' : 'password'}
                value={confirmPass}
                onChange={e => setConfirmPass(e.target.value)}
                placeholder="Repite la nueva contraseña"
                className="input pl-10"
                required
              />
            </div>
            {/* Indicador de coincidencia */}
            {confirmPass && (
              <p
                className="text-xs mt-1"
                style={{
                  color: newPass === confirmPass ? 'var(--success)' : 'var(--danger)'
                }}
              >
                {newPass === confirmPass ? '✓ Las contraseñas coinciden' : '✗ No coinciden'}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isPending || !newPass || !confirmPass}
            className="btn-primary"
            style={{ opacity: (!newPass || !confirmPass) ? 0.5 : 1 }}
          >
            {isPending ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Lock className="w-4 h-4" />
            )}
            Cambiar contraseña
          </button>
        </form>
      </div>

      {/* ── Card: Info de seguridad ────────────────────── */}
      <div className="card p-5">
        <h3
          className="font-display font-semibold text-sm mb-3"
          style={{ color: 'var(--text-secondary)' }}
        >
          Información de la cuenta
        </h3>
        <div className="space-y-2">
          {[
            { label: 'Miembro desde',
              value: new Date(profile.created_at).toLocaleDateString('es-ES', {
                year: 'numeric', month: 'long', day: 'numeric'
              })
            },
            { label: 'Último acceso',
              value: profile.last_login
                ? new Date(profile.last_login).toLocaleDateString('es-ES', {
                    year: 'numeric', month: 'long', day: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                  })
                : 'Primera sesión'
            },
            { label: 'ID de usuario', value: profile.id.slice(0, 8) + '...' },
          ].map(item => (
            <div
              key={item.label}
              className="flex items-center justify-between py-2"
              style={{ borderBottom: '1px solid var(--border)' }}
            >
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {item.label}
              </span>
              <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
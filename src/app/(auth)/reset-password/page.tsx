// src/app/(auth)/reset-password/page.tsx
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { GraduationCap, Mail, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function ResetPasswordPage() {
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent]       = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const supabase = createClient()

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    })

    if (error) {
      setError('Error al enviar el correo. Verifica el email ingresado.')
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'var(--bg-primary)' }}
    >
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 50% at 50% -20%, var(--accent-dim), transparent)',
        }}
      />

      <div className="w-full max-w-sm relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'var(--accent)', boxShadow: '0 0 40px var(--accent-glow)' }}
          >
            <GraduationCap className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-display font-bold" style={{ color: 'var(--text-primary)' }}>
            Recuperar contraseña
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Te enviamos un enlace a tu correo
          </p>
        </div>

        <div className="card p-6">
          {sent ? (
            /* ── Estado: correo enviado ── */
            <div className="text-center py-4">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: 'var(--success-dim)' }}
              >
                <CheckCircle2 className="w-7 h-7" style={{ color: 'var(--success)' }} />
              </div>
              <h2
                className="font-display font-bold text-lg mb-2"
                style={{ color: 'var(--text-primary)' }}
              >
                ¡Correo enviado!
              </h2>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Revisa tu bandeja de entrada en <strong style={{ color: 'var(--text-secondary)' }}>{email}</strong>.
                El enlace expira en 1 hora.
              </p>
            </div>
          ) : (
            /* ── Formulario ── */
            <>
              {error && (
                <div
                  className="flex items-center gap-2 p-3 rounded-[var(--radius-sm)] mb-4 text-sm"
                  style={{ background: 'var(--danger-dim)', color: 'var(--danger)' }}
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <form onSubmit={handleReset} className="space-y-4">
                <div>
                  <label
                    className="block text-sm font-medium mb-1.5"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    Correo electrónico
                  </label>
                  <div className="relative">
                    <Mail
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                      style={{ color: 'var(--text-muted)' }}
                    />
                    <input
                      type="email"
                      placeholder="tu@email.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="input pl-10"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full justify-center py-3"
                  style={{ opacity: loading ? 0.7 : 1 }}
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Mail className="w-4 h-4" />
                  )}
                  Enviar enlace de recuperación
                </button>
              </form>
            </>
          )}
        </div>

        {/* Volver al login */}
        <div className="text-center mt-4">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-sm transition-colors"
            style={{ color: 'var(--text-muted)' }}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  )
}
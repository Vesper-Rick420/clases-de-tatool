// src/app/page.tsx
import Link from 'next/link'
import { GraduationCap, ArrowRight, Shield, Zap, Users } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8"
      style={{ background: 'var(--bg-primary)' }}>

      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 40% at 50% 0%, var(--accent-dim), transparent)'
        }}
      />

      <div className="max-w-2xl text-center relative">
        {/* Logo */}
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
          style={{ background: 'var(--accent)', boxShadow: '0 0 60px var(--accent-glow)' }}
        >
          <GraduationCap className="w-8 h-8 text-white" />
        </div>

        {/* Headline */}
        <h1 className="text-5xl font-display font-bold mb-4 leading-tight"
          style={{ color: 'var(--text-primary)' }}>
          Aprende sin límites
          <br />
          <span style={{ color: 'var(--accent)' }}>con Tatool</span>
        </h1>

        <p className="text-lg mb-8" style={{ color: 'var(--text-secondary)' }}>
          Plataforma privada de cursos profesionales. Accede a contenido
          exclusivo, descarga recursos y lleva un control de tu progreso.
        </p>

        <Link href="/login" className="btn-primary text-base px-8 py-3">
          Acceder a la plataforma
          <ArrowRight className="w-5 h-5" />
        </Link>

        {/* Features */}
        <div className="grid grid-cols-3 gap-4 mt-12">
          {[
            { icon: Shield,  label: 'Contenido privado y seguro'  },
            { icon: Zap,     label: 'Aprendizaje a tu ritmo'       },
            { icon: Users,   label: 'Gestión de estudiantes'       },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="card p-4">
              <Icon className="w-5 h-5 mx-auto mb-2" style={{ color: 'var(--accent)' }} />
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
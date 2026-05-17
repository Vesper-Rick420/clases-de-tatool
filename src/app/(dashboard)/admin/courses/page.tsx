// Ejemplo para src/app/(dashboard)/admin/courses/page.tsx
import { Header } from '@/components/layout/Header'

export default function Page() {
  return (
    <div>
      <Header title="Cursos" subtitle="Próximamente en la siguiente fase" />
      <div className="p-6">
        <div className="card p-12 text-center">
          <p style={{ color: 'var(--text-muted)' }}>
            Esta sección se construye en la Fase 5 🚀
          </p>
        </div>
      </div>
    </div>
  )
}
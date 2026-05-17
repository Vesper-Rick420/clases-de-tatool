// src/components/dashboard/WelcomeBanner.tsx
import { Flame, Star, Trophy } from 'lucide-react'

interface WelcomeBannerProps {
  userName: string
  totalCourses: number
  completedCourses: number
  overallProgress: number
}

export function WelcomeBanner({
  userName,
  totalCourses,
  completedCourses,
  overallProgress,
}: WelcomeBannerProps) {
  // Motivación dinámica según progreso
  const getMessage = () => {
    if (overallProgress === 0) return '¡Empieza tu primer curso hoy!'
    if (overallProgress < 25)  return '¡Buen inicio! Sigue así 💪'
    if (overallProgress < 50)  return '¡Vas por buen camino!'
    if (overallProgress < 75)  return '¡Más de la mitad! No te detengas 🔥'
    if (overallProgress < 100) return '¡Casi lo logras! 🚀'
    return '¡Eres increíble! Completaste todo 🏆'
  }

  return (
    <div
      className="relative overflow-hidden rounded-[var(--radius-lg)] p-6 slide-up"
      style={{
        background: 'linear-gradient(135deg, var(--accent) 0%, #5b4fe0 100%)',
        boxShadow: '0 8px 40px var(--accent-glow)',
      }}
    >
      {/* Decoración de fondo */}
      <div
        className="absolute -right-8 -top-8 w-40 h-40 rounded-full opacity-20"
        style={{ background: 'rgba(255,255,255,0.3)' }}
      />
      <div
        className="absolute -right-4 bottom-0 w-24 h-24 rounded-full opacity-10"
        style={{ background: 'rgba(255,255,255,0.5)' }}
      />

      <div className="relative flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Texto */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Flame className="w-4 h-4 text-yellow-300" />
            <span className="text-white/80 text-sm font-medium">
              {getMessage()}
            </span>
          </div>
          <h2 className="text-2xl font-display font-bold text-white">
            Hola, {userName.split(' ')[0]} 👋
          </h2>
          <p className="text-white/70 text-sm mt-1">
            Continúa donde lo dejaste
          </p>
        </div>

        {/* Stats rápidas */}
        <div className="flex gap-4">
          {[
            { icon: Star,   label: 'En progreso', value: totalCourses - completedCourses, color: '#fbbf24' },
            { icon: Trophy, label: 'Completados',  value: completedCourses,               color: '#34d399' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div
              key={label}
              className="flex flex-col items-center px-4 py-3 rounded-[var(--radius-sm)]"
              style={{ background: 'rgba(255,255,255,0.15)' }}
            >
              <Icon className="w-5 h-5 mb-1" style={{ color }} />
              <span className="text-2xl font-display font-bold text-white">{value}</span>
              <span className="text-white/70 text-xs">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Barra de progreso general */}
      <div className="relative mt-5">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-white/70 text-xs">Progreso general</span>
          <span className="text-white font-bold text-sm">{overallProgress}%</span>
        </div>
        <div
          className="h-2 rounded-full overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.2)' }}
        >
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{
              width: `${overallProgress}%`,
              background: 'rgba(255,255,255,0.9)',
            }}
          />
        </div>
      </div>
    </div>
  )
}
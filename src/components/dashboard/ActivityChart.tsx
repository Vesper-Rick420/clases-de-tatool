// src/components/dashboard/ActivityChart.tsx
'use client'

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts'

// Tooltip personalizado con el estilo de la app
function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div
        className="px-3 py-2 rounded-[var(--radius-sm)] text-sm"
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-strong)',
          color: 'var(--text-primary)',
        }}
      >
        <p style={{ color: 'var(--text-muted)', fontSize: '11px' }}>{label}</p>
        {payload.map((entry: any, i: number) => (
          <p key={i} className="font-medium" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

interface ActivityChartProps {
  data: Array<{
    name: string
    estudiantes: number
    lecciones: number
  }>
}

export function ActivityChart({ data }: ActivityChartProps) {
  return (
    <div className="card p-5 slide-up stagger-3">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-display font-bold text-base"
            style={{ color: 'var(--text-primary)' }}>
            Actividad de la plataforma
          </h3>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Últimos 7 días
          </p>
        </div>

        {/* Leyenda */}
        <div className="flex items-center gap-4">
          {[
            { color: 'var(--accent)', label: 'Estudiantes' },
            { color: 'var(--success)', label: 'Lecciones' },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorEstudiantes" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="var(--accent)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorLecciones" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="var(--success)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="var(--success)" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--border)"
            vertical={false}
          />
          <XAxis
            dataKey="name"
            tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="estudiantes"
            name="Estudiantes"
            stroke="var(--accent)"
            strokeWidth={2}
            fill="url(#colorEstudiantes)"
          />
          <Area
            type="monotone"
            dataKey="lecciones"
            name="Lecciones"
            stroke="var(--success)"
            strokeWidth={2}
            fill="url(#colorLecciones)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
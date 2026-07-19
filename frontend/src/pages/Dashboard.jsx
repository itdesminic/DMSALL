import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'

export default function Dashboard() {
  const [stats, setStats] = useState([])
  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/dashboard/stats')
        setStats(response.data.stats)
        setRecentActivity(response.data.recentActivity)
      } catch (err) {
        console.error('Error cargando estadísticas del dashboard:', err)
        setError('No se pudieron cargar las estadísticas reales de la base de datos.')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-slate-500 animate-pulse text-lg font-medium">Cargando métricas de la base de datos...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Panel General</h1>
          <p className="text-sm text-slate-500 mt-1">Resumen operativo y métricas en tiempo real.</p>
        </div>
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 border border-emerald-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span>
            Base de datos conectada (SQLite)
          </span>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-800">
          ⚠️ {error} Mostrando datos estáticos de demostración.
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {(stats.length > 0 ? stats : [
          { title: 'Formularios', value: '0', detail: 'enviados en total' },
          { title: 'PDFs', value: '0', detail: 'generados en total' },
          { title: 'Comidas', value: '0', detail: 'confirmaciones registradas' },
          { title: 'Radios', value: '0', detail: 'equipos en inventario' }
        ]).map((item, idx) => {
          const icons = ['📝', '📄', '🍽️', '📻']
          const colors = [
            'border-blue-100 bg-blue-50/20 text-blue-600',
            'border-violet-100 bg-violet-50/20 text-violet-600',
            'border-emerald-100 bg-emerald-50/20 text-emerald-600',
            'border-amber-100 bg-amber-50/20 text-amber-600'
          ]
          const isLink = item.title === 'Formularios' || item.title === 'PDFs'
          const cardContent = (
            <div className="flex items-center justify-between w-full">
              <div>
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">{item.title}</span>
                <p className="mt-2 text-3xl font-extrabold text-slate-950 tracking-tight">{item.value}</p>
                <p className="mt-1 text-xs text-slate-500 font-medium">{item.detail}</p>
              </div>
              <div className={`h-12 w-12 rounded-xl border flex items-center justify-center text-xl shadow-sm ${colors[idx % 4]}`}>
                {icons[idx % 4]}
              </div>
            </div>
          )

          if (isLink) {
            return (
              <Link 
                to="/checklist-reportes" 
                key={item.title} 
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition duration-200 hover:border-blue-300 hover:scale-[1.01] transform block"
                title="Haga clic para ver el historial y reportes detallados"
              >
                {cardContent}
              </Link>
            )
          }

          return (
            <div key={item.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex items-center justify-between">
              {cardContent}
            </div>
          )
        })}
      </div>

      {/* Two Column details */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Activity */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="border-b border-slate-100 pb-3 mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Actividad Reciente</h2>
            <Link to="/checklist-reportes" className="text-xs font-bold text-blue-600 hover:text-blue-700 transition">
              Ver todos →
            </Link>
          </div>
          {recentActivity.length > 0 ? (
            <ul className="space-y-3">
              {recentActivity.map((activity, index) => (
                <li key={index} className="text-sm text-slate-700 bg-slate-50 border border-slate-100 p-3.5 rounded-xl flex items-start gap-2.5">
                  <span className="mt-0.5">ℹ️</span>
                  <span className="font-medium leading-relaxed">{activity}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-10">
              <span className="text-3xl block mb-2">📋</span>
              <p className="text-sm font-semibold text-slate-400">Sin actividad registrada en la base de datos.</p>
              <p className="text-xs text-slate-400 mt-1">Completa y envía un formulario de vehículo liviano para ver registros aquí.</p>
            </div>
          )}
        </div>

        {/* Module Statuses */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="border-b border-slate-100 pb-3 mb-4">
            <h2 className="text-lg font-bold text-slate-900">Estado de Módulos</h2>
          </div>
          <div className="space-y-3.5">
            {[
              { name: 'Formularios Operativos', status: 'Activo', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
              { name: 'Control de Comensales', status: 'Activo', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
              { name: 'Inventario de Radios', status: 'En diseño', color: 'bg-blue-100 text-blue-800 border-blue-200' },
              { name: 'Salas de Reuniones', status: 'En diseño', color: 'bg-blue-100 text-blue-800 border-blue-200' },
              { name: 'Muestras de Crimea', status: 'Activo', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
              { name: 'Administración General', status: 'Activo', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' }
            ].map((mod) => (
              <div key={mod.name} className="flex items-center justify-between border-b border-slate-50 pb-2.5 last:border-0 last:pb-0">
                <span className="text-sm font-semibold text-slate-700">{mod.name}</span>
                <span className={`rounded-lg border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${mod.color}`}>
                  {mod.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

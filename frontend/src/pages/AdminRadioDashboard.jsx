import React, { useState, useEffect } from 'react'
import api from '../services/api'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AdminRadioDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    total: 0,
    bueno: 0,
    mantenimiento: 0,
    danado: 0,
    reportsPending: 0,
    reportsProgress: 0,
    reportsResolved: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    setLoading(true)
    try {
      // Get radios list
      const radiosRes = await api.get('/radios')
      const radios = radiosRes.data

      // Get reports list
      const reportsRes = await api.get('/radios/reports')
      const reports = reportsRes.data

      setStats({
        total: radios.length,
        bueno: radios.filter(r => r.status === 'bueno').length,
        mantenimiento: radios.filter(r => r.status === 'mantenimiento').length,
        danado: radios.filter(r => r.status === 'dañado').length,
        reportsPending: reports.filter(r => r.status === 'pending').length,
        reportsProgress: reports.filter(r => r.status === 'in_progress').length,
        reportsResolved: reports.filter(r => r.status === 'resolved').length
      })
    } catch (err) {
      console.error('Error fetching dashboard stats:', err)
    } finally {
      setLoading(false)
    }
  }

  const siteTitle = user?.site && user.site !== 'Todos' ? `Mina ${user.site}` : 'Administración Global'

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Consola de IT - Radios</h1>
          <p className="text-sm text-slate-500 mt-1">Monitoreo de equipos, reportes de fallas e inventario para {siteTitle}.</p>
        </div>
        <div className="inline-flex gap-2">
          <Link
            to="/radios/itadmon/listado"
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition"
          >
            📋 Inventario
          </Link>
          <Link
            to="/radios/itadmon/reportes"
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition"
          >
            🛎️ Tickets
          </Link>
          <Link
            to="/radios/itadmon/new"
            className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition"
          >
            ➕ Registrar Radio
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-500 animate-pulse font-medium">
          Cargando consola de IT...
        </div>
      ) : (
        <div className="space-y-6">
          {/* KPI grid for Radios */}
          <div>
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Resumen de Inventario de Radios</h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {/* Total */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex items-center justify-between">
                <div>
                  <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Total Registrados</span>
                  <p className="mt-2 text-3xl font-extrabold text-slate-950 tracking-tight">{stats.total}</p>
                  <p className="mt-1 text-xs text-slate-500 font-medium">Radios en base de datos</p>
                </div>
                <div className="h-12 w-12 rounded-xl border border-slate-100 bg-slate-50 text-slate-600 flex items-center justify-center text-xl shadow-sm">
                  📻
                </div>
              </div>

              {/* Buenos */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex items-center justify-between">
                <div>
                  <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Estado Bueno</span>
                  <p className="mt-2 text-3xl font-extrabold text-emerald-700 tracking-tight">{stats.bueno}</p>
                  <p className="mt-1 text-xs text-slate-500 font-medium">Listos para operar</p>
                </div>
                <div className="h-12 w-12 rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl shadow-sm">
                  ✅
                </div>
              </div>

              {/* Mantenimiento */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex items-center justify-between">
                <div>
                  <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">En Mantenimiento</span>
                  <p className="mt-2 text-3xl font-extrabold text-amber-700 tracking-tight">{stats.mantenimiento}</p>
                  <p className="mt-1 text-xs text-slate-500 font-medium">En taller o revisión</p>
                </div>
                <div className="h-12 w-12 rounded-xl border border-amber-100 bg-amber-50 text-amber-600 flex items-center justify-center text-xl shadow-sm">
                  🔧
                </div>
              </div>

              {/* Dañados */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex items-center justify-between">
                <div>
                  <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Dañados / Inactivos</span>
                  <p className="mt-2 text-3xl font-extrabold text-rose-700 tracking-tight">{stats.danado}</p>
                  <p className="mt-1 text-xs text-slate-500 font-medium">Requieren baja / repuestos</p>
                </div>
                <div className="h-12 w-12 rounded-xl border border-rose-100 bg-rose-50 text-rose-600 flex items-center justify-center text-xl shadow-sm">
                  🛑
                </div>
              </div>
            </div>
          </div>

          {/* KPI grid for Tickets */}
          <div>
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Historial de Reportes / Tickets de Soporte</h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {/* Total Tickets */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex items-center justify-between">
                <div>
                  <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Total Tickets</span>
                  <p className="mt-2 text-3xl font-extrabold text-slate-950 tracking-tight">
                    {stats.reportsPending + stats.reportsProgress + stats.reportsResolved}
                  </p>
                  <p className="mt-1 text-xs text-slate-500 font-medium">Notificados por usuarios</p>
                </div>
                <div className="h-12 w-12 rounded-xl border border-slate-100 bg-slate-50 text-slate-600 flex items-center justify-center text-xl shadow-sm">
                  🛎️
                </div>
              </div>

              {/* Pendientes */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex items-center justify-between">
                <div>
                  <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Pendientes</span>
                  <p className="mt-2 text-3xl font-extrabold text-rose-700 tracking-tight">{stats.reportsPending}</p>
                  <p className="mt-1 text-xs text-slate-500 font-medium">Sin atender</p>
                </div>
                <div className="h-12 w-12 rounded-xl border border-rose-100 bg-rose-50 text-rose-600 flex items-center justify-center text-xl shadow-sm">
                  ⚠️
                </div>
              </div>

              {/* En Progreso */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex items-center justify-between">
                <div>
                  <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">En Progreso</span>
                  <p className="mt-2 text-3xl font-extrabold text-amber-700 tracking-tight">{stats.reportsProgress}</p>
                  <p className="mt-1 text-xs text-slate-500 font-medium">Siendo revisados</p>
                </div>
                <div className="h-12 w-12 rounded-xl border border-amber-100 bg-amber-50 text-amber-600 flex items-center justify-center text-xl shadow-sm">
                  ⚡
                </div>
              </div>

              {/* Resueltos */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex items-center justify-between">
                <div>
                  <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Resueltos</span>
                  <p className="mt-2 text-3xl font-extrabold text-emerald-700 tracking-tight">{stats.reportsResolved}</p>
                  <p className="mt-1 text-xs text-slate-500 font-medium">Solucionados con éxito</p>
                </div>
                <div className="h-12 w-12 rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl shadow-sm">
                  ✓
                </div>
              </div>
            </div>
          </div>

          {/* Quick Access Block */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm grid gap-5 md:grid-cols-3">
            <div className="space-y-2">
              <h3 className="font-bold text-slate-900 text-sm">📋 Inventario Completo</h3>
              <p className="text-xs text-slate-500">Visualiza la tabla del formato oficial con filtros por cada columna, exportación de datos y edición rápida de equipos.</p>
              <Link to="/radios/itadmon/listado" className="inline-block text-xs text-blue-600 hover:text-blue-700 font-bold underline">
                Ir al listado →
              </Link>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-bold text-slate-900 text-sm">🛎️ Centro de Tickets</h3>
              <p className="text-xs text-slate-500">Revisa la lista de fallas técnicas y solicitudes de mantenimiento de tu sitio. Cambia sus estados en tiempo real.</p>
              <Link to="/radios/itadmon/reportes" className="inline-block text-xs text-blue-600 hover:text-blue-700 font-bold underline">
                Ir a los tickets →
              </Link>
            </div>

            <div className="space-y-2">
              <h3 className="font-bold text-slate-900 text-sm">📤 Carga Masiva</h3>
              <p className="text-xs text-slate-500">¿Tienes un archivo Excel con cientos de radios? Súbelo directo desde la sección del listado para guardarlos de inmediato.</p>
              <Link to="/radios/itadmon/listado" className="inline-block text-xs text-blue-600 hover:text-blue-700 font-bold underline">
                Subir Excel/CSV →
              </Link>
            </div>
          </div>

        </div>
      )}
    </div>
  )
}

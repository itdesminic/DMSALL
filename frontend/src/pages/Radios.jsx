import React, { useState, useEffect } from 'react'
import api from '../services/api'
import { Link } from 'react-router-dom'

export default function Radios() {
  const [radios, setRadios] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [siteFilter, setSiteFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const fetchRadios = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await api.get('/radios', {
        params: {
          search: searchTerm,
          site: siteFilter,
          status: statusFilter
        }
      })
      setRadios(response.data)
    } catch (err) {
      console.error(err)
      setError('No se pudo cargar el inventario de radios')
    } finally {
      setLoading(false)
    }
  }

  // Trigger search on inputs change
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchRadios()
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [searchTerm, siteFilter, statusFilter])

  const exportToCsv = () => {
    const headers = [
      'Serie',
      'Marca',
      'Modelo',
      'Sitio',
      'Empresa',
      'Asignado A',
      'Canales',
      'Estado',
      'Comentarios',
      'Fecha Registro'
    ]

    const rows = radios.map((radio) => {
      const dateStr = new Date(radio.createdAt).toLocaleDateString('es-ES')
      return [
        `"${radio.serial || '-'}"`,
        `"${radio.brand || '-'}"`,
        `"${radio.model || '-'}"`,
        `"${radio.site || '-'}"`,
        `"${radio.company || '-'}"`,
        `"${radio.assignedTo || '-'}"`,
        `"${(radio.channels || '-').replace(/"/g, '""')}"`,
        `"${radio.status || '-'}"`,
        `"${(radio.comments || '-').replace(/"/g, '""')}"`,
        dateStr
      ]
    })

    const csvContent = 
      '\ufeff' + 
      [headers.join(';'), ...rows.map(e => e.join(';'))].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `reporte_radios_${new Date().toISOString().slice(0,10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getStatusPill = (status) => {
    switch (status) {
      case 'bueno':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
            Bueno
          </span>
        )
      case 'dañado':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 border border-rose-200 px-2.5 py-0.5 text-xs font-semibold text-rose-800">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500"></span>
            Dañado
          </span>
        )
      case 'fallado':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
            Fallado
          </span>
        )
      case 'golpeado':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 border border-orange-200 px-2.5 py-0.5 text-xs font-semibold text-orange-800">
            <span className="h-1.5 w-1.5 rounded-full bg-orange-500"></span>
            Golpeado
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 border border-slate-200 px-2.5 py-0.5 text-xs font-semibold text-slate-800">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-500"></span>
            Otro
          </span>
        )
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Inventario de Radios</h1>
          <p className="text-sm text-slate-500 mt-1">
            Consulta y filtra el estado actual de los equipos de radio registrados.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={exportToCsv}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm"
          >
            📥 Exportar CSV
          </button>
          <Link
            to="/radios/registro"
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 transition px-4 py-2.5 text-sm font-bold text-white shadow-sm"
          >
            ➕ Registrar Nuevo Radio
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Buscar por serie, asignado, marca o empresa</label>
          <input
            type="text"
            placeholder="Escribe número de serie, marca, modelo, empresa o responsable..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div className="w-full md:w-56">
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Filtrar por Sitio</label>
          <select
            value={siteFilter}
            onChange={(e) => setSiteFilter(e.target.value)}
            className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-blue-500 focus:ring-blue-500 bg-white"
          >
            <option value="all">Todos los sitios</option>
            <option value="La Libertad">La Libertad</option>
            <option value="Limon">Limon</option>
            <option value="EBM">EBM</option>
            <option value="Pavon">Pavon</option>
            <option value="Otro">Otro</option>
          </select>
        </div>
        <div className="w-full md:w-56">
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Filtrar por Estado</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-blue-500 focus:ring-blue-500 bg-white"
          >
            <option value="all">Todos los estados</option>
            <option value="bueno">🟢 Bueno</option>
            <option value="dañado">🔴 Dañado</option>
            <option value="fallado">🟡 Fallado</option>
            <option value="golpeado">🟠 Golpeado</option>
            <option value="otro">⚪ Otro</option>
          </select>
        </div>
      </div>

      {/* Table view */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-20 text-center text-slate-500 animate-pulse font-medium">
              Cargando inventario de radios...
            </div>
          ) : error ? (
            <div className="py-20 text-center text-rose-500 font-semibold">
              ⚠️ {error}
            </div>
          ) : (
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase">
                  <th className="px-6 py-4">Serie</th>
                  <th className="px-6 py-4">Marca / Modelo</th>
                  <th className="px-6 py-4">Sitio</th>
                  <th className="px-6 py-4">Empresa</th>
                  <th className="px-6 py-4">Asignado A</th>
                  <th className="px-6 py-4">Canales</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4">Comentarios</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {radios.length > 0 ? (
                  radios.map((radio) => (
                    <tr key={radio.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-6 py-4 font-mono text-slate-900 font-bold">{radio.serial}</td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{radio.brand}</div>
                        <div className="text-xs text-slate-500 font-normal">{radio.model}</div>
                      </td>
                      <td className="px-6 py-4">{radio.site}</td>
                      <td className="px-6 py-4">{radio.company}</td>
                      <td className="px-6 py-4 text-slate-950 font-semibold">{radio.assignedTo}</td>
                      <td className="px-6 py-4 text-xs font-normal bg-slate-50/50 rounded max-w-[120px] truncate" title={radio.channels}>
                        {radio.channels || '-'}
                      </td>
                      <td className="px-6 py-4">{getStatusPill(radio.status)}</td>
                      <td className="px-6 py-4 text-xs text-slate-500 font-normal max-w-[200px] truncate" title={radio.comments}>
                        {radio.comments || '-'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center py-16 text-slate-400">
                      <span className="text-3xl block mb-2">📻</span>
                      No se encontraron radios registrados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

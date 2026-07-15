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

  const [editingRadio, setEditingRadio] = useState(null)
  const [editFormData, setEditFormData] = useState({
    brand: '',
    model: '',
    site: '',
    company: '',
    serial: '',
    status: '',
    comments: '',
    assignedTo: '',
    channels: ''
  })
  const [updating, setUpdating] = useState(false)
  const [updateMessage, setUpdateMessage] = useState('')
  const [updateError, setUpdateError] = useState(false)

  const handleEditClick = (radio) => {
    setEditingRadio(radio)
    setEditFormData({
      brand: radio.brand || '',
      model: radio.model || '',
      site: radio.site || 'La Libertad',
      company: radio.company || '',
      serial: radio.serial || '',
      status: radio.status || 'bueno',
      comments: radio.comments || '',
      assignedTo: radio.assignedTo || '',
      channels: radio.channels || ''
    })
    setUpdateMessage('')
    setUpdateError(false)
  }

  const handleUpdateSubmit = async (e) => {
    e.preventDefault()
    setUpdating(true)
    setUpdateMessage('')
    setUpdateError(false)
    try {
      await api.put(`/radios/${editingRadio.id}`, editFormData)
      setUpdateMessage('Radio actualizado exitosamente')
      fetchRadios()
      setTimeout(() => {
        setEditingRadio(null)
      }, 1000)
    } catch (err) {
      console.error(err)
      setUpdateError(true)
      setUpdateMessage(err.response?.data?.error || 'Error al actualizar el radio')
    } finally {
      setUpdating(false)
    }
  }

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
                  <th className="px-6 py-4 text-right">Acciones</th>
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
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleEditClick(radio)}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 hover:bg-slate-50 transition px-2.5 py-1.5 text-xs font-bold text-slate-700 shadow-sm"
                        >
                          ✏️ Editar
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="text-center py-16 text-slate-400">
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

      {/* Edit Modal */}
      {editingRadio && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Editar Radio: {editingRadio.serial}</h3>
                <p className="text-xs text-slate-500 mt-0.5">Modifica los detalles del equipo en el inventario.</p>
              </div>
              <button
                onClick={() => setEditingRadio(null)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 rounded-lg hover:bg-slate-200/50 transition"
              >
                ✕
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleUpdateSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Marca</label>
                  <input
                    type="text"
                    value={editFormData.brand}
                    onChange={(e) => setEditFormData({ ...editFormData, brand: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Modelo</label>
                  <input
                    type="text"
                    value={editFormData.model}
                    onChange={(e) => setEditFormData({ ...editFormData, model: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Código de Serie (Único)</label>
                  <input
                    type="text"
                    value={editFormData.serial}
                    onChange={(e) => setEditFormData({ ...editFormData, serial: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-sm font-mono focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Empresa</label>
                  <input
                    type="text"
                    value={editFormData.company}
                    onChange={(e) => setEditFormData({ ...editFormData, company: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Sitio / Ubicación</label>
                  <select
                    value={editFormData.site}
                    onChange={(e) => setEditFormData({ ...editFormData, site: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-blue-500 focus:ring-blue-500 bg-white"
                  >
                    <option value="La Libertad">La Libertad</option>
                    <option value="Limon">Limon</option>
                    <option value="EBM">EBM</option>
                    <option value="Pavon">Pavon</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Estado del Radio</label>
                  <select
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-blue-500 focus:ring-blue-500 bg-white"
                  >
                    <option value="bueno">🟢 Bueno</option>
                    <option value="dañado">🔴 Dañado</option>
                    <option value="fallado">🟡 Fallado</option>
                    <option value="golpeado">🟠 Golpeado</option>
                    <option value="otro">⚪ Otro</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">A quién está asignado</label>
                  <input
                    type="text"
                    value={editFormData.assignedTo}
                    onChange={(e) => setEditFormData({ ...editFormData, assignedTo: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Canales requeridos</label>
                  <input
                    type="text"
                    value={editFormData.channels}
                    onChange={(e) => setEditFormData({ ...editFormData, channels: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Comentarios / Observaciones</label>
                <textarea
                  value={editFormData.comments}
                  onChange={(e) => setEditFormData({ ...editFormData, comments: e.target.value })}
                  rows="3"
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              {/* Feedback messages */}
              {updateMessage && (
                <div className={`p-4 rounded-xl border text-sm font-semibold flex items-center gap-2 ${
                  updateError ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                }`}>
                  <span>{updateError ? '❌' : '✓'}</span>
                  <span>{updateMessage}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingRadio(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-sm font-bold text-white shadow-sm transition disabled:opacity-60"
                >
                  {updating ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

import React, { useState } from 'react'
import api from '../services/api'
import { Link } from 'react-router-dom'

export default function PublicRadioSupport() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  
  // Ticket / Report Form State
  const [reportType, setReportType] = useState('failure') // 'failure', 'maintenance', 'request_new'
  const [formData, setFormData] = useState({
    radioSerial: '',
    radioIdCode: '',
    radioAssignedTo: '',
    reporterName: '',
    reporterPosition: '',
    description: '',
    site: 'La Libertad'
  })
  
  const [isOperational, setIsOperational] = useState(true)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)

  // Handle search submit
  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    setSearching(true)
    setSearchResults([])
    try {
      const response = await api.get('/radios', {
        params: { search: searchQuery }
      })
      setSearchResults(response.data)
    } catch (err) {
      console.error(err)
      alert('Error al buscar radios en el inventario')
    } finally {
      setSearching(false)
    }
  }

  // Pre-fill serial/ID from search results
  const selectRadioFromSearch = (radio) => {
    setFormData(prev => ({
      ...prev,
      radioSerial: radio.serial || '',
      radioIdCode: radio.radioIdCode || '',
      radioAssignedTo: radio.assignedTo || '',
      site: radio.site || 'La Libertad'
    }))
    // Scroll smoothly to report form
    document.getElementById('report-form')?.scrollIntoView({ behavior: 'smooth' })
  }

  // Handle report submit
  const handleReportSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setIsError(false)

    try {
      await api.post('/radios/reports', {
        type: reportType,
        isOperational: reportType === 'failure' ? isOperational : null,
        ...formData
      })
      setMessage('¡Reporte de soporte enviado con éxito! El equipo de IT de tu sitio se pondrá en contacto pronto.')
      setFormData({
        radioSerial: '',
        radioIdCode: '',
        radioAssignedTo: '',
        reporterName: '',
        reporterPosition: '',
        description: '',
        site: 'La Libertad'
      })
      setIsOperational(true)
    } catch (err) {
      console.error(err)
      setIsError(true)
      setMessage(err.response?.data?.error || 'Error al enviar el reporte de soporte.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 font-sans antialiased">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header branding */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-5 gap-4">
          <div className="flex items-center gap-3">
            <img src="/logo.jpg" alt="Logo Equinox Gold" className="h-10 object-contain rounded bg-white p-1" />
            <div>
              <h1 className="text-md font-bold text-slate-900 leading-tight">Centro de Soporte y Búsqueda de Radios</h1>
              <p className="text-xs text-slate-500 font-medium">Mina La Libertad | El Limón | EBM</p>
            </div>
          </div>
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 transition px-3.5 py-2 text-xs font-bold text-blue-600 shadow-sm border border-blue-100/50"
          >
            🔐 IT Administradores →
          </Link>
        </div>

        {/* Section 1: Search Inventory */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">🔍 Buscar Radio</h2>
            <p className="text-xs text-slate-500">Busca equipos registrados por número de serie o nombre del usuario asignado.</p>
          </div>

          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              placeholder="Escribe la serie o usuario del equipo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-900 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-medium"
              required
            />
            <button
              type="submit"
              disabled={searching}
              className="px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition"
            >
              {searching ? 'Buscando...' : 'Buscar'}
            </button>
          </form>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="border border-slate-100 rounded-xl overflow-x-auto mt-4">
              <table className="w-full text-left text-xs border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase">
                    <th className="px-4 py-3 text-center">Acción</th>
                    <th className="px-4 py-3">Serie</th>
                    <th className="px-4 py-3">Usuario</th>
                    <th className="px-4 py-3">Sitio / Mina</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {searchResults.map((radio) => (
                    <tr key={radio.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => selectRadioFromSearch(radio)}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-2.5 py-1.5 rounded-lg shadow-sm transition"
                        >
                          Reportar
                        </button>
                      </td>
                      <td className="px-4 py-3 font-mono">{radio.serial}</td>
                      <td className="px-4 py-3 text-slate-900">{radio.assignedTo || 'Sin asignar'}</td>
                      <td className="px-4 py-3">{radio.site}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {searchResults.length === 0 && searchQuery && !searching && (
            <p className="text-xs text-rose-500 font-medium">⚠️ No se encontraron radios con los criterios ingresados.</p>
          )}
        </div>

        {/* Section 2: Submit Support Report */}
        <div id="report-form" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">📋 Formulario de Soporte Técnico</h2>
            <p className="text-xs text-slate-500">Notifica fallas de señal, solicita mantenimiento preventivo/correctivo o pide la asignación de un nuevo equipo.</p>
          </div>

          {/* Selector de tipo */}
          <div className="flex gap-2 p-1 rounded-xl bg-slate-100 border border-slate-200">
            {[
              { id: 'failure', label: '🛑 Notificar Falla' },
              { id: 'maintenance', label: '🔧 Mantenimiento' },
              { id: 'request_new', label: '➕ Solicitar Radio' }
            ].map(type => (
              <button
                key={type.id}
                type="button"
                onClick={() => setReportType(type.id)}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  reportType === type.id
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleReportSubmit} className="space-y-4">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Serie (Opcional) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Serie del Radio (Opcional)</label>
                <input
                  type="text"
                  name="radioSerial"
                  placeholder="ej: 278EBJ1553"
                  value={formData.radioSerial}
                  onChange={(e) => setFormData(prev => ({ ...prev, radioSerial: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-900 text-sm focus:border-blue-500 font-mono"
                />
              </div>

              {/* Usuario o Equipo Asignado */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Usuario o Equipo Asignado</label>
                <input
                  type="text"
                  name="radioAssignedTo"
                  placeholder="ej: Supervision Mojon o Juan Perez"
                  value={formData.radioAssignedTo}
                  onChange={(e) => setFormData(prev => ({ ...prev, radioAssignedTo: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-900 text-sm focus:border-blue-500 font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Reporter Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Tu Nombre Completo</label>
                <input
                  type="text"
                  placeholder="ej: Pedro Martinez"
                  value={formData.reporterName}
                  onChange={(e) => setFormData(prev => ({ ...prev, reporterName: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-900 text-sm focus:border-blue-500 font-medium"
                  required
                />
              </div>

              {/* Reporter Position */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Tu Puesto / Cargo</label>
                <input
                  type="text"
                  placeholder="ej: Operador de Mina"
                  value={formData.reporterPosition}
                  onChange={(e) => setFormData(prev => ({ ...prev, reporterPosition: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-900 text-sm focus:border-blue-500 font-medium"
                />
              </div>
            </div>

            {/* Site Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Mina / Sitio de Trabajo</label>
              <select
                value={formData.site}
                onChange={(e) => setFormData(prev => ({ ...prev, site: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-900 text-sm focus:border-blue-500 font-semibold text-slate-800 bg-white"
                required
              >
                <option value="La Libertad">Mina La Libertad</option>
                <option value="El Limon">Mina El Limón</option>
                <option value="EBM">Mina EBM</option>
                <option value="Pavon">Mina Pavon</option>
                <option value="Siuna">Mina Siuna</option>
              </select>
            </div>

            {/* Operability (Only for failures) */}
            {reportType === 'failure' && (
              <div className="bg-slate-50 p-4 border border-slate-200 rounded-xl space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase">¿El radio sigue encendiendo y operando?</label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-750 cursor-pointer">
                    <input
                      type="radio"
                      name="isOperational"
                      checked={isOperational === true}
                      onChange={() => setIsOperational(true)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    Sí, sigue operativo (tiene una falla menor)
                  </label>
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-755 cursor-pointer">
                    <input
                      type="radio"
                      name="isOperational"
                      checked={isOperational === false}
                      onChange={() => setIsOperational(false)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    No, está inoperativo / dañado
                  </label>
                </div>
              </div>
            )}

            {/* Description of problem */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                {reportType === 'failure' ? 'Describa la Falla Técnica' : reportType === 'maintenance' ? 'Detalles del Mantenimiento Requerido' : 'Justifique la Solicitud del Nuevo Equipo'}
              </label>
              <textarea
                placeholder="Escribe de la manera más detallada posible..."
                rows="4"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-900 text-sm focus:border-blue-500 font-medium"
                required
              />
            </div>

            {/* Feedback messages */}
            {message && (
              <div className={`p-4 rounded-xl border text-xs font-semibold flex items-center gap-2.5 ${
                isError ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
              }`}>
                <span>{isError ? '❌' : '✓'}</span>
                <span>{message}</span>
              </div>
            )}

            {/* Submit */}
            <div className="flex justify-end pt-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-sm transition disabled:opacity-60"
              >
                {loading ? 'Enviando...' : 'Enviar Reporte de Soporte'}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  )
}

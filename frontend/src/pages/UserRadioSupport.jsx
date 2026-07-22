import React, { useState } from 'react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function UserRadioSupport() {
  const { user } = useAuth()
  
  // Ticket / Report Form State
  const [reportType, setReportType] = useState('failure') // 'failure', 'maintenance', 'request_new'
  const [formData, setFormData] = useState({
    radioSerial: '',
    radioAssignedTo: user?.name || '',
    reporterName: user?.name || '',
    reporterPosition: '',
    description: '',
    site: user?.site && user.site !== 'Todos' ? user.site : 'La Libertad'
  })
  
  const [isOperational, setIsOperational] = useState(true)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)

  // Handle search submit
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)

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

  const selectRadioFromSearch = (radio) => {
    setFormData(prev => ({
      ...prev,
      radioSerial: radio.serial || '',
      radioAssignedTo: radio.assignedTo || '',
      site: radio.site || 'La Libertad'
    }))
    setSearchResults([])
  }

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
      setMessage('¡Reporte enviado con éxito! El equipo de IT de tu sitio ha recibido tu caso.')
      setFormData({
        radioSerial: '',
        radioAssignedTo: user?.name || '',
        reporterName: user?.name || '',
        reporterPosition: '',
        description: '',
        site: user?.site && user.site !== 'Todos' ? user.site : 'La Libertad'
      })
      setIsOperational(true)
    } catch (err) {
      console.error(err)
      setIsError(true)
      setMessage(err.response?.data?.error || 'Error al enviar el reporte.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-4 py-2">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Soporte Técnico de Radios</h1>
        <p className="text-sm text-slate-500 mt-1">Registra fallas técnicas, solicita mantenimientos o gestiona nuevos equipos.</p>
      </div>

      {/* Section 1: Search Inventory */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div>
          <h2 className="text-md font-bold text-slate-900">🔍 Buscar tu Radio</h2>
          <p className="text-xs text-slate-500">Busca el equipo por serie o usuario asignado para pre-llenar los datos.</p>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            placeholder="Escribe la serie o usuario del equipo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm focus:border-blue-500 font-medium"
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
            <table className="w-full text-left text-xs border-collapse min-w-[500px]">
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
                        Seleccionar
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
      </div>

      {/* Section 2: Form */}
      <form onSubmit={handleReportSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
        <div>
          <h2 className="text-md font-bold text-slate-900">📋 Formulario de Soporte</h2>
          <p className="text-xs text-slate-500">Ingresa la información detallada para levantar tu ticket.</p>
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Serie del Radio (Opcional)</label>
            <input
              type="text"
              placeholder="ej: SN100293"
              value={formData.radioSerial}
              onChange={(e) => setFormData(prev => ({ ...prev, radioSerial: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm focus:border-blue-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Usuario o Equipo Asignado</label>
            <input
              type="text"
              placeholder="ej: Supervision Mojon"
              value={formData.radioAssignedTo}
              onChange={(e) => setFormData(prev => ({ ...prev, radioAssignedTo: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm focus:border-blue-500 font-bold"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Tu Nombre</label>
            <input
              type="text"
              value={formData.reporterName}
              onChange={(e) => setFormData(prev => ({ ...prev, reporterName: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm focus:border-blue-500 font-bold"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Tu Puesto / Cargo</label>
            <input
              type="text"
              placeholder="ej: Operador de Mina"
              value={formData.reporterPosition}
              onChange={(e) => setFormData(prev => ({ ...prev, reporterPosition: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm focus:border-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Sitio de Trabajo</label>
            <select
              value={formData.site}
              onChange={(e) => setFormData(prev => ({ ...prev, site: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm bg-white font-semibold"
              required
            >
              <option value="La Libertad">Mina La Libertad</option>
              <option value="El Limon">Mina El Limón</option>
              <option value="EBM">Mina EBM</option>
              <option value="Pavon">Mina Pavon</option>
              <option value="Siuna">Mina Siuna</option>
            </select>
          </div>

          {reportType === 'failure' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">¿El radio sigue encendiendo y operando?</label>
              <select
                value={isOperational ? 'yes' : 'no'}
                onChange={(e) => setIsOperational(e.target.value === 'yes')}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm bg-white font-bold"
              >
                <option value="yes">Sí, sigue operativo (falla menor)</option>
                <option value="no">No, está inoperativo / apagado / dañado</option>
              </select>
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Descripción Detallada</label>
          <textarea
            placeholder="Describe la falla, requerimiento o justificación del equipo..."
            rows="3"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm focus:border-blue-500"
            required
          />
        </div>

        {message && (
          <div className={`p-4 rounded-xl border text-xs font-semibold ${
            isError ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}>
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold p-3 text-sm shadow-sm transition"
        >
          {loading ? 'Enviando...' : 'Enviar Reporte de Soporte'}
        </button>
      </form>
    </div>
  )
}

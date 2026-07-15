import React, { useState } from 'react'
import api from '../services/api'
import { Link } from 'react-router-dom'

export default function RadioRegistry() {
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    site: 'La Libertad',
    company: '',
    serial: '',
    status: 'bueno',
    comments: '',
    assignedTo: '',
    channels: ''
  })

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setIsError(false)

    try {
      await api.post('/radios', formData)
      setMessage('Radio registrado exitosamente en el inventario.')
      setFormData({
        brand: '',
        model: '',
        site: 'La Libertad',
        company: '',
        serial: '',
        status: 'bueno',
        comments: '',
        assignedTo: '',
        channels: ''
      })
    } catch (err) {
      console.error(err)
      setIsError(true)
      setMessage(err.response?.data?.error || 'Error al registrar el equipo')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Registro de Radio de Comunicación</h1>
        <p className="text-sm text-slate-500 mt-1">
          Ingresa la información detallada para añadir el equipo al inventario.
        </p>
      </div>

      {/* Main Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Brand and Model */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Marca</label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                placeholder="Ej: Motorola"
                className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Modelo</label>
              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleChange}
                placeholder="Ej: DEP450"
                className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Serial Number & Company */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Código de Serie (Único)</label>
              <input
                type="text"
                name="serial"
                value={formData.serial}
                onChange={handleChange}
                placeholder="Ej: SN-49210B"
                className="w-full rounded-xl border border-slate-200 p-3 text-sm font-mono focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Empresa</label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                placeholder="Ej: Desminic"
                className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Site & Status */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Sitio / Ubicación</label>
              <select
                name="site"
                value={formData.site}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-blue-500 focus:ring-blue-500 bg-white"
              >
                <option value="La Libertad">La Libertad</option>
                <option value="Limon">Limon</option>
                <option value="EBM">EBM</option>
                <option value="Pavon">Pavon</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Estado del Radio</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-blue-500 focus:ring-blue-500 bg-white"
              >
                <option value="bueno">🟢 Bueno</option>
                <option value="dañado">🔴 Dañado</option>
                <option value="fallado">🟡 Fallado</option>
                <option value="golpeado">🟠 Golpeado</option>
                <option value="otro">⚪ Otro</option>
              </select>
            </div>
          </div>

          {/* Assigned To & Channels required */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">A quién está asignado</label>
              <input
                type="text"
                name="assignedTo"
                value={formData.assignedTo}
                onChange={handleChange}
                placeholder="Nombre del responsable"
                className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Canales requeridos</label>
              <input
                type="text"
                name="channels"
                value={formData.channels}
                onChange={handleChange}
                placeholder="Ej: Canal 1, Canal 3, Seguridad"
                className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Comments */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Comentarios / Observaciones</label>
            <textarea
              name="comments"
              value={formData.comments}
              onChange={handleChange}
              rows="3"
              placeholder="Detalles sobre el estado del radio o entrega..."
              className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {/* Feedback message */}
          {message && (
            <div className={`p-4 rounded-xl border text-sm font-semibold flex items-center gap-2 ${
              isError ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
            }`}>
              <span>{isError ? '❌' : '✓'}</span>
              <span>{message}</span>
            </div>
          )}

          {/* Submit button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 transition text-sm font-bold text-white shadow-sm disabled:opacity-60"
            >
              {loading ? 'Registrando...' : 'Registrar Radio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

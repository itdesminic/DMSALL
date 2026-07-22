import React, { useState } from 'react'
import api from '../services/api'
import { Link, useNavigate } from 'react-router-dom'

export default function AdminRadioNew() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    type: 'Portátil',
    site: 'La Libertad',
    company: '',
    serial: '',
    radioIdCode: '',
    status: 'bueno',
    comments: '',
    assignedTo: '',
    channels: '16',
    area: '',
    position: ''
  })
  
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setIsError(false)

    try {
      await api.post('/radios', formData)
      setMessage('Radio registrado con éxito en el inventario.')
      setTimeout(() => {
        navigate('/radios/itadmon/listado')
      }, 1500)
    } catch (err) {
      console.error(err)
      setIsError(true)
      setMessage(err.response?.data?.error || 'Error al guardar el radio.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-6 px-4 py-2">
      <div>
        <Link to="/radios/itadmon" className="text-xs text-blue-600 hover:underline font-bold">← Volver al Dashboard</Link>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">Registrar Nuevo Radio</h1>
        <p className="text-sm text-slate-500 mt-1">Agrega un equipo de radio manualmente al inventario oficial.</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold text-slate-700">
          
          <div className="grid grid-cols-2 gap-3">
            {/* Marca */}
            <div>
              <label className="block uppercase mb-1">Marca</label>
              <input
                type="text"
                name="brand"
                placeholder="ej: Motorola"
                value={formData.brand}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm font-medium"
              />
            </div>
            
            {/* Modelo */}
            <div>
              <label className="block uppercase mb-1">Modelo</label>
              <input
                type="text"
                name="model"
                placeholder="ej: DEP250"
                value={formData.model}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Tipo */}
            <div>
              <label className="block uppercase mb-1">Tipo de Radio</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm bg-white font-medium"
              >
                <option value="Portátil">Portátil</option>
                <option value="Base">Base</option>
                <option value="Repetidora">Repetidora</option>
              </select>
            </div>

            {/* Canales */}
            <div>
              <label className="block uppercase mb-1">Canales</label>
              <input
                type="text"
                name="channels"
                placeholder="ej: 16"
                value={formData.channels}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Serie */}
            <div>
              <label className="block uppercase mb-1 text-blue-600">Código de Serie (Único) *</label>
              <input
                type="text"
                name="serial"
                placeholder="ej: 278EBJ1553"
                value={formData.serial}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm font-mono text-slate-900"
                required
              />
            </div>

            {/* ID Radio */}
            <div>
              <label className="block uppercase mb-1 text-blue-600">ID de Radio (Único)</label>
              <input
                type="text"
                name="radioIdCode"
                placeholder="ej: 1017"
                value={formData.radioIdCode}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm font-mono text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block uppercase mb-1">Equipo / Usuario Asignado</label>
            <input
              type="text"
              name="assignedTo"
              placeholder="ej: SUPERVISION MOJON o Juan Pérez"
              value={formData.assignedTo}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm font-bold text-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Area */}
            <div>
              <label className="block uppercase mb-1">Área</label>
              <input
                type="text"
                name="area"
                placeholder="ej: mina"
                value={formData.area}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm font-medium"
              />
            </div>

            {/* Puesto */}
            <div>
              <label className="block uppercase mb-1">Puesto</label>
              <input
                type="text"
                name="position"
                placeholder="ej: OPERADORES DE MOJON"
                value={formData.position}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Ubicacion/Empresa */}
            <div>
              <label className="block uppercase mb-1">Ubicación / Empresa</label>
              <input
                type="text"
                name="company"
                placeholder="ej: CONEQUISA"
                value={formData.company}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm font-medium"
              />
            </div>

            {/* Sitio */}
            <div>
              <label className="block uppercase mb-1">Sitio / Mina</label>
              <select
                name="site"
                value={formData.site}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm bg-white font-medium"
                required
              >
                <option value="La Libertad">La Libertad</option>
                <option value="El Limon">El Limón</option>
                <option value="Bonanza">Bonanza</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block uppercase mb-1">Estado Operativo</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm bg-white font-bold"
              required
            >
              <option value="bueno">Bueno</option>
              <option value="mantenimiento">Mantenimiento</option>
              <option value="dañado">Dañado</option>
            </select>
          </div>

          <div>
            <label className="block uppercase mb-1">Comentarios / Notas</label>
            <textarea
              name="comments"
              placeholder="Información adicional sobre el equipo..."
              value={formData.comments}
              onChange={handleChange}
              rows="3"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm font-medium"
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
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Link
              to="/radios/itadmon/listado"
              className="px-4 py-2 border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 transition"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-sm transition disabled:opacity-60"
            >
              {loading ? 'Guardando...' : 'Registrar Radio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

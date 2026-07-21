import React, { useState } from 'react'
import api from '../services/api'
import { Link } from 'react-router-dom'

export default function PublicLodgingRequest() {
  const [formData, setFormData] = useState({
    guestName: '',
    guestEmail: '',
    days: '',
    account: ''
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Handle format of the account field: XXXX-XX-XXX-X-XXX-XXX-XXXX
  const handleAccountChange = (e) => {
    let value = e.target.value.replace(/[^0-9]/g, '') // remove non-digits
    
    // Add dashes back as they type
    const parts = []
    if (value.length > 0) parts.push(value.substring(0, 4))
    if (value.length > 4) parts.push(value.substring(4, 6))
    if (value.length > 6) parts.push(value.substring(6, 9))
    if (value.length > 9) parts.push(value.substring(9, 10))
    if (value.length > 10) parts.push(value.substring(10, 13))
    if (value.length > 13) parts.push(value.substring(13, 16))
    if (value.length > 16) parts.push(value.substring(16, 20))
    
    setFormData(prev => ({ ...prev, account: parts.join('-') }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setIsError(false)

    try {
      await api.post('/lodging/request', formData)
      setMessage('¡Solicitud de hospedaje enviada con éxito! Será revisada por el supervisor.')
      setFormData({
        guestName: '',
        guestEmail: '',
        days: '',
        account: ''
      })
    } catch (err) {
      console.error(err)
      setIsError(true)
      setMessage(err.response?.data?.error || 'Error al enviar la solicitud.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900/95 flex flex-col items-center justify-center p-4">
      {/* Container */}
      <div className="w-full max-w-lg bg-slate-800/80 border border-slate-700/60 rounded-2xl p-6 md:p-8 shadow-xl backdrop-blur-md">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3.5 mb-6 justify-center">
          <img src="/logo.jpg" alt="Logo Equinox Gold" className="h-10 object-contain rounded bg-white p-1" />
          <div className="text-left">
            <h1 className="text-sm font-bold text-white uppercase tracking-wider leading-none">Desminic LL</h1>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">Control de Servicios y Alojamiento</p>
          </div>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-xl font-extrabold text-white tracking-tight">Solicitud de Hospedaje</h2>
          <p className="text-xs text-slate-400 mt-1">Completa los campos para registrar una nueva reserva de alojamiento.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Nombre Huésped */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1.5">Nombre Completo del Huésped</label>
            <input
              type="text"
              name="guestName"
              placeholder="ej: Juan Pérez Gómez"
              value={formData.guestName}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-700 bg-slate-900/60 p-3 text-slate-100 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-slate-500"
              required
            />
          </div>

          {/* Correo Opcional */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1.5">Correo Electrónico (Opcional)</label>
            <input
              type="email"
              name="guestEmail"
              placeholder="ej: juan.perez@empresa.com"
              value={formData.guestEmail}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-700 bg-slate-900/60 p-3 text-slate-100 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-slate-500"
            />
          </div>

          {/* Días */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1.5">Cantidad de Días de Hospedaje</label>
            <input
              type="number"
              name="days"
              placeholder="ej: 3"
              value={formData.days}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-700 bg-slate-900/60 p-3 text-slate-100 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-slate-500"
              min="1"
              required
            />
          </div>

          {/* Cuenta a Cargar */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1.5">Cuenta Contable a Cargar</label>
            <input
              type="text"
              name="account"
              placeholder="ej: 5612-01-000-3-402-888-8888"
              value={formData.account}
              onChange={handleAccountChange}
              maxLength="26"
              className="w-full rounded-xl border border-slate-700 bg-slate-900/60 p-3 text-slate-100 font-mono text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-slate-500"
              required
            />
            <p className="text-[10px] text-slate-500 mt-1 font-mono">Formato requerido: XXXX-XX-XXX-X-XXX-XXX-XXXX</p>
          </div>

          {/* Feedback messages */}
          {message && (
            <div className={`p-4 rounded-xl border text-xs font-semibold flex items-center gap-2.5 ${
              isError ? 'bg-rose-950/20 border-rose-800 text-rose-400' : 'bg-emerald-950/20 border-emerald-800 text-emerald-400'
            }`}>
              <span>{isError ? '❌' : '✓'}</span>
              <span>{message}</span>
            </div>
          )}

          {/* Submit */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition disabled:opacity-60"
            >
              {loading ? 'Enviando Solicitud...' : 'Enviar Solicitud de Reserva'}
            </button>
          </div>
        </form>
        
        {/* Back Link */}
        <div className="mt-6 text-center">
          <Link to="/" className="text-xs text-slate-400 hover:text-white transition underline font-medium">
            Volver al Inicio / Iniciar Sesión
          </Link>
        </div>
      </div>
    </div>
  )
}

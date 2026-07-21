import React, { useState, useEffect } from 'react'
import api from '../services/api'
import { Link } from 'react-router-dom'

export default function PublicLodgingRequest() {
  const [formData, setFormData] = useState({
    guestName: '',
    guestEmail: '',
    startDate: '',
    endDate: '',
    account: ''
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)
  const [calculatedDays, setCalculatedDays] = useState(0)

  // Calculate days when startDate or endDate changes
  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate)
      const end = new Date(formData.endDate)
      if (start && end && end > start) {
        const diffTime = Math.abs(end - start)
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        setCalculatedDays(diffDays)
      } else {
        setCalculatedDays(0)
      }
    } else {
      setCalculatedDays(0)
    }
  }, [formData.startDate, formData.endDate])

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

    // Validation: 2 days in advance
    const minStartDate = new Date()
    minStartDate.setDate(minStartDate.getDate() + 2)
    minStartDate.setHours(0, 0, 0, 0)

    const inputStart = new Date(formData.startDate)
    inputStart.setHours(0, 0, 0, 0)

    if (inputStart < minStartDate) {
      setIsError(true)
      setMessage('Error: Debe solicitar su hospedaje con al menos 2 días de anticipación.')
      setLoading(false)
      return
    }

    try {
      await api.post('/lodging/request', formData)
      setMessage('¡Solicitud de hospedaje enviada con éxito! Será revisada por el supervisor.')
      setFormData({
        guestName: '',
        guestEmail: '',
        startDate: '',
        endDate: '',
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

  // Get tomorrow's date string + 2 days for the min attribute in date inputs
  const getMinStartDateString = () => {
    const target = new Date()
    target.setDate(target.getDate() + 2)
    return target.toISOString().split('T')[0]
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 font-sans antialiased">
      {/* Container */}
      <div className="w-full max-w-xl bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3.5 mb-6 justify-center">
          <img src="/logo.jpg" alt="Logo Equinox Gold" className="h-10 object-contain rounded bg-white p-1" />
          <div className="text-left">
            <h1 className="text-sm font-bold text-slate-900 uppercase tracking-wider leading-none">Desminic LL</h1>
            <p className="text-[10px] text-slate-500 font-medium mt-0.5">Control de Servicios y Alojamiento</p>
          </div>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Solicitud de Hospedaje</h2>
          <p className="text-xs text-slate-500 mt-1">Completa los campos para registrar una nueva reserva de alojamiento.</p>
        </div>

        {/* Warning Alert (2 days in advance required) */}
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-xs text-amber-800 flex items-start gap-2.5 mb-6">
          <span className="text-sm">⚠️</span>
          <div>
            <h4 className="font-bold">INFORMACIÓN IMPORTANTE</h4>
            <p className="mt-0.5 leading-relaxed">
              Las solicitudes de hospedaje deben realizarse con **al menos 2 días de anticipación**.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Nombre Huésped */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Nombre Completo del Huésped</label>
            <input
              type="text"
              name="guestName"
              placeholder="ej: Juan Pérez Gómez"
              value={formData.guestName}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-900 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-slate-400 font-medium"
              required
            />
          </div>

          {/* Correo Opcional */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Correo Electrónico (Opcional)</label>
            <input
              type="email"
              name="guestEmail"
              placeholder="ej: juan.perez@empresa.com"
              value={formData.guestEmail}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-900 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-slate-400 font-medium"
            />
          </div>

          {/* Date range inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Fecha de Entrada</label>
              <input
                type="date"
                name="startDate"
                min={getMinStartDateString()}
                value={formData.startDate}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-900 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-medium"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Fecha de Salida</label>
              <input
                type="date"
                name="endDate"
                min={formData.startDate || getMinStartDateString()}
                value={formData.endDate}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-900 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-medium"
                required
              />
            </div>
          </div>

          {/* Calculated days display */}
          {calculatedDays > 0 && (
            <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3.5 flex items-center justify-between text-xs text-blue-800 font-bold">
              <span>Duración de Estadía Calculada:</span>
              <span className="bg-blue-100 px-2.5 py-1 rounded-lg">💧 {calculatedDays} {calculatedDays === 1 ? 'día' : 'días'}</span>
            </div>
          )}

          {/* Cuenta a Cargar */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Cuenta Contable a Cargar</label>
            <input
              type="text"
              name="account"
              placeholder="ej: 5612-01-000-3-402-888-8888"
              value={formData.account}
              onChange={handleAccountChange}
              maxLength="26"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-900 font-mono text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-slate-400"
              required
            />
            <p className="text-[10px] text-slate-500 mt-1 font-mono">Formato requerido: XXXX-XX-XXX-X-XXX-XXX-XXXX</p>
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
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-sm transition disabled:opacity-60"
            >
              {loading ? 'Enviando Solicitud...' : 'Enviar Solicitud de Reserva'}
            </button>
          </div>
        </form>
        
        {/* Back Link */}
        <div className="mt-6 text-center">
          <Link to="/" className="text-xs text-slate-500 hover:text-slate-900 transition underline font-medium">
            Volver al Inicio / Iniciar Sesión
          </Link>
        </div>
      </div>
    </div>
  )
}

import React, { useState, useEffect } from 'react'
import api, { getBackendUrl } from '../services/api'

export default function PublicChecklists() {
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  // Email state variables
  const [emailModalId, setEmailModalId] = useState(null)
  const [recipientEmail, setRecipientEmail] = useState('')
  const [emailSending, setEmailSending] = useState(false)
  const [emailMessage, setEmailMessage] = useState('')
  const [emailError, setEmailError] = useState(false)

  const handleOpenEmailModal = (submissionId) => {
    setEmailModalId(submissionId)
    setRecipientEmail('')
    setEmailMessage('')
    setEmailError(false)
  }

  const handleSendEmail = async (e) => {
    e.preventDefault()
    setEmailSending(true)
    setEmailMessage('')
    setEmailError(false)
    try {
      const response = await api.post('/forms/share-email', {
        submissionId: emailModalId,
        recipientEmail: recipientEmail
      })
      setEmailMessage(response.data.message || 'Correo enviado con éxito.')
      setTimeout(() => {
        setEmailModalId(null)
      }, 1500)
    } catch (err) {
      console.error(err)
      setEmailError(true)
      setEmailMessage(err.response?.data?.error || 'Error al enviar el correo.')
    } finally {
      setEmailSending(false)
    }
  }

  const fetchPublicChecklists = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await api.get('/forms/public-submissions')
      setSubmissions(response.data)
    } catch (err) {
      console.error(err)
      setError('No se pudieron cargar las inspecciones recientes.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPublicChecklists()
  }, [])

  const parseAnswers = (answersString) => {
    try {
      return JSON.parse(answersString)
    } catch (e) {
      return {}
    }
  }

  const filteredSubmissions = submissions.filter((sub) => {
    const answers = parseAnswers(sub.answers)
    const term = searchTerm.toLowerCase()
    
    const plate = (answers['Placa del Vehículo'] || '').toLowerCase()
    const code = (answers['Código del Vehículo'] || '').toLowerCase()
    const driver = (answers['Inspección realizada por'] || '').toLowerCase()
    const operatorName = (sub.user && sub.user.email !== 'anonimo@empresa.local') 
      ? (sub.user.name || sub.user.email).toLowerCase() 
      : driver

    return plate.includes(term) || code.includes(term) || operatorName.includes(term)
  })

  const getStatusPill = (status) => {
    switch (status) {
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500"></span>
            Crítico
          </span>
        )
      case 'warning':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
            Precaución
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
            Correcto
          </span>
        )
    }
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Consulta de Checklists</h1>
        <p className="text-sm text-slate-500 mt-1">
          Busca y descarga las revisiones de pre-uso de camionetas.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Buscar por placa, código o conductor</label>
        <input
          type="text"
          placeholder="Escribe placa (ej: M358), código (ej: C-01) o nombre del conductor..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      {/* Table view */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-20 text-center text-slate-500 animate-pulse font-medium">
              Cargando inspecciones...
            </div>
          ) : error ? (
            <div className="py-20 text-center text-rose-500 font-semibold">
              ⚠️ {error}
            </div>
          ) : (
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase">
                  <th className="px-6 py-4">Fecha y Hora</th>
                  <th className="px-6 py-4">Vehículo</th>
                  <th className="px-6 py-4">Conductor</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredSubmissions.length > 0 ? (
                  filteredSubmissions.map((sub) => {
                    const answers = parseAnswers(sub.answers)
                    const operatorName = (sub.user && sub.user.email !== 'anonimo@empresa.local')
                      ? (sub.user.name || sub.user.email)
                      : (answers['Inspección realizada por'] || 'Operador Anónimo')

                    return (
                      <tr key={sub.id} className="hover:bg-slate-50/50 transition">
                        <td className="px-6 py-4 text-slate-800">
                          <div>{new Date(sub.createdAt).toLocaleDateString('es-ES')}</div>
                          <div className="text-xs text-slate-400 font-normal mt-0.5">
                            {new Date(sub.createdAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-900">{answers['Código del Vehículo'] || '-'}</div>
                          <div className="text-xs text-slate-400 font-normal mt-0.5">Placa: {answers['Placa del Vehículo'] || '-'}</div>
                        </td>
                        <td className="px-6 py-4 text-slate-900 font-semibold">{operatorName}</td>
                        <td className="px-6 py-4">{getStatusPill(sub.status)}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="inline-flex gap-2">
                            <a
                              href={`${getBackendUrl()}/api/forms/pdf/${sub.id}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm"
                            >
                              📄 PDF
                            </a>
                            <button
                              onClick={() => handleOpenEmailModal(sub.id)}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm"
                            >
                              ✉️ Correo
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-16 text-slate-400">
                      <span className="text-3xl block mb-2">🔍</span>
                      No se encontraron checklists registrados que coincidan con la búsqueda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Email Modal */}
      {emailModalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-250">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50">
              <div>
                <h3 className="text-md font-bold text-slate-900">Enviar Checklist por Correo</h3>
                <p className="text-xs text-slate-500 mt-0.5">El reporte PDF se adjuntará automáticamente.</p>
              </div>
              <button
                onClick={() => setEmailModalId(null)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 rounded-lg hover:bg-slate-200/50 transition"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSendEmail} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Correo Destinatario</label>
                <input
                  type="email"
                  placeholder="ejemplo@empresa.com"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              {emailMessage && (
                <div className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
                  emailError ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                }`}>
                  <span>{emailError ? '❌' : '✓'}</span>
                  <span>{emailMessage}</span>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEmailModalId(null)}
                  className="px-4 py-2 text-xs font-bold border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={emailSending}
                  className="px-4 py-2 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition disabled:opacity-60"
                >
                  {emailSending ? 'Enviando...' : 'Enviar Correo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

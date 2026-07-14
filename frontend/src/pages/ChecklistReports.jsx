import React, { useState, useEffect } from 'react'
import api, { getBackendUrl } from '../services/api'

export default function ChecklistReports() {
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const response = await api.get('/forms/submissions')
        setSubmissions(response.data)
      } catch (err) {
        console.error('Error cargando reportes:', err)
        setError('No se pudo cargar el historial de checklists.')
      } finally {
        setLoading(false)
      }
    }
    fetchSubmissions()
  }, [])

  // Parse answers JSON safely
  const parseAnswers = (answersString) => {
    try {
      return JSON.parse(answersString || '{}')
    } catch (e) {
      return {}
    }
  }

  // Filter submissions
  const filteredSubmissions = submissions.filter((sub) => {
    const answers = parseAnswers(sub.answers)
    const plate = (answers['Placa del Vehículo'] || '').toLowerCase()
    const code = (answers['Código del Vehículo'] || '').toLowerCase()
    const operator = (sub.user?.name || sub.user?.email || answers['Inspección realizada por'] || 'Anónimo').toLowerCase()
    const formName = sub.form.name.toLowerCase()
    
    const matchesSearch = 
      plate.includes(searchTerm.toLowerCase()) || 
      code.includes(searchTerm.toLowerCase()) || 
      operator.includes(searchTerm.toLowerCase()) ||
      formName.includes(searchTerm.toLowerCase())

    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'submitted' && sub.status === 'submitted') || 
      (statusFilter === 'rejected' && sub.status === 'rejected')

    return matchesSearch && matchesStatus
  })

  // Export to Excel (CSV with UTF-8 BOM and semicolon separators)
  const exportToExcel = () => {
    if (filteredSubmissions.length === 0) return

    // CSV Headers
    const headers = [
      'ID',
      'Fecha Registro',
      'Hora Registro',
      'Formulario',
      'Área',
      'Operador',
      'Placa Vehículo',
      'Código Vehículo',
      'Supervisor de Área',
      '¿Se siente Fatigado?',
      'Estado',
      'Observaciones'
    ]

    // Construct CSV Rows
    const rows = filteredSubmissions.map((sub) => {
      const answers = parseAnswers(sub.answers)
      const dateObj = new Date(sub.createdAt)
      const dateStr = dateObj.toLocaleDateString('es-ES')
      const timeStr = dateObj.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
      const operatorName = (sub.user && sub.user.email !== 'anonimo@empresa.local') ? (sub.user.name || sub.user.email) : (answers['Inspección realizada por'] || 'Operador Anónimo')
      const statusLabel = sub.status === 'rejected' ? 'RECHAZADO (Advertencia)' : 'ENVIADO (Correcto)'
      
      return [
        sub.id,
        dateStr,
        timeStr,
        `"${sub.form.name}"`,
        `"${sub.form.area?.name || 'Seguridad'}"`,
        `"${operatorName}"`,
        `"${answers['Placa del Vehículo'] || '-'}"`,
        `"${answers['Código del Vehículo'] || '-'}"`,
        `"${answers['Supervisor de área'] || '-'}"`,
        answers['¿Se siente Fatigado?'] || 'No',
        `"${statusLabel}"`,
        `"${(answers['Observaciones'] || '-').replace(/"/g, '""')}"` // Escape quotes
      ]
    })

    // Semicolon is optimal for Excel to open CSV correctly in Spanish locale
    const csvContent = 
      '\ufeff' + // UTF-8 BOM for Spanish accents/special characters
      [headers.join(';'), ...rows.map(e => e.join(';'))].join('\n')

    // Download blob
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `reporte_checklists_${new Date().toISOString().slice(0,10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-slate-500 animate-pulse text-lg font-medium">Cargando base de datos de checklists...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Historial de Checklists</h1>
          <p className="text-sm text-slate-500 mt-1">Consulta los datos capturados y descarga los reportes consolidados.</p>
        </div>
        <button
          onClick={exportToExcel}
          disabled={filteredSubmissions.length === 0}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-5 py-3 font-bold text-sm shadow-sm transition"
        >
          📥 Exportar a Excel (CSV)
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-800">
          ⚠️ {error}
        </div>
      )}

      {/* Filter bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Buscar por vehículo u operador</label>
          <input
            type="text"
            placeholder="Escribe placa, código de vehículo u operador..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div className="w-full md:w-64">
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Filtrar por Estado</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="all">Todos los registros</option>
            <option value="submitted">🟢 Solo Correctos (Enviados)</option>
            <option value="rejected">🔴 Solo Advertencias (Rechazados)</option>
          </select>
        </div>
      </div>

      {/* Table view */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase">
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Fecha y Hora</th>
                <th className="px-6 py-4">Vehículo</th>
                <th className="px-6 py-4">Operador</th>
                <th className="px-6 py-4">Fatiga</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredSubmissions.length > 0 ? (
                filteredSubmissions.map((sub) => {
                  const answers = parseAnswers(sub.answers)
                  const operatorName = (sub.user && sub.user.email !== 'anonimo@empresa.local') ? (sub.user.name || sub.user.email) : (answers['Inspección realizada por'] || 'Operador Anónimo')
                  const isRejected = sub.status === 'rejected'
                  const hasFatiga = answers['¿Se siente Fatigado?'] === 'Sí'
                  
                  return (
                    <tr key={sub.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-6 py-4 text-slate-400 font-mono">#{sub.id}</td>
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
                      <td className="px-6 py-4 text-slate-600 font-semibold">{operatorName}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          hasFatiga ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {answers['¿Se siente Fatigado?'] || 'No'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                          isRejected 
                            ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${isRejected ? 'bg-rose-500' : 'bg-emerald-500'}`}></span>
                          {isRejected ? 'Advertencia' : 'Correcto'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <a
                          href={`${getBackendUrl()}/uploads/pdfs/form-${sub.id}.pdf`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm"
                        >
                          📄 PDF
                        </a>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-slate-400">
                    <span className="text-3xl block mb-2">🔍</span>
                    No se encontraron registros que coincidan con la búsqueda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

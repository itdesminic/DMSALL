import React, { useState, useEffect } from 'react'
import api from '../services/api'

export default function UserRadioReports() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMyReports()
  }, [])

  const fetchMyReports = async () => {
    setLoading(true)
    try {
      const response = await api.get('/radios/my-reports')
      setReports(response.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const getReportTypeBadge = (type) => {
    switch (type) {
      case 'failure':
        return <span className="bg-rose-50 text-rose-700 px-2 py-0.5 rounded text-[10px] font-bold border border-rose-200">Falla Técnica</span>
      case 'maintenance':
        return <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded text-[10px] font-bold border border-amber-200">Mantenimiento</span>
      case 'request_new':
        return <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold border border-blue-200">Solicitud Equipo</span>
      default:
        return <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-bold border border-slate-200">{type}</span>
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'resolved':
        return <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full text-[10px] font-bold border border-emerald-200">Resuelto</span>
      case 'in_progress':
        return <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full text-[10px] font-bold border border-amber-200">En Atención</span>
      default:
        return <span className="bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full text-[10px] font-bold border border-rose-200">Pendiente</span>
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-4 py-2">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Seguimiento de Tickets</h1>
          <p className="text-sm text-slate-500 mt-1">Monitorea el estado y avance de las fallas o requerimientos reportados por tu usuario.</p>
        </div>
        <button
          onClick={fetchMyReports}
          className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-bold text-xs px-3.5 py-2 rounded-xl transition"
        >
          🔄 Actualizar
        </button>
      </div>

      {/* List */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-slate-500 animate-pulse font-medium">
            Cargando tus reportes...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase">
                  <th className="px-5 py-4">Fecha</th>
                  <th className="px-5 py-4">Tipo de Ticket</th>
                  <th className="px-5 py-4">Serie Radio</th>
                  <th className="px-5 py-4 w-96">Detalle Reportado</th>
                  <th className="px-5 py-4">Mina/Sitio</th>
                  <th className="px-5 py-4">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {reports.length > 0 ? (
                  reports.map((report) => (
                    <tr key={report.id} className="hover:bg-slate-50/20 transition align-top">
                      <td className="px-5 py-4 text-slate-400 whitespace-nowrap text-xs">
                        {new Date(report.createdAt).toLocaleDateString('es-ES')}
                        <span className="block text-[10px] mt-0.5">
                          {new Date(report.createdAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>
                      <td className="px-5 py-4">{getReportTypeBadge(report.type)}</td>
                      <td className="px-5 py-4 font-mono text-xs">
                        {report.radioSerial || <span className="text-slate-400 font-normal">Sin serie</span>}
                      </td>
                      <td className="px-5 py-4 text-slate-600 leading-relaxed break-words text-xs">
                        {report.description}
                      </td>
                      <td className="px-5 py-4 text-slate-800 text-xs">{report.site}</td>
                      <td className="px-5 py-4 whitespace-nowrap">{getStatusBadge(report.status)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-20 text-slate-400">
                      No has reportado ningún caso hasta el momento.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

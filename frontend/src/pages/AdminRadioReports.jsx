import React, { useState, useEffect } from 'react'
import api from '../services/api'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AdminRadioReports() {
  const { user } = useAuth()
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState(null)

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    setLoading(true)
    try {
      const response = await api.get('/radios/reports')
      setReports(response.data)
    } catch (err) {
      console.error(err)
      alert('Error al cargar reportes de soporte.')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (reportId, newStatus) => {
    setUpdatingId(reportId)
    try {
      await api.patch(`/radios/reports/${reportId}`, { status: newStatus })
      fetchReports()
    } catch (err) {
      console.error(err)
      alert('Error al cambiar el estado del reporte.')
    } finally {
      setUpdatingId(null)
    }
  }

  const getReportTypeBadge = (type) => {
    switch (type) {
      case 'failure':
        return <span className="bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded text-[10px] font-bold uppercase">🛑 Falla Técnica</span>
      case 'maintenance':
        return <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded text-[10px] font-bold uppercase">🔧 Mantenimiento</span>
      case 'change_assignment':
        return <span className="bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded text-[10px] font-bold uppercase">🔄 Reasignación</span>
      case 'request_new':
        return <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded text-[10px] font-bold uppercase">➕ Asignación Nuevo</span>
      default:
        return <span className="bg-slate-50 text-slate-700 border border-slate-200 px-2 py-0.5 rounded text-[10px] font-bold uppercase">{type}</span>
    }
  }

  const siteTitle = user?.site && user.site !== 'Todos' ? `Mina ${user.site}` : 'Todas las Minas (Global)'

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <Link to="/radios/itadmon" className="text-xs text-blue-600 hover:underline font-bold">← Volver al Dashboard</Link>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">Reportes y Tickets de Soporte</h1>
          <p className="text-sm text-slate-500 mt-1">Revisión de solicitudes y problemas reportados para {siteTitle}.</p>
        </div>
      </div>

      {/* TABLE/CARDS */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-slate-500 animate-pulse font-medium">
            Cargando tickets de soporte...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase">
                  <th className="px-5 py-4">Fecha</th>
                  <th className="px-5 py-4">Tipo</th>
                  <th className="px-5 py-4">Mina</th>
                  <th className="px-5 py-4">Referencia Radio</th>
                  <th className="px-5 py-4">Reportado Por</th>
                  <th className="px-5 py-4 w-96">Descripción del Problema</th>
                  <th className="px-5 py-4 text-center">Estado</th>
                  <th className="px-5 py-4 text-right">Gestión</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {reports.length > 0 ? (
                  reports.map((report) => (
                    <tr key={report.id} className="hover:bg-slate-50/20 transition align-top">
                      <td className="px-5 py-4 text-slate-400 whitespace-nowrap">
                        {new Date(report.createdAt).toLocaleDateString('es-ES')}
                        <span className="block text-[10px] mt-0.5">
                          {new Date(report.createdAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {getReportTypeBadge(report.type)}
                        {report.type === 'failure' && report.isOperational !== null && (
                          <div className="mt-1">
                            {report.isOperational ? (
                              <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-bold border border-emerald-150">Operativo</span>
                            ) : (
                              <span className="text-[10px] bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded font-bold border border-rose-150">No Operativo</span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4 text-slate-800">{report.site}</td>
                      <td className="px-5 py-4">
                        {report.radioSerial ? (
                          <div className="text-xs">
                            <span className="font-mono text-slate-800 block">S/N: {report.radioSerial}</span>
                            {report.radioIdCode && <span className="text-[10px] text-slate-400 font-mono block">ID: {report.radioIdCode}</span>}
                            {report.radioAssignedTo && <span className="text-[10px] text-blue-600 font-bold block mt-0.5">Asignado: {report.radioAssignedTo}</span>}
                          </div>
                        ) : (
                          <span className="text-slate-400 font-normal">Sin radio asociado</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-bold text-slate-900 block">{report.reporterName}</span>
                        <span className="text-[10px] text-slate-400 font-normal">{report.reporterPosition || 'Sin puesto'}</span>
                      </td>
                      <td className="px-5 py-4 text-slate-600 leading-relaxed break-words">
                        {report.newAssignee && (
                          <div className="mb-1.5 text-blue-700 bg-blue-50 px-2.5 py-1 rounded text-[10px] font-bold border border-blue-200 inline-block">
                            Reasignar a: <span className="text-blue-900 font-extrabold">{report.newAssignee}</span>
                          </div>
                        )}
                        <p>{report.description}</p>
                      </td>
                      <td className="px-5 py-4 text-center whitespace-nowrap">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                          report.status === 'resolved'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : report.status === 'in_progress'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                          {report.status === 'resolved' ? 'Resuelto' : report.status === 'in_progress' ? 'En Progreso' : 'Pendiente'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="inline-flex gap-1.5">
                          {report.status !== 'in_progress' && report.status !== 'resolved' && (
                            <button
                              onClick={() => handleUpdateStatus(report.id, 'in_progress')}
                              disabled={updatingId === report.id}
                              className="bg-amber-50 border border-amber-200 hover:bg-amber-100 text-amber-800 font-bold px-2.5 py-1.5 rounded-lg transition"
                            >
                              ⚡ Atender
                            </button>
                          )}
                          {report.status !== 'resolved' && (
                            <button
                              onClick={() => handleUpdateStatus(report.id, 'resolved')}
                              disabled={updatingId === report.id}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5 py-1.5 rounded-lg shadow-sm transition"
                            >
                              ✓ Resolver
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center py-20 text-slate-400">
                      <span className="text-3xl block mb-2">🛎️</span>
                      No hay reportes de soporte recibidos.
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

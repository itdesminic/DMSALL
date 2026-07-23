import React, { useState, useEffect } from 'react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function Food() {
  const { user } = useAuth()
  const [menus, setMenus] = useState([])
  const [loading, setLoading] = useState(true)
  const [confirmingId, setConfirmingId] = useState(null)
  const [notes, setNotes] = useState('')

  useEffect(() => {
    fetchMenus()
  }, [])

  const fetchMenus = async () => {
    setLoading(true)
    try {
      const response = await api.get('/food/menus')
      setMenus(response.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Get the latest published menu
  const activeMenu = menus.find(m => m.published)

  const handleConfirm = async (itemId) => {
    setConfirmingId(itemId)
    try {
      await api.post('/food/confirm', {
        menuItemId: itemId,
        notes: notes || null
      })
      alert('¡Asistencia al comedor confirmada con éxito!')
      setNotes('')
      fetchMenus()
    } catch (err) {
      console.error(err)
      alert(err.response?.data?.error || 'Error al confirmar asistencia.')
    } finally {
      setConfirmingId(null)
    }
  }

  const hasConfirmed = (confirmations) => {
    if (!confirmations || !user) return false
    return confirmations.some(c => c.userId === user.id)
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-4 py-2">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">🍽️ Menú Semanal</h1>
          <p className="text-sm text-slate-500 mt-1">Consulta los platos de la semana y confirma tu asistencia al comedor.</p>
        </div>
        <button
          onClick={fetchMenus}
          className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-bold text-xs px-3.5 py-2 rounded-xl transition"
        >
          🔄 Actualizar
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 animate-pulse font-medium">
          Cargando menú alimenticio...
        </div>
      ) : activeMenu ? (
        <div className="space-y-6">
          <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-blue-500 uppercase">Menú Activo</span>
              <h2 className="text-lg font-extrabold text-slate-800">
                Semana del {new Date(activeMenu.weekStart).toLocaleDateString('es-ES', { dateStyle: 'long' })}
              </h2>
            </div>
            <p className="text-xs text-slate-500 max-w-md">
              Asegúrate de marcar los platos a los que asistirás para que el personal de cocina pueda estimar las porciones de forma exacta.
            </p>
          </div>

          {/* Group items by day */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Let's sort activeMenu.foodMenuItems by date */}
            {activeMenu.foodMenuItems && [...activeMenu.foodMenuItems]
              .sort((a, b) => new Date(a.date) - new Date(b.date))
              .map((item) => {
                const confirmed = hasConfirmed(item.foodConfirmations)
                const itemDate = new Date(item.date)

                return (
                  <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4 hover:shadow-md/5 transition flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] font-extrabold text-slate-400 uppercase">
                            {itemDate.toLocaleDateString('es-ES', { weekday: 'long' })}
                          </span>
                          <h3 className="text-sm font-extrabold text-slate-800">
                            {itemDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                          </h3>
                        </div>
                        <span className="bg-slate-100 text-slate-700 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded">
                          {item.mealTime}
                        </span>
                      </div>

                      {/* Plate Card */}
                      <div className="bg-slate-50/50 rounded-xl p-3 border border-slate-100">
                        <span className="text-[9px] text-slate-400 font-extrabold uppercase block mb-1">Opciones y Detalles</span>
                        <p className="text-slate-850 text-xs font-bold leading-relaxed whitespace-pre-line">{item.main}</p>
                      </div>
                    </div>

                    <div className="border-t border-slate-100 pt-4 mt-2">
                      {confirmed ? (
                        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-2.5 text-center text-xs font-bold flex items-center justify-center gap-1.5">
                          ✓ Asistencia Confirmada
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <input
                            type="text"
                            placeholder="Notas opcionales (ej: sin chile, alergia)..."
                            value={confirmingId === item.id ? notes : ''}
                            onChange={(e) => {
                              setConfirmingId(item.id)
                              setNotes(e.target.value)
                            }}
                            className="w-full rounded-lg border border-slate-250 bg-slate-50 p-2 text-xs focus:bg-white transition"
                          />
                          <button
                            onClick={() => handleConfirm(item.id)}
                            disabled={confirmingId !== null && confirmingId !== item.id}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 rounded-xl shadow-sm transition"
                          >
                            {confirmingId === item.id ? 'Confirmando...' : 'Confirmar Asistencia'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
          </div>
        </div>
      ) : (
        <div className="text-center py-20 text-slate-400 text-xs font-medium border border-slate-200 rounded-2xl bg-white">
          No hay ningún menú semanal publicado y activo en este momento.
        </div>
      )}
    </div>
  )
}

import React, { useState, useEffect } from 'react'
import api from '../services/api'

export default function AdminFoodMenu() {
  const [menus, setMenus] = useState([])
  const [loading, setLoading] = useState(true)
  const [weekStart, setWeekStart] = useState('')
  const [published, setPublished] = useState(false)
  
  // 7 days of the week definition
  const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
  const mealTimes = ['Desayuno', 'Almuerzo', 'Cena']
  
  // State for the 21 pre-rendered slots (7 days * 3 times)
  const [weeklySlots, setWeeklySlots] = useState([])
  const [activeTab, setActiveTab] = useState(0) // 0 = Lunes, 6 = Domingo

  // Modal / Report State
  const [showReportMenu, setShowReportMenu] = useState(null)

  useEffect(() => {
    fetchMenus()
  }, [])

  // Auto-generate slots when weekStart changes
  useEffect(() => {
    if (!weekStart) {
      setWeeklySlots([])
      return
    }

    // Parse the date in local timezone to avoid offset shifts
    const start = new Date(weekStart + 'T00:00:00')
    const slots = []

    for (let d = 0; d < 7; d++) {
      const currentDate = new Date(start)
      currentDate.setDate(start.getDate() + d)
      const dateStr = currentDate.toISOString().split('T')[0]

      mealTimes.forEach(time => {
        slots.push({
          date: dateStr,
          dayIndex: d,
          dayLabel: daysOfWeek[d],
          mealTime: time,
          main: '',
          sides: '',
          drink: ''
        })
      })
    }
    setWeeklySlots(slots)
    setActiveTab(0) // Reset to Lunes tab
  }, [weekStart])

  const fetchMenus = async () => {
    setLoading(true)
    try {
      const response = await api.get('/food/menus')
      setMenus(response.data)
      
      // If modal report was open, refresh its data reference
      if (showReportMenu) {
        const updated = response.data.find(m => m.id === showReportMenu.id)
        if (updated) setShowReportMenu(updated)
      }
    } catch (err) {
      console.error(err)
      alert('Error al cargar menús semanales.')
    } finally {
      setLoading(false)
    }
  }

  const handleSlotChange = (dayIndex, mealTime, field, value) => {
    setWeeklySlots(prev => prev.map(slot => {
      if (slot.dayIndex === dayIndex && slot.mealTime === mealTime) {
        return { ...slot, [field]: value }
      }
      return slot
    }))
  }

  const handleCreateMenu = async (e) => {
    e.preventDefault()
    if (!weekStart) {
      alert('Por favor selecciona la fecha de inicio de semana.')
      return
    }

    // Filter slots that have at least a main dish filled
    const filledItems = weeklySlots.filter(slot => slot.main.trim() !== '')

    if (filledItems.length === 0) {
      alert('Debes ingresar al menos un plato principal en cualquier día de la semana antes de guardar.')
      return
    }

    try {
      const payload = {
        weekStart,
        published,
        items: filledItems.map(item => ({
          date: new Date(item.date + 'T00:00:00').toISOString(),
          mealTime: item.mealTime,
          main: item.main,
          sides: null,
          drink: null
        }))
      }

      await api.post('/food/menus', payload)
      alert('¡Menú semanal registrado con éxito!')
      setWeekStart('')
      setPublished(false)
      setWeeklySlots([])
      fetchMenus()
    } catch (err) {
      console.error(err)
      alert('Error al guardar el menú semanal.')
    }
  }

  // Print function
  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 py-2">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Gestión del Menú Alimenticio</h1>
        <p className="text-sm text-slate-500 mt-1">Programa el menú semanal completo de forma fácil e intuitiva.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Form: Create Menu */}
        <div className="lg:col-span-1 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
          <div>
            <h2 className="text-md font-bold text-slate-900">🗓️ Diseñar Menú de la Semana</h2>
            <p className="text-xs text-slate-500">Selecciona el inicio de semana y rellena los tiempos de comida correspondientes.</p>
          </div>

          <form onSubmit={handleCreateMenu} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Inicio de la Semana (Lunes)</label>
                <input
                  type="date"
                  value={weekStart}
                  onChange={(e) => setWeekStart(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm focus:border-blue-500 font-bold"
                  required
                />
              </div>

              <div className="flex items-center">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase cursor-pointer py-1 mt-4">
                  <input
                    type="checkbox"
                    checked={published}
                    onChange={(e) => setPublished(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                  />
                  Publicar inmediatamente para comensales
                </label>
              </div>
            </div>

            {/* Weekly slots rendering */}
            {weeklySlots.length > 0 ? (
              <div className="space-y-4 border-t border-slate-100 pt-4">
                
                {/* Day Navigation Tabs */}
                <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-xl">
                  {daysOfWeek.map((day, idx) => {
                    // Check if this day has any filled dishes
                    const hasData = weeklySlots.some(s => s.dayIndex === idx && s.main.trim() !== '')
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => setActiveTab(idx)}
                        className={`flex-1 min-w-[80px] py-2 text-xs font-bold rounded-lg transition-all relative ${
                          activeTab === idx
                            ? 'bg-white text-slate-900 shadow-sm'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        {day}
                        {hasData && (
                          <span className="absolute -top-1 -right-1 flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>

                {/* active tab content */}
                <div className="space-y-4 bg-slate-50/50 p-5 rounded-2xl border border-slate-100 animate-in fade-in duration-200">
                  <div className="border-b border-slate-200 pb-2 mb-4">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                      Menú para el día {daysOfWeek[activeTab]} ({
                        new Date(new Date(weekStart + 'T00:00:00').getTime() + activeTab * 24 * 60 * 60 * 1000).toLocaleDateString('es-ES', { dateStyle: 'medium' })
                      })
                    </h3>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Rellena los tiempos que requieras. Deja el campo vacío si no hay servicio.</p>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {mealTimes.map(time => {
                      const slot = weeklySlots.find(s => s.dayIndex === activeTab && s.mealTime === time)
                      if (!slot) return null

                      return (
                        <div key={time} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                            {time === 'Desayuno' ? '🍳 Desayuno' : time === 'Almuerzo' ? '🍲 Almuerzo' : '🌙 Cena'}
                          </span>

                          <div className="space-y-2">
                            <div>
                              <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Menú / Opciones de Comida</label>
                              <textarea
                                placeholder="ej: Opción 1: Pollo frito. Opción 2: Carne asada. Refresco: Cacao..."
                                rows="3"
                                value={slot.main}
                                onChange={(e) => handleSlotChange(activeTab, time, 'main', e.target.value)}
                                className="w-full rounded-lg border border-slate-250 p-2 text-xs focus:border-blue-500 font-semibold"
                              />
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold p-3 text-xs shadow-sm transition"
                >
                  Guardar Menú Semanal Completo
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center text-slate-400 font-medium text-xs">
                Selecciona la fecha de inicio de semana arriba para generar la plantilla de los 7 días.
              </div>
            )}
          </form>
        </div>

        {/* List: Past Menus */}
        <div className="lg:col-span-1 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4 max-h-[75vh] overflow-y-auto">
          <div>
            <h2 className="text-md font-bold text-slate-900">📋 Menús Registrados</h2>
            <p className="text-xs text-slate-500">Programaciones semanales de comida.</p>
          </div>

          {loading ? (
            <div className="py-10 text-center text-slate-400 animate-pulse">Cargando menús...</div>
          ) : (
            <div className="space-y-4">
              {menus.map((menu) => (
                <div key={menu.id} className="border border-slate-200 rounded-xl p-4 space-y-3 hover:border-slate-350 transition bg-slate-50/10">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2 flex-wrap gap-2">
                    <div>
                      <span className="text-[9px] font-bold text-slate-400">Semana del</span>
                      <h3 className="text-xs font-extrabold text-slate-800">
                        {new Date(menu.weekStart).toLocaleDateString('es-ES', { dateStyle: 'medium' })}
                      </h3>
                    </div>
                    <div className="flex gap-1.5 items-center">
                      <button
                        type="button"
                        onClick={() => setShowReportMenu(menu)}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-[9px] font-extrabold px-2 py-1 rounded shadow-sm transition uppercase"
                      >
                        📊 Reporte
                      </button>
                      <span className={`px-2 py-0.5 text-[9px] font-extrabold uppercase rounded-full border ${
                        menu.published
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-250'
                          : 'bg-slate-50 text-slate-500 border-slate-250'
                      }`}>
                        {menu.published ? 'Publicado' : 'Borrador'}
                      </span>
                    </div>
                  </div>

                  {/* List of Dishes (Compact View) */}
                  <div className="space-y-2">
                    {menu.foodMenuItems?.map((dish) => (
                      <div key={dish.id} className="p-2 border border-slate-100 rounded-lg bg-white text-xs">
                        <div className="flex justify-between items-center text-[9px] text-slate-400 font-bold">
                          <span>{new Date(dish.date).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' })}</span>
                          <span className="bg-slate-100 px-1 rounded">{dish.mealTime}</span>
                        </div>
                        <p className="font-bold text-slate-800 mt-1 whitespace-pre-line leading-relaxed truncate">{dish.main}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {menus.length === 0 && (
                <div className="text-center py-10 text-slate-400 text-xs font-medium">
                  No hay menús registrados.
                </div>
              )}
            </div>
          )}
        </div>

      </div>

      {/* Modal: Weekly Attendance Report (Print Friendly) */}
      {showReportMenu && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-5xl rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50 print:hidden">
              <div>
                <h2 className="text-lg font-bold text-slate-950">📊 Reporte de Asistencia al Comedor</h2>
                <p className="text-xs text-slate-500">Semana del {new Date(showReportMenu.weekStart).toLocaleDateString('es-ES', { dateStyle: 'long' })}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-sm transition"
                >
                  🖨️ Imprimir Reporte
                </button>
                <button
                  onClick={() => setShowReportMenu(null)}
                  className="bg-slate-200 hover:bg-slate-350 text-slate-700 font-bold text-xs px-4 py-2 rounded-xl transition"
                >
                  Cerrar
                </button>
              </div>
            </div>

            {/* Modal Body / Report Document */}
            <div className="p-6 overflow-y-auto space-y-6 print:p-0 print:overflow-visible">
              
              {/* Document Header for Printing */}
              <div className="hidden print:block text-center space-y-2 border-b border-slate-300 pb-4 mb-4">
                <h1 className="text-xl font-bold text-slate-900">REPORTE DE ASISTENCIA AL COMEDOR</h1>
                <p className="text-sm font-bold text-slate-700">Semana del: {new Date(showReportMenu.weekStart).toLocaleDateString('es-ES', { dateStyle: 'long' })}</p>
                <p className="text-xs text-slate-500">Desminic LL — Portal de Servicios Generales</p>
              </div>

              {/* Attendance Table */}
              <div className="border border-slate-200 rounded-xl overflow-x-auto print:border-slate-300 print:rounded-none">
                <table className="w-full text-left text-xs border-collapse min-w-[700px] print:min-w-0">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-300 font-bold text-slate-700 uppercase print:bg-slate-150">
                      <th className="px-4 py-3 border-r border-slate-200 w-36">Día / Fecha</th>
                      <th className="px-4 py-3 border-r border-slate-200 w-28">Tiempo</th>
                      <th className="px-4 py-3 border-r border-slate-200 w-80">Menú Programado</th>
                      <th className="px-4 py-3 border-r border-slate-200 text-center w-24">Confirmados</th>
                      <th className="px-4 py-3">Comensales y Notas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-medium text-slate-700">
                    {showReportMenu.foodMenuItems && [...showReportMenu.foodMenuItems]
                      .sort((a, b) => new Date(a.date) - new Date(b.date) || a.mealTime.localeCompare(b.mealTime))
                      .map((dish) => {
                        const dateObj = new Date(dish.date + 'T00:00:00')
                        const hasConfs = dish.foodConfirmations && dish.foodConfirmations.length > 0

                        return (
                          <tr key={dish.id} className="align-top hover:bg-slate-50/50 transition">
                            {/* Day Column */}
                            <td className="px-4 py-3 border-r border-slate-200 whitespace-nowrap bg-slate-50/20 font-bold text-slate-900">
                              {dateObj.toLocaleDateString('es-ES', { weekday: 'long' })}
                              <span className="block text-[10px] text-slate-400 font-medium mt-0.5">
                                {dateObj.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                              </span>
                            </td>

                            {/* Time Column */}
                            <td className="px-4 py-3 border-r border-slate-200">
                              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-slate-100 text-slate-700">
                                {dish.mealTime}
                              </span>
                            </td>

                            {/* Menu Column */}
                            <td className="px-4 py-3 border-r border-slate-200 whitespace-pre-line text-slate-800 leading-relaxed font-semibold">
                              {dish.main}
                            </td>

                            {/* Count Column */}
                            <td className="px-4 py-3 border-r border-slate-200 text-center">
                              <span className={`inline-block font-extrabold px-2 py-1 rounded text-xs ${
                                hasConfs ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-slate-50 text-slate-400'
                              }`}>
                                {dish.foodConfirmations?.length || 0}
                              </span>
                            </td>

                            {/* Details Column */}
                            <td className="px-4 py-3 space-y-1">
                              {hasConfs ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 print:grid-cols-1">
                                  {dish.foodConfirmations.map((conf) => (
                                    <div key={conf.id} className="p-1.5 border border-slate-100 bg-slate-50/50 rounded text-[10px] flex flex-col leading-tight print:bg-white print:border-slate-200">
                                      <span className="font-extrabold text-slate-800">{conf.user?.name}</span>
                                      {conf.notes && (
                                        <span className="text-[9px] text-rose-700 font-bold mt-0.5">
                                          ⚠️ {conf.notes}
                                        </span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-[10px] text-slate-400 italic font-semibold">Sin comensales confirmados</span>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

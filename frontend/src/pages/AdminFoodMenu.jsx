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
          sides: item.sides || null,
          drink: item.drink || null
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

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 py-2">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Gestión del Menú Alimenticio</h1>
        <p className="text-sm text-slate-500 mt-1">Programa el menú semanal completo de forma fácil e intuitiva.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Form: Create Menu */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
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
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Rellena los tiempos que requieras. Deja el plato principal vacío si no hay servicio.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                                rows="5"
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
            <p className="text-xs text-slate-500">Programaciones semanales de comida y asistencias.</p>
          </div>

          {loading ? (
            <div className="py-10 text-center text-slate-400 animate-pulse">Cargando menús...</div>
          ) : (
            <div className="space-y-4">
              {menus.map((menu) => (
                <div key={menu.id} className="border border-slate-200 rounded-xl p-4 space-y-3 hover:border-slate-350 transition bg-slate-50/10">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <div>
                      <span className="text-[9px] font-bold text-slate-400">Semana del</span>
                      <h3 className="text-xs font-extrabold text-slate-800">
                        {new Date(menu.weekStart).toLocaleDateString('es-ES', { dateStyle: 'medium' })}
                      </h3>
                    </div>
                    <span className={`px-2 py-0.5 text-[9px] font-extrabold uppercase rounded-full border ${
                      menu.published
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-slate-50 text-slate-500 border-slate-200'
                    }`}>
                      {menu.published ? 'Publicado' : 'Borrador'}
                    </span>
                  </div>

                  {/* List of Dishes and Confirmations */}
                  <div className="space-y-3">
                    {menu.foodMenuItems?.map((dish) => (
                      <div key={dish.id} className="p-2 border border-slate-100 rounded-lg bg-white text-xs">
                        <div className="flex justify-between items-center text-[9px] text-slate-400 font-bold">
                          <span>{new Date(dish.date).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' })}</span>
                          <span className="bg-slate-100 px-1 rounded">{dish.mealTime}</span>
                        </div>
                        <p className="font-bold text-slate-800 mt-1 whitespace-pre-line leading-relaxed">{dish.main}</p>
                        {dish.foodConfirmations && dish.foodConfirmations.length > 0 ? (
                          <div className="mt-2 pt-1.5 border-t border-slate-100 space-y-1">
                            <span className="text-[9px] font-extrabold text-blue-600 block">
                              Asistencias ({dish.foodConfirmations.length}):
                            </span>
                            <div className="max-h-20 overflow-y-auto space-y-0.5">
                              {dish.foodConfirmations.map((conf) => (
                                <div key={conf.id} className="text-[9px] text-slate-600 bg-slate-50 rounded p-1 flex flex-col font-medium leading-tight">
                                  <span className="font-extrabold text-slate-700">{conf.user?.name}</span>
                                  {conf.notes && <span className="text-[8px] text-slate-400 italic">Nota: {conf.notes}</span>}
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="mt-1 pt-1 border-t border-slate-50 text-[8px] text-slate-400 italic">
                            Sin confirmaciones
                          </div>
                        )}
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
    </div>
  )
}

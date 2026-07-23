import React, { useState, useEffect } from 'react'
import api from '../services/api'

export default function AdminFoodMenu() {
  const [menus, setMenus] = useState([])
  const [loading, setLoading] = useState(true)
  const [weekStart, setWeekStart] = useState('')
  const [published, setPublished] = useState(false)
  
  // New menu items state
  const [newItems, setNewItems] = useState([
    { date: '', mealTime: 'Almuerzo', main: '', sides: '', drink: '' }
  ])

  // Selected menu details/confirmations modal
  const [selectedMenu, setSelectedMenu] = useState(null)
  const [confirmations, setConfirmations] = useState([])
  const [loadingConfirmations, setLoadingConfirmations] = useState(false)

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
      alert('Error al cargar menús semanales.')
    } finally {
      setLoading(false)
    }
  }

  const handleAddItem = () => {
    setNewItems([...newItems, { date: '', mealTime: 'Almuerzo', main: '', sides: '', drink: '' }])
  }

  const handleRemoveItem = (index) => {
    const updated = [...newItems]
    updated.splice(index, 1)
    setNewItems(updated)
  }

  const handleItemChange = (index, field, value) => {
    const updated = [...newItems]
    updated[index][field] = value
    setNewItems(updated)
  }

  const handleCreateMenu = async (e) => {
    e.preventDefault()
    if (!weekStart) {
      alert('Por favor selecciona la fecha de inicio de semana.')
      return
    }

    // Validation
    const invalidItem = newItems.find(item => !item.date || !item.main)
    if (invalidItem) {
      alert('Todos los platos del menú deben tener asignada una fecha y un plato principal.')
      return
    }

    try {
      const payload = {
        weekStart,
        published,
        items: newItems.map(item => ({
          date: new Date(item.date).toISOString(),
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
      setNewItems([{ date: '', mealTime: 'Almuerzo', main: '', sides: '', drink: '' }])
      fetchMenus()
    } catch (err) {
      console.error(err)
      alert('Error al guardar el menú semanal.')
    }
  }

  const handleTogglePublish = async (menuId, currentStatus) => {
    try {
      // In this simple API, we could create an update endpoint, but let's see: we can mock it or let the user see it's published.
      // Wait! Since we don't have a patch endpoint in foodRoutes, we can create one or we can just show that it was published.
      // Wait, is there a patch/put endpoint for menus in backend? No! Only list and create.
      // Let's create an edit endpoint in the backend for FoodMenu if we need it, or we can add it to foodController.js!
      // Yes! Let's implement togglePublish endpoint in foodController/foodRoutes to make it fully functional!
    } catch (err) {
      console.error(err)
    }
  }

  const viewConfirmations = async (menu) => {
    setSelectedMenu(menu)
    setLoadingConfirmations(true)
    setConfirmations([])
    try {
      // We need an endpoint to view confirmations for a menu.
      // Let's check: does one exist? No. We can build it in the backend!
      // Let's get confirmations for the items of this menu.
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingConfirmations(false)
    }
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 py-2">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Gestión del Menú Alimenticio</h1>
        <p className="text-sm text-slate-500 mt-1">Crea, edita y publica menús diarios para comedores y comensales en el sitio.</p>
      </div>

      {/* Main Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Form: Create Menu */}
        <div className="lg:col-span-1 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
          <div>
            <h2 className="text-md font-bold text-slate-900">🍲 Registrar Nuevo Menú</h2>
            <p className="text-xs text-slate-500">Registra los platos para los diferentes días de la semana.</p>
          </div>

          <form onSubmit={handleCreateMenu} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Inicio de la Semana</label>
              <input
                type="date"
                value={weekStart}
                onChange={(e) => setWeekStart(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm focus:border-blue-500 font-semibold"
                required
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase cursor-pointer py-1">
                <input
                  type="checkbox"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                Publicar inmediatamente
              </label>
            </div>

            {/* Menu Items Array */}
            <div className="space-y-4 border-t border-slate-100 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500 uppercase">Platos del Menú</span>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[10px] px-2.5 py-1.5 rounded-lg border border-blue-200 transition"
                >
                  ＋ Añadir Plato
                </button>
              </div>

              {newItems.map((item, idx) => (
                <div key={idx} className="p-3 border border-slate-150 rounded-xl bg-slate-50/50 space-y-2.5 relative">
                  {newItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="absolute top-2 right-2 text-slate-400 hover:text-rose-600 font-bold text-xs"
                    >
                      ✕
                    </button>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">Fecha</label>
                      <input
                        type="date"
                        value={item.date}
                        onChange={(e) => handleItemChange(idx, 'date', e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white p-1.5 text-xs focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">Tiempo</label>
                      <select
                        value={item.mealTime}
                        onChange={(e) => handleItemChange(idx, 'mealTime', e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white p-1.5 text-xs"
                      >
                        <option value="Desayuno">🍳 Desayuno</option>
                        <option value="Almuerzo">🍲 Almuerzo</option>
                        <option value="Cena">🌙 Cena</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Plato Principal</label>
                    <input
                      type="text"
                      placeholder="ej: Carne asada o Sopa de Pollo"
                      value={item.main}
                      onChange={(e) => handleItemChange(idx, 'main', e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white p-1.5 text-xs"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">Acompañamientos</label>
                      <input
                        type="text"
                        placeholder="ej: Arroz, ensalada"
                        value={item.sides}
                        onChange={(e) => handleItemChange(idx, 'sides', e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white p-1.5 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">Bebida</label>
                      <input
                        type="text"
                        placeholder="ej: Fresco de cacao"
                        value={item.drink}
                        onChange={(e) => handleItemChange(idx, 'drink', e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white p-1.5 text-xs"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold p-3 text-xs shadow-sm transition"
            >
              Guardar Menú Semanal
            </button>
          </form>
        </div>

        {/* List: Past Menus */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div>
            <h2 className="text-md font-bold text-slate-900">📋 Menús Registrados</h2>
            <p className="text-xs text-slate-500">Historial de programaciones semanales de comida.</p>
          </div>

          {loading ? (
            <div className="py-20 text-center text-slate-400 animate-pulse">Cargando menús...</div>
          ) : (
            <div className="space-y-4">
              {menus.map((menu) => (
                <div key={menu.id} className="border border-slate-200 rounded-xl p-4 space-y-3 hover:border-slate-350 transition">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-xs font-bold text-slate-400">Semana del</span>
                      <h3 className="text-sm font-extrabold text-slate-800">
                        {new Date(menu.weekStart).toLocaleDateString('es-ES', { dateStyle: 'long' })}
                      </h3>
                    </div>
                    <div>
                      <span className={`px-2.5 py-1 text-[10px] font-extrabold uppercase rounded-full border ${
                        menu.published
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-250'
                          : 'bg-slate-50 text-slate-500 border-slate-250'
                      }`}>
                        {menu.published ? 'Publicado' : 'Borrador'}
                      </span>
                    </div>
                  </div>

                  {/* Grid of Dishes */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {menu.foodMenuItems?.map((dish) => (
                      <div key={dish.id} className="p-2.5 border border-slate-100 rounded-lg bg-slate-50/30 text-xs">
                        <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold">
                          <span>{new Date(dish.date).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' })}</span>
                          <span className="bg-slate-100 px-1 rounded">{dish.mealTime}</span>
                        </div>
                        <p className="font-bold text-slate-800 mt-1">{dish.main}</p>
                        {(dish.sides || dish.drink) && (
                          <p className="text-[10px] text-slate-500 mt-0.5 font-medium truncate">
                            {dish.sides} {dish.drink ? `· ${dish.drink}` : ''}
                          </p>
                        )}
                        {dish.foodConfirmations && dish.foodConfirmations.length > 0 ? (
                          <div className="mt-2 pt-2 border-t border-slate-100 space-y-1">
                            <span className="text-[9px] font-extrabold text-blue-600 block">
                              Asistencias ({dish.foodConfirmations.length}):
                            </span>
                            <div className="max-h-24 overflow-y-auto space-y-0.5 pr-1">
                              {dish.foodConfirmations.map((conf) => (
                                <div key={conf.id} className="text-[9px] text-slate-600 bg-white border border-slate-100 rounded p-1 flex flex-col font-medium leading-tight">
                                  <span className="font-extrabold text-slate-800">{conf.user?.name}</span>
                                  {conf.notes && <span className="text-[8px] text-slate-400 italic">Nota: {conf.notes}</span>}
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="mt-2 pt-1 border-t border-slate-100 text-[9px] text-slate-400 font-semibold italic text-center">
                            Sin confirmaciones
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {menus.length === 0 && (
                <div className="text-center py-20 text-slate-400 text-xs font-medium">
                  No se han registrado menús semanales de comida.
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

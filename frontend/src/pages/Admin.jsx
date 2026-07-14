import React, { useState, useEffect } from 'react'
import api from '../services/api'

export default function Admin() {
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingVehicle, setEditingVehicle] = useState(null)
  
  // Form fields state
  const [formData, setFormData] = useState({
    plate: '',
    employee: '',
    position: '',
    area: '',
    type: '',
    usage: 'Operación',
    company: 'DESMINIC'
  })
  
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState('')

  // Load vehicles
  const fetchVehicles = async () => {
    try {
      const response = await api.get('/vehicles')
      setVehicles(response.data)
    } catch (err) {
      console.error('Error al cargar camionetas:', err)
      setError('No se pudo cargar el listado de camionetas de la base de datos.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVehicles()
  }, [])

  // Open modal for adding
  const handleAddClick = () => {
    setEditingVehicle(null)
    setFormData({
      plate: '',
      employee: '',
      position: '',
      area: '',
      type: '',
      usage: 'Operación',
      company: 'DESMINIC'
    })
    setFormError('')
    setFormSuccess('')
    setIsModalOpen(true)
  }

  // Open modal for editing
  const handleEditClick = (v) => {
    setEditingVehicle(v)
    setFormData({
      plate: v.plate || '',
      employee: v.employee || '',
      position: v.position || '',
      area: v.area || '',
      type: v.type || '',
      usage: v.usage || 'Operación',
      company: v.company || 'DESMINIC'
    })
    setFormError('')
    setFormSuccess('')
    setIsModalOpen(true)
  }

  // Form input change
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  // Submit create or edit
  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')
    setFormSuccess('')

    if (!formData.plate.trim()) {
      setFormError('La placa del vehículo es obligatoria.')
      return
    }

    try {
      if (editingVehicle) {
        // Update
        const response = await api.put(`/vehicles/${editingVehicle.id}`, formData)
        setFormSuccess('Camioneta modificada exitosamente.')
        fetchVehicles()
        setTimeout(() => setIsModalOpen(false), 1200)
      } else {
        // Create
        const response = await api.post('/vehicles', formData)
        setFormSuccess('Camioneta agregada exitosamente al catálogo.')
        fetchVehicles()
        setTimeout(() => setIsModalOpen(false), 1200)
      }
    } catch (err) {
      console.error('Error al guardar vehículo:', err)
      setFormError(err.response?.data?.error || 'Ocurrió un error al guardar los datos.')
    }
  }

  // Delete vehicle
  const handleDeleteClick = async (id, plate) => {
    if (!window.confirm(`¿Está seguro de eliminar la camioneta con placa ${plate}?`)) {
      return
    }

    try {
      await api.delete(`/vehicles/${id}`)
      fetchVehicles()
    } catch (err) {
      console.error('Error al eliminar camioneta:', err)
      alert(err.response?.data?.error || 'No se pudo eliminar el vehículo.')
    }
  }

  // Filter list
  const filteredVehicles = vehicles.filter(v => {
    const term = searchTerm.toLowerCase()
    return (
      (v.plate || '').toLowerCase().includes(term) ||
      (v.employee || '').toLowerCase().includes(term) ||
      (v.type || '').toLowerCase().includes(term) ||
      (v.area || '').toLowerCase().includes(term) ||
      (v.company || '').toLowerCase().includes(term)
    )
  })

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-slate-500 animate-pulse text-lg font-medium">Cargando catálogo de vehículos...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Administración de Camionetas</h1>
          <p className="text-sm text-slate-500 mt-1">Administra el inventario de camionetas autorizadas en Mina La Libertad.</p>
        </div>
        <button
          onClick={handleAddClick}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 font-bold text-sm shadow-sm transition"
        >
          ➕ Agregar Camioneta
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-800">
          ⚠️ {error}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Buscador rápido</label>
        <input
          type="text"
          placeholder="Buscar por placa, conductor, modelo, área o empresa..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      {/* Table view */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase">
                <th className="px-6 py-4">No.</th>
                <th className="px-6 py-4">Placa</th>
                <th className="px-6 py-4">Vehículo</th>
                <th className="px-6 py-4">Supervisor / Chofer</th>
                <th className="px-6 py-4">Área / Gerencia</th>
                <th className="px-6 py-4">Uso / Empresa</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredVehicles.length > 0 ? (
                filteredVehicles.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4 text-slate-400 font-mono">#{String(v.no || v.id).padStart(2, '0')}</td>
                    <td className="px-6 py-4 font-bold text-blue-600 font-mono text-sm">
                      <span className="bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">{v.plate}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-900">
                      <div className="font-semibold">{v.type || '-'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-800 font-semibold">{v.employee || '-'}</div>
                      <div className="text-xs text-slate-400 font-normal mt-0.5">{v.position || '-'}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{v.area || '-'}</td>
                    <td className="px-6 py-4">
                      <div className="text-xs font-bold text-slate-700">{v.usage || '-'}</div>
                      <div className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5">{v.company || '-'}</div>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleEditClick(v)}
                        className="inline-flex items-center gap-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-600 transition px-3 py-1.5 text-xs font-bold text-slate-700"
                      >
                        ✏️ Editar
                      </button>
                      <button
                        onClick={() => handleDeleteClick(v.id, v.plate)}
                        className="inline-flex items-center gap-1 rounded-lg bg-rose-50 hover:bg-rose-100 hover:text-rose-700 transition px-3 py-1.5 text-xs font-bold text-rose-600"
                      >
                        🗑️ Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-slate-400">
                    <span className="text-3xl block mb-2">🔍</span>
                    No se encontraron camionetas en el inventario.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CRUD Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="border-b border-slate-100 bg-slate-50 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">
                {editingVehicle ? `Modificar Camioneta ${formData.plate}` : 'Agregar Nueva Camioneta'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 flex-1">
              {formError && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-800">
                  ⚠️ {formError}
                </div>
              )}
              {formSuccess && (
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800">
                  ✔️ {formSuccess}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Placa del Vehículo *</label>
                  <input
                    type="text"
                    name="plate"
                    placeholder="M399611"
                    value={formData.plate}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tipo / Modelo</label>
                  <input
                    type="text"
                    name="type"
                    placeholder="Hilux"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nombre del Conductor / Supervisor</label>
                <input
                  type="text"
                  name="employee"
                  placeholder="Luis Carrillo"
                  value={formData.employee}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Cargo</label>
                <input
                  type="text"
                  name="position"
                  placeholder="Gerente de planta Proceso"
                  value={formData.position}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Gerencia / Área</label>
                <input
                  type="text"
                  name="area"
                  placeholder="Planta de proceso"
                  value={formData.area}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Uso</label>
                  <select
                    name="usage"
                    value={formData.usage}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-blue-500"
                  >
                    <option value="Operación">Operación</option>
                    <option value="Personal">Personal</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Empresa</label>
                  <select
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-blue-500"
                  >
                    <option value="DESMINIC">DESMINIC</option>
                    <option value="LEASING">LEASING</option>
                  </select>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 text-sm font-bold shadow-sm transition"
                >
                  {editingVehicle ? 'Guardar Cambios' : 'Registrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

import React, { useState, useEffect } from 'react'
import api, { getBackendUrl } from '../services/api'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AdminRadioList() {
  const { user } = useAuth()
  const [radios, setRadios] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Column Specific Filters State
  const [filters, setFilters] = useState({
    brand: 'all',
    model: 'all',
    type: 'all',
    serial: '',
    radioIdCode: '',
    channels: '',
    assignedTo: '',
    area: 'all',
    position: 'all',
    company: 'all',
    site: 'all',
    status: 'all'
  })

  // Dropdown list values (for filter select boxes)
  const [dropdowns, setDropdowns] = useState({
    brands: [],
    models: [],
    types: [],
    areas: [],
    positions: [],
    companies: [],
    sites: []
  })

  // Edit modal state
  const [editingRadio, setEditingRadio] = useState(null)
  const [editFormData, setEditFormData] = useState({
    brand: '',
    model: '',
    type: '',
    site: '',
    company: '',
    serial: '',
    radioIdCode: '',
    status: '',
    comments: '',
    assignedTo: '',
    channels: '',
    area: '',
    position: ''
  })
  const [saving, setSaving] = useState(false)

  // Bulk Upload state
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [bulkFileText, setBulkFileText] = useState('')
  const [bulkUploading, setBulkUploading] = useState(false)
  const [bulkMessage, setBulkMessage] = useState('')

  useEffect(() => {
    fetchRadios()
  }, [filters])

  const fetchRadios = async () => {
    setLoading(true)
    setError('')
    try {
      // Build query params
      const params = {}
      Object.keys(filters).forEach(key => {
        if (filters[key] !== 'all' && filters[key] !== '') {
          params[key] = filters[key]
        }
      })

      // Enforce IT admin site segmentation locally if not 'Todos'
      if (user?.role === 'admin' && user?.site && user.site !== 'Todos') {
        params.site = user.site
      }

      const response = await api.get('/radios', { params })
      setRadios(response.data)

      // Dynamically populate dropdown values for filters based on all loaded items if dropdowns not set
      if (dropdowns.brands.length === 0) {
        const allRes = await api.get('/radios')
        const allItems = allRes.data
        setDropdowns({
          brands: [...new Set(allItems.map(i => i.brand).filter(Boolean))],
          models: [...new Set(allItems.map(i => i.model).filter(Boolean))],
          types: [...new Set(allItems.map(i => i.type).filter(Boolean))],
          areas: [...new Set(allItems.map(i => i.area).filter(Boolean))],
          positions: [...new Set(allItems.map(i => i.position).filter(Boolean))],
          companies: [...new Set(allItems.map(i => i.company).filter(Boolean))],
          sites: [...new Set(allItems.map(i => i.site).filter(Boolean))]
        })
      }
    } catch (err) {
      console.error(err)
      setError('Error al cargar la lista de radios.')
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }))
  }

  const handleEditClick = (radio) => {
    setEditingRadio(radio)
    setEditFormData({
      brand: radio.brand || '',
      model: radio.model || '',
      type: radio.type || '',
      site: radio.site || 'La Libertad',
      company: radio.company || '',
      serial: radio.serial || '',
      radioIdCode: radio.radioIdCode || '',
      status: radio.status || 'bueno',
      comments: radio.comments || '',
      assignedTo: radio.assignedTo || '',
      channels: radio.channels || '',
      area: radio.area || '',
      position: radio.position || ''
    })
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.put(`/radios/${editingRadio.id}`, editFormData)
      alert('Radio actualizado con éxito')
      setEditingRadio(null)
      fetchRadios()
    } catch (err) {
      console.error(err)
      alert(err.response?.data?.error || 'Error al actualizar el radio.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (radioId) => {
    if (!window.confirm('¿Está seguro de que desea eliminar este radio permanentemente del inventario?')) return
    try {
      await api.delete(`/radios/${radioId}`)
      alert('Radio eliminado')
      fetchRadios()
    } catch (err) {
      console.error(err)
      alert('Error al eliminar el radio')
    }
  }

  // Parse CSV client-side
  const handleCsvFileSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      setBulkFileText(event.target.result)
    }
    reader.readAsText(file)
  }

  const handleBulkUploadSubmit = async (e) => {
    e.preventDefault()
    if (!bulkFileText.trim()) {
      alert('Por favor selecciona o escribe datos en formato CSV.')
      return
    }

    setBulkUploading(true)
    setBulkMessage('')

    try {
      const separator = bulkFileText.includes(';') ? ';' : ','
      const lines = bulkFileText.split('\n').map(l => l.trim()).filter(Boolean)
      if (lines.length < 2) {
        alert('El archivo no contiene suficientes filas.')
        setBulkUploading(false)
        return
      }

      // Headers mapping
      const headers = lines[0].split(separator).map(h => h.trim().toUpperCase())
      const items = lines.slice(1).map(line => {
        const cols = line.split(separator).map(c => c.trim())
        const item = {}
        
        headers.forEach((header, index) => {
          const val = cols[index] || ''
          if (header === 'MARCA') item.brand = val
          else if (header === 'MODELO') item.model = val
          else if (header === 'TIPO') item.type = val
          else if (header === 'SERIE') item.serial = val
          else if (header === 'ID RADIO' || header === 'IDRADIO' || header === 'ID') item.radioIdCode = val
          else if (header === 'CANALES') item.channels = val
          else if (header === 'EQUIPO/USUARIO' || header === 'USUARIO' || header === 'EQUIPO') item.assignedTo = val
          else if (header === 'AREA') item.area = val
          else if (header === 'PUESTO') item.position = val
          else if (header === 'UBICACION/EMPRESA' || header === 'EMPRESA') item.company = val
          else if (header === 'SITIO') item.site = val
          else if (header === 'ESTADO') item.status = val
          else if (header === 'COMENTARIOS') item.comments = val
        })
        return item
      }).filter(item => item.serial)

      const response = await api.post('/radios/bulk', { items })
      setBulkMessage(`Éxito: ${response.data.message} (Creados: ${response.data.created}, Actualizados: ${response.data.updated})`)
      fetchRadios()
      setTimeout(() => {
        setShowBulkModal(false)
        setBulkFileText('')
        setBulkMessage('')
      }, 2000)
    } catch (err) {
      console.error(err)
      setBulkMessage(err.response?.data?.error || 'Error al procesar la carga masiva en el servidor.')
    } finally {
      setBulkUploading(false)
    }
  }

  // Export visible inventory to CSV
  const handleExportCsv = () => {
    const separator = ','
    const headers = ['MARCA', 'MODELO', 'TIPO', 'SERIE', 'ID RADIO', 'CANALES', 'EQUIPO/USUARIO', 'AREA', 'PUESTO', 'UBICACION/EMPRESA', 'SITIO', 'ESTADO', 'COMENTARIOS']
    
    const rows = radios.map(r => [
      r.brand || '',
      r.model || '',
      r.type || '',
      r.serial || '',
      r.radioIdCode || '',
      r.channels || '',
      r.assignedTo || '',
      r.area || '',
      r.position || '',
      r.company || '',
      r.site || '',
      r.status || 'bueno',
      r.comments || ''
    ])

    const csvContent = [
      headers.join(separator),
      ...rows.map(row => row.map(val => `"${val.toString().replace(/"/g, '""')}"`).join(separator))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `Inventario_Radios_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <Link to="/radios/itadmon" className="text-xs text-blue-600 hover:underline font-bold">← Volver al Dashboard</Link>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">Inventario Oficial de Radios</h1>
          <p className="text-sm text-slate-500 mt-1">Inventario detallado de equipos y su estado de asignación.</p>
        </div>
        <div className="inline-flex gap-2">
          <button
            onClick={() => setShowBulkModal(true)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition"
          >
            📤 Subir Excel/CSV
          </button>
          <button
            onClick={handleExportCsv}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition"
          >
            📥 Exportar CSV
          </button>
          <Link
            to="/radios/itadmon/new"
            className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition"
          >
            ➕ Nuevo Radio
          </Link>
        </div>
      </div>

      {/* FILTER PANEL */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Filtros Avanzados por Columna</h3>
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 text-xs">
          {/* Marca */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Marca</label>
            <select
              value={filters.brand}
              onChange={(e) => handleFilterChange('brand', e.target.value)}
              className="w-full rounded-lg border-slate-200 bg-slate-50 p-2 font-medium"
            >
              <option value="all">Todas</option>
              {dropdowns.brands.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>

          {/* Modelo */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Modelo</label>
            <select
              value={filters.model}
              onChange={(e) => handleFilterChange('model', e.target.value)}
              className="w-full rounded-lg border-slate-200 bg-slate-50 p-2 font-medium"
            >
              <option value="all">Todos</option>
              {dropdowns.models.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          {/* Tipo */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Tipo</label>
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="w-full rounded-lg border-slate-200 bg-slate-50 p-2 font-medium"
            >
              <option value="all">Todos</option>
              {dropdowns.types.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {/* Serie */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Serie</label>
            <input
              type="text"
              placeholder="Filtro serie..."
              value={filters.serial}
              onChange={(e) => handleFilterChange('serial', e.target.value)}
              className="w-full rounded-lg border-slate-200 bg-slate-50 p-2 font-medium"
            />
          </div>

          {/* ID Radio */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">ID Radio</label>
            <input
              type="text"
              placeholder="Filtro ID..."
              value={filters.radioIdCode}
              onChange={(e) => handleFilterChange('radioIdCode', e.target.value)}
              className="w-full rounded-lg border-slate-200 bg-slate-50 p-2 font-medium"
            />
          </div>

          {/* Canales */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Canales</label>
            <input
              type="text"
              placeholder="Canales..."
              value={filters.channels}
              onChange={(e) => handleFilterChange('channels', e.target.value)}
              className="w-full rounded-lg border-slate-200 bg-slate-50 p-2 font-medium"
            />
          </div>

          {/* Usuario */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Usuario</label>
            <input
              type="text"
              placeholder="Filtro usuario..."
              value={filters.assignedTo}
              onChange={(e) => handleFilterChange('assignedTo', e.target.value)}
              className="w-full rounded-lg border-slate-200 bg-slate-50 p-2 font-medium"
            />
          </div>

          {/* Area */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Área</label>
            <select
              value={filters.area}
              onChange={(e) => handleFilterChange('area', e.target.value)}
              className="w-full rounded-lg border-slate-200 bg-slate-50 p-2 font-medium"
            >
              <option value="all">Todas</option>
              {dropdowns.areas.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>

          {/* Puesto */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Puesto</label>
            <select
              value={filters.position}
              onChange={(e) => handleFilterChange('position', e.target.value)}
              className="w-full rounded-lg border-slate-200 bg-slate-50 p-2 font-medium"
            >
              <option value="all">Todos</option>
              {dropdowns.positions.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          {/* Empresa */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Empresa</label>
            <select
              value={filters.company}
              onChange={(e) => handleFilterChange('company', e.target.value)}
              className="w-full rounded-lg border-slate-200 bg-slate-50 p-2 font-medium"
            >
              <option value="all">Todas</option>
              {dropdowns.companies.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Sitio */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Sitio</label>
            <select
              value={filters.site}
              disabled={user?.role === 'admin' && user?.site && user.site !== 'Todos'}
              onChange={(e) => handleFilterChange('site', e.target.value)}
              className="w-full rounded-lg border-slate-200 bg-slate-50 p-2 font-medium disabled:opacity-60"
            >
              <option value="all">Todos</option>
              {dropdowns.sites.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Estado */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Estado</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full rounded-lg border-slate-200 bg-slate-50 p-2 font-medium"
            >
              <option value="all">Todos</option>
              <option value="bueno">Bueno</option>
              <option value="mantenimiento">Mantenimiento</option>
              <option value="dañado">Dañado</option>
            </select>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-slate-500 animate-pulse font-medium">
            Filtrando inventario de radios...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase">
                  <th className="px-4 py-3.5">ITEM</th>
                  <th className="px-4 py-3.5">Marca</th>
                  <th className="px-4 py-3.5">Modelo</th>
                  <th className="px-4 py-3.5">Tipo</th>
                  <th className="px-4 py-3.5">Serie</th>
                  <th className="px-4 py-3.5">ID Radio</th>
                  <th className="px-4 py-3.5">Canales</th>
                  <th className="px-4 py-3.5">Equipo/Usuario</th>
                  <th className="px-4 py-3.5">Área</th>
                  <th className="px-4 py-3.5">Puesto</th>
                  <th className="px-4 py-3.5">Empresa</th>
                  <th className="px-4 py-3.5">Sitio</th>
                  <th className="px-4 py-3.5">Estado</th>
                  <th className="px-4 py-3.5 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {radios.length > 0 ? (
                  radios.map((radio, idx) => (
                    <tr key={radio.id} className="hover:bg-slate-50/20 transition">
                      <td className="px-4 py-3 text-slate-400">{idx + 1}</td>
                      <td className="px-4 py-3 text-slate-900 font-bold">{radio.brand || '-'}</td>
                      <td className="px-4 py-3">{radio.model || '-'}</td>
                      <td className="px-4 py-3">{radio.type || '-'}</td>
                      <td className="px-4 py-3 font-mono">{radio.serial}</td>
                      <td className="px-4 py-3 font-mono font-semibold text-slate-800">{radio.radioIdCode || '-'}</td>
                      <td className="px-4 py-3">{radio.channels || '-'}</td>
                      <td className="px-4 py-3 text-slate-950 font-bold">{radio.assignedTo || 'Sin asignar'}</td>
                      <td className="px-4 py-3">{radio.area || '-'}</td>
                      <td className="px-4 py-3">{radio.position || '-'}</td>
                      <td className="px-4 py-3">{radio.company || '-'}</td>
                      <td className="px-4 py-3 text-slate-500">{radio.site || '-'}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase ${
                          radio.status === 'bueno'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : radio.status === 'mantenimiento'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                          {radio.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex gap-2">
                          <button
                            onClick={() => handleEditClick(radio)}
                            className="bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold px-2 py-1 rounded-lg border border-blue-100/50 transition"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(radio.id)}
                            className="border border-slate-200 hover:bg-rose-50 hover:text-rose-600 text-slate-500 font-bold px-2 py-1 rounded-lg transition"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="14" className="text-center py-20 text-slate-400">
                      <span className="text-3xl block mb-2">📻</span>
                      No se encontraron radios que coincidan con los filtros.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* EDIT MODAL */}
      {editingRadio && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50">
              <div>
                <h3 className="text-md font-bold text-slate-900">Editar Radio</h3>
                <p className="text-xs text-slate-500 mt-0.5">Modifica los detalles del radio Serie: {editingRadio.serial}</p>
              </div>
              <button
                onClick={() => setEditingRadio(null)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 rounded-lg hover:bg-slate-200/50 transition"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Marca</label>
                  <input
                    type="text"
                    value={editFormData.brand}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, brand: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Modelo</label>
                  <input
                    type="text"
                    value={editFormData.model}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, model: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tipo</label>
                  <input
                    type="text"
                    placeholder="ej: Portátil, Base"
                    value={editFormData.type}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Canales</label>
                  <input
                    type="text"
                    value={editFormData.channels}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, channels: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">ID Radio</label>
                  <input
                    type="text"
                    value={editFormData.radioIdCode}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, radioIdCode: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Serie</label>
                  <input
                    type="text"
                    value={editFormData.serial}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, serial: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-sm font-semibold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Usuario / Equipo</label>
                  <input
                    type="text"
                    value={editFormData.assignedTo}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, assignedTo: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-sm font-bold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Área</label>
                  <input
                    type="text"
                    value={editFormData.area}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, area: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Puesto</label>
                  <input
                    type="text"
                    value={editFormData.position}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, position: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Ubicación / Empresa</label>
                  <input
                    type="text"
                    value={editFormData.company}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, company: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Sitio / Mina</label>
                  <select
                    value={editFormData.site}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, site: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-sm bg-white"
                    required
                  >
                    <option value="La Libertad">La Libertad</option>
                    <option value="El Limon">El Limón</option>
                    <option value="Bonanza">Bonanza</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Estado</label>
                <select
                  value={editFormData.status}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-sm bg-white font-bold"
                  required
                >
                  <option value="bueno">Bueno</option>
                  <option value="mantenimiento">Mantenimiento</option>
                  <option value="dañado">Dañado</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Comentarios</label>
                <textarea
                  value={editFormData.comments}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, comments: e.target.value }))}
                  rows="2"
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingRadio(null)}
                  className="px-4 py-2 text-xs font-bold border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition"
                >
                  {saving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BULK UPLOAD MODAL */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50">
              <div>
                <h3 className="text-md font-bold text-slate-900">Carga Masiva de Radios</h3>
                <p className="text-xs text-slate-500 mt-0.5">Sube un archivo CSV con las columnas oficiales.</p>
              </div>
              <button
                onClick={() => setShowBulkModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 rounded-lg hover:bg-slate-200/50 transition"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleBulkUploadSubmit} className="p-6 space-y-4">
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:bg-slate-50 transition cursor-pointer relative">
                <span className="text-3xl block mb-2">📄</span>
                <span className="text-xs font-bold text-slate-700 block">Selecciona un archivo .csv</span>
                <span className="text-[10px] text-slate-400 block mt-1">El archivo debe contener la cabecera: MARCA,MODELO,TIPO,SERIE,ID RADIO,CANALES,USUARIO,AREA,PUESTO,EMPRESA,SITIO,ESTADO</span>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleCsvFileSelect}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>

              {bulkFileText && (
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 max-h-32 overflow-y-auto font-mono text-[9px] text-slate-500">
                  <span className="font-bold text-slate-700 block mb-1">Archivo cargado temporalmente (Previsualización):</span>
                  {bulkFileText.split('\n').slice(0, 4).join('\n')}...
                </div>
              )}

              {bulkMessage && (
                <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50 text-blue-800 text-xs font-semibold">
                  {bulkMessage}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowBulkModal(false)}
                  className="px-4 py-2 text-xs font-bold border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={bulkUploading || !bulkFileText}
                  className="px-4 py-2 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition disabled:opacity-60"
                >
                  {bulkUploading ? 'Subiendo...' : 'Procesar y Cargar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}

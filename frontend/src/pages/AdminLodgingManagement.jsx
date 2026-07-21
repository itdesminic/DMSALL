import React, { useState, useEffect } from 'react'
import api from '../services/api'

export default function AdminLodgingManagement() {
  const [activeTab, setActiveTab] = useState('requests') // 'requests' or 'setup'
  
  // Data states
  const [requests, setRequests] = useState([])
  const [locations, setLocations] = useState([])
  const [loadingRequests, setLoadingRequests] = useState(true)
  const [loadingSetup, setLoadingSetup] = useState(true)

  // Creation states (Setup tab)
  const [newLocName, setNewLocName] = useState('')
  const [newLocAddr, setNewLocAddr] = useState('')
  const [selectedLocId, setSelectedLocId] = useState('')
  const [newRoomNum, setNewRoomNum] = useState('')
  const [newRoomBeds, setNewRoomBeds] = useState(1)

  // Approval modal state
  const [approveRequest, setApproveRequest] = useState(null) // holds request object
  const [approveLocId, setApproveLocId] = useState('')
  const [approveRoomId, setApproveRoomId] = useState('')
  
  // Feedback states
  const [actionError, setActionError] = useState('')
  const [actionSuccess, setActionSuccess] = useState('')

  // Filtering states
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [locationFilter, setLocationFilter] = useState('all')

  useEffect(() => {
    fetchRequests()
    fetchLocations()
  }, [])

  const fetchRequests = async () => {
    setLoadingRequests(true)
    try {
      const response = await api.get('/lodging/requests')
      setRequests(response.data)
    } catch (err) {
      console.error(err)
      setActionError('Error al cargar solicitudes de hospedaje.')
    } finally {
      setLoadingRequests(false)
    }
  }

  const fetchLocations = async () => {
    setLoadingSetup(true)
    try {
      const response = await api.get('/lodging/locations')
      setLocations(response.data)
      if (response.data.length > 0 && !selectedLocId) {
        setSelectedLocId(response.data[0].id.toString())
      }
    } catch (err) {
      console.error(err)
      setActionError('Error al cargar ubicaciones de hospedaje.')
    } finally {
      setLoadingSetup(false)
    }
  }

  // 1. Submit approval
  const handleApproveSubmit = async (e) => {
    e.preventDefault()
    if (!approveLocId || !approveRoomId) {
      alert('Por favor selecciona un local y una habitación.')
      return
    }

    try {
      await api.patch(`/lodging/requests/${approveRequest.id}`, {
        status: 'approved',
        locationId: parseInt(approveLocId, 10),
        roomId: parseInt(approveRoomId, 10)
      })
      setActionSuccess(`Solicitud del huésped ${approveRequest.guestName} aprobada con éxito.`)
      setApproveRequest(null)
      fetchRequests()
      fetchLocations()
    } catch (err) {
      console.error(err)
      alert(err.response?.data?.error || 'Error al aprobar la solicitud.')
    }
  }

  // 2. Reject request
  const handleReject = async (requestId) => {
    if (!window.confirm('¿Está seguro de que desea rechazar esta solicitud de hospedaje?')) return
    try {
      await api.patch(`/lodging/requests/${requestId}`, {
        status: 'rejected'
      })
      setActionSuccess('Solicitud rechazada con éxito.')
      fetchRequests()
    } catch (err) {
      console.error(err)
      alert('Error al rechazar la solicitud.')
    }
  }

  // 2.5 Cancel request
  const handleCancel = async (requestId) => {
    if (!window.confirm('¿Está seguro de que desea cancelar esta solicitud de hospedaje? La habitación asignada volverá a estar disponible.')) return
    try {
      await api.patch(`/lodging/requests/${requestId}`, {
        status: 'cancelled'
      })
      setActionSuccess('Solicitud cancelada con éxito.')
      fetchRequests()
      fetchLocations()
    } catch (err) {
      console.error(err)
      alert('Error al cancelar la solicitud.')
    }
  }

  // 3. Create location
  const handleCreateLocation = async (e) => {
    e.preventDefault()
    try {
      await api.post('/lodging/locations', {
        name: newLocName,
        address: newLocAddr
      })
      setActionSuccess('Local de hospedaje creado con éxito.')
      setNewLocName('')
      setNewLocAddr('')
      fetchLocations()
    } catch (err) {
      console.error(err)
      alert('Error al crear el local de hospedaje.')
    }
  }

  // 4. Create room
  const handleCreateRoom = async (e) => {
    e.preventDefault()
    if (!selectedLocId) {
      alert('Por favor selecciona un local de hospedaje.')
      return
    }
    try {
      await api.post('/lodging/rooms', {
        number: newRoomNum,
        locationId: parseInt(selectedLocId, 10),
        beds: parseInt(newRoomBeds, 10),
        status: 'available'
      })
      setActionSuccess(`Habitación ${newRoomNum} agregada con éxito.`)
      setNewRoomNum('')
      setNewRoomBeds(1)
      fetchLocations()
    } catch (err) {
      console.error(err)
      alert('Error al crear la habitación.')
    }
  }

  // 5. Delete location
  const handleDeleteLocation = async (locId) => {
    if (!window.confirm('¿Eliminar este local de hospedaje? Se borrarán también todas sus habitaciones asociadas.')) return
    try {
      await api.delete(`/lodging/locations/${locId}`)
      setActionSuccess('Local eliminado con éxito.')
      fetchLocations()
    } catch (err) {
      console.error(err)
      alert('Error al eliminar el local.')
    }
  }

  // 6. Delete room
  const handleDeleteRoom = async (roomId) => {
    if (!window.confirm('¿Desea eliminar esta habitación?')) return
    try {
      await api.delete(`/lodging/rooms/${roomId}`)
      setActionSuccess('Habitación eliminada con éxito.')
      fetchLocations()
    } catch (err) {
      console.error(err)
      alert('Error al eliminar la habitación.')
    }
  }

  // Helper: Find rooms list for approval selector based on chosen location
  const approvalLocSelected = locations.find(l => l.id.toString() === approveLocId)
  const approvalAvailableRooms = approvalLocSelected 
    ? approvalLocSelected.rooms.filter(r => r.status === 'available') 
    : []

  const filteredRequests = requests.filter((req) => {
    const matchSearch =
      req.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.account.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (req.guestEmail && req.guestEmail.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchStatus = statusFilter === 'all' || req.status === statusFilter

    const matchLocation =
      locationFilter === 'all' ||
      (req.locationId && req.locationId.toString() === locationFilter)

    return matchSearch && matchStatus && matchLocation
  })

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Gestión de Hospedajes y Comidas</h1>
          <p className="text-sm text-slate-500 mt-1">Administra el inventario de hoteles, habitaciones y autorizaciones contables.</p>
        </div>
        <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'requests'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            📋 Solicitudes
          </button>
          <button
            onClick={() => setActiveTab('setup')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'setup'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            🏨 Locales y Cuartos
          </button>
        </div>
      </div>

      {/* Success/Error Alerts */}
      {actionSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-sm font-semibold text-emerald-800 flex justify-between items-center">
          <span>✓ {actionSuccess}</span>
          <button onClick={() => setActionSuccess('')} className="text-emerald-500 hover:text-emerald-700">✕</button>
        </div>
      )}

      {actionError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-sm font-semibold text-rose-800 flex justify-between items-center">
          <span>❌ {actionError}</span>
          <button onClick={() => setActionError('')} className="text-rose-500 hover:text-rose-700">✕</button>
        </div>
      )}

      {activeTab === 'requests' ? (
        /* TAB 1: LODGING REQUESTS LIST */
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-100 p-5 bg-slate-50/50">
            <h2 className="text-md font-bold text-slate-900">Solicitudes de Alojamiento</h2>
            <p className="text-xs text-slate-500 mt-0.5">Autoriza o rechaza reservaciones asignando habitaciones libres en tiempo real.</p>
          </div>
          
          {/* Filters section */}
          <div className="p-5 border-b border-slate-100 bg-slate-50/30 grid gap-4 sm:grid-cols-3">
            {/* Search Input */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Buscar Huésped / Cuenta</label>
              <input
                type="text"
                placeholder="Nombre o cuenta..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs focus:border-blue-500 font-medium"
              />
            </div>
            
            {/* Status Filter */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Estado</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs focus:border-blue-500 font-bold text-slate-700"
              >
                <option value="all">Todos los Estados</option>
                <option value="pending">Pendientes</option>
                <option value="approved">Aprobados</option>
                <option value="rejected">Rechazados</option>
                <option value="cancelled">Cancelados</option>
              </select>
            </div>

            {/* Hotel/Location Filter */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Hotel / Local</label>
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs focus:border-blue-500 font-bold text-slate-700"
              >
                <option value="all">Todos los Hoteles</option>
                {locations.map(loc => (
                  <option key={loc.id} value={loc.id}>{loc.name}</option>
                ))}
              </select>
            </div>
          </div>
          
          {loadingRequests ? (
            <div className="py-20 text-center text-slate-500 animate-pulse font-medium">
              Cargando solicitudes de hospedaje...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase">
                    <th className="px-6 py-4">Huésped</th>
                    <th className="px-6 py-4">Estancia</th>
                    <th className="px-6 py-4">Cuenta Cargada</th>
                    <th className="px-6 py-4">Asignación</th>
                    <th className="px-6 py-4">Estado</th>
                    <th className="px-6 py-4 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredRequests.length > 0 ? (
                    filteredRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-slate-50/30 transition">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-900">{req.guestName}</div>
                          <div className="text-xs text-slate-400 font-normal mt-0.5">{req.guestEmail || 'Sin correo'}</div>
                        </td>
                        <td className="px-6 py-4 text-slate-800 text-xs">
                          <div className="font-semibold">
                            {req.startDate ? new Date(req.startDate).toLocaleDateString('es-ES') : ''} al{' '}
                            {req.endDate ? new Date(req.endDate).toLocaleDateString('es-ES') : ''}
                          </div>
                          <div className="text-slate-500 mt-0.5">({req.days} {req.days === 1 ? 'día' : 'días'})</div>
                          <div className="text-[10px] text-slate-400 font-normal">
                            Creado: {new Date(req.createdAt).toLocaleDateString('es-ES')}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-slate-600">{req.account}</td>
                        <td className="px-6 py-4">
                          {req.status === 'approved' && req.location ? (
                            <div className="text-xs">
                              <span className="font-bold text-slate-800 block">🏨 {req.location.name}</span>
                              <span className="text-slate-500 font-normal">Cuarto: #{req.room?.number} ({req.room?.beds} {req.room?.beds === 1 ? 'cama' : 'camas'})</span>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 font-normal">Sin asignar</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase tracking-wider ${
                            req.status === 'approved'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : req.status === 'rejected'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : req.status === 'cancelled'
                              ? 'bg-slate-100 text-slate-650 border-slate-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {req.status === 'approved' ? 'Aprobado' : req.status === 'rejected' ? 'Rechazado' : req.status === 'cancelled' ? 'Cancelado' : 'Pendiente'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {req.status === 'pending' && (
                            <div className="inline-flex gap-2">
                              <button
                                onClick={() => {
                                  setApproveRequest(req)
                                  setApproveLocId(locations[0]?.id?.toString() || '')
                                  setApproveRoomId('')
                                }}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition shadow-sm"
                              >
                                ✓ Aprobar
                              </button>
                              <button
                                onClick={() => handleReject(req.id)}
                                className="border border-slate-200 hover:bg-rose-50 hover:text-rose-600 text-slate-600 font-bold text-xs px-3 py-1.5 rounded-lg transition"
                              >
                                ✕ Rechazar
                              </button>
                            </div>
                          )}
                          {req.status === 'approved' && (
                            <button
                              onClick={() => handleCancel(req.id)}
                              className="border border-rose-250 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs px-3 py-1.5 rounded-lg transition"
                            >
                              ✕ Cancelar
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center py-20 text-slate-400">
                        <span className="text-3xl block mb-2">🏨</span>
                        No hay solicitudes de hospedaje registradas.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* TAB 2: LOCATIONS & ROOMS SETUP */
        <div className="grid gap-6 md:grid-cols-2">
          {/* Create Lodging Location Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
            <div>
              <h2 className="text-md font-bold text-slate-900">Agregar Local / Hotel</h2>
              <p className="text-xs text-slate-500 mt-0.5">Registra una nueva sede física para recibir huéspedes.</p>
            </div>
            
            <form onSubmit={handleCreateLocation} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nombre del Local</label>
                <input
                  type="text"
                  placeholder="ej: Hotel Principal La Libertad"
                  value={newLocName}
                  onChange={(e) => setNewLocName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Dirección / Comentarios (Opcional)</label>
                <input
                  type="text"
                  placeholder="ej: Entrada Principal Crimea"
                  value={newLocAddr}
                  onChange={(e) => setNewLocAddr(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-blue-500"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 rounded-xl transition shadow-sm"
              >
                ➕ Registrar Local
              </button>
            </form>
          </div>

          {/* Create Room Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
            <div>
              <h2 className="text-md font-bold text-slate-900">Agregar Habitación / Cuarto</h2>
              <p className="text-xs text-slate-500 mt-0.5">Agrega una habitación dentro de una sede registrada.</p>
            </div>

            <form onSubmit={handleCreateRoom} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Seleccionar Local</label>
                <select
                  value={selectedLocId}
                  onChange={(e) => setSelectedLocId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-blue-500 bg-white font-semibold"
                  required
                >
                  <option value="" disabled>Selecciona un hotel...</option>
                  {locations.map(loc => (
                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">No. Habitación</label>
                  <input
                    type="text"
                    placeholder="ej: 101, A-2"
                    value={newRoomNum}
                    onChange={(e) => setNewRoomNum(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Camas</label>
                  <input
                    type="number"
                    value={newRoomBeds}
                    onChange={(e) => setNewRoomBeds(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-blue-500"
                    min="1"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 rounded-xl transition shadow-sm"
              >
                ➕ Registrar Habitación
              </button>
            </form>
          </div>

          {/* List of Locations and Rooms (Full width) */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:col-span-2 space-y-6">
            <div>
              <h2 className="text-md font-bold text-slate-900">Ubicaciones y Cuartos Existentes</h2>
              <p className="text-xs text-slate-500 mt-0.5">Revisa y administra el catálogo de locales y habitaciones de la empresa.</p>
            </div>

            {loadingSetup ? (
              <div className="py-10 text-center text-slate-500 animate-pulse font-medium">
                Cargando sedes y habitaciones...
              </div>
            ) : (
              <div className="space-y-4">
                {locations.length > 0 ? (
                  locations.map(loc => (
                    <div key={loc.id} className="border border-slate-200 rounded-2xl p-5 bg-slate-50/50 space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
                        <div>
                          <h3 className="font-bold text-slate-800 text-md">🏨 {loc.name}</h3>
                          <p className="text-xs text-slate-400 font-medium mt-0.5">{loc.address || 'Sin dirección'}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteLocation(loc.id)}
                          className="text-xs font-bold text-rose-500 hover:text-rose-700 hover:bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-100 transition"
                        >
                          Eliminar Local
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-3 pt-1">
                        {loc.rooms && loc.rooms.length > 0 ? (
                          loc.rooms.map(room => (
                            <div
                              key={room.id}
                              className={`relative group px-3.5 py-2.5 rounded-xl border flex items-center justify-between gap-6 ${
                                room.status === 'occupied'
                                  ? 'bg-rose-50 border-rose-200 text-rose-800'
                                  : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                              }`}
                            >
                              <div>
                                <span className="text-xs font-bold block">Cuarto #{room.number}</span>
                                <span className="text-[10px] opacity-75 font-semibold">🛏️ {room.beds} {room.beds === 1 ? 'cama' : 'camas'}</span>
                              </div>
                              <button
                                onClick={() => handleDeleteRoom(room.id)}
                                className="h-5 w-5 bg-black/5 hover:bg-rose-600 hover:text-white rounded-full flex items-center justify-center text-[10px] font-bold text-slate-500 transition"
                                title="Eliminar Habitación"
                              >
                                ✕
                              </button>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-slate-400 font-medium italic">No hay habitaciones registradas en este local.</p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center py-10 text-xs font-semibold text-slate-400">No hay locales de hospedaje configurados.</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Approve Request Modal */}
      {approveRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50">
              <div>
                <h3 className="text-md font-bold text-slate-900">Aprobar Solicitud de Hospedaje</h3>
                <p className="text-xs text-slate-500 mt-0.5">Asigna una habitación libre para {approveRequest.guestName}.</p>
              </div>
              <button
                onClick={() => setApproveRequest(null)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 rounded-lg hover:bg-slate-200/50 transition"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleApproveSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">1. Seleccionar Local</label>
                <select
                  value={approveLocId}
                  onChange={(e) => {
                    setApproveLocId(e.target.value)
                    setApproveRoomId('') // Reset room on loc change
                  }}
                  className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-blue-500 bg-white font-semibold text-slate-800"
                  required
                >
                  <option value="" disabled>Selecciona un hotel/local...</option>
                  {locations.map(loc => (
                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">2. Seleccionar Habitación Disponible</label>
                <select
                  value={approveRoomId}
                  onChange={(e) => setApproveRoomId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-blue-500 bg-white font-semibold text-slate-800"
                  required
                >
                  <option value="">Selecciona una habitación disponible...</option>
                  {approvalAvailableRooms.map(room => (
                    <option key={room.id} value={room.id}>
                      Habitación #{room.number} ({room.beds} {room.beds === 1 ? 'cama' : 'camas'})
                    </option>
                  ))}
                </select>
                {approveLocId && approvalAvailableRooms.length === 0 && (
                  <p className="text-[10px] text-rose-500 mt-1 font-semibold">⚠️ No hay habitaciones disponibles ("available") en este local.</p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setApproveRequest(null)}
                  className="px-4 py-2 text-xs font-bold border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition"
                >
                  Confirmar Aprobación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

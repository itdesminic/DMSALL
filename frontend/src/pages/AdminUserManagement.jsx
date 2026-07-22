import React, { useState, useEffect } from 'react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function AdminUserManagement() {
  const { user: loggedInUser } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionSuccess, setActionSuccess] = useState('')
  const [actionError, setActionError] = useState('')

  // Create User state
  const [showAddModal, setShowAddModal] = useState(false)
  const [newUserData, setNewUserData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
    site: 'La Libertad'
  })
  const [submittingNew, setSubmittingNew] = useState(false)

  // Edit User state
  const [editingUser, setEditingUser] = useState(null)
  const [editUserData, setEditUserData] = useState({
    name: '',
    email: '',
    password: '', // optional to change
    role: 'user',
    site: 'La Libertad'
  })
  const [submittingEdit, setSubmittingEdit] = useState(false)

  const sites = ['La Libertad', 'El Limon', 'EBM', 'Pavon', 'Siuna', 'Todos']

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const response = await api.get('/users')
      setUsers(response.data)
    } catch (err) {
      console.error(err)
      setActionError('Error al cargar la lista de usuarios.')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async (e) => {
    e.preventDefault()
    setSubmittingNew(true)
    setActionSuccess('')
    setActionError('')
    try {
      await api.post('/users', newUserData)
      setActionSuccess(`Usuario ${newUserData.email} creado con éxito.`)
      setNewUserData({
        name: '',
        email: '',
        password: '',
        role: 'user',
        site: 'La Libertad'
      })
      setShowAddModal(false)
      fetchUsers()
    } catch (err) {
      console.error(err)
      setActionError(err.response?.data?.error || 'Error al crear el usuario.')
    } finally {
      setSubmittingNew(false)
    }
  }

  const handleEditClick = (user) => {
    setEditingUser(user)
    setEditUserData({
      name: user.name || '',
      email: user.email || '',
      password: '', // leave empty to not change
      role: user.role || 'user',
      site: user.site || 'La Libertad'
    })
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    setSubmittingEdit(true)
    setActionSuccess('')
    setActionError('')
    try {
      const dataToSend = { ...editUserData }
      if (!dataToSend.password || dataToSend.password.trim() === '') {
        delete dataToSend.password
      }
      await api.put(`/users/${editingUser.id}`, dataToSend)
      setActionSuccess(`Usuario ${editingUser.email} actualizado con éxito.`)
      setEditingUser(null)
      fetchUsers()
    } catch (err) {
      console.error(err)
      setActionError(err.response?.data?.error || 'Error al actualizar el usuario.')
    } finally {
      setSubmittingEdit(false)
    }
  }

  const handleDeleteUser = async (userId, userEmail) => {
    if (loggedInUser && loggedInUser.id === userId) {
      alert('No puedes eliminar tu propio usuario de la consola.')
      return
    }
    if (!window.confirm(`¿Está seguro de que desea eliminar permanentemente al usuario ${userEmail}?`)) return
    
    setActionSuccess('')
    setActionError('')
    try {
      await api.delete(`/users/${userId}`)
      setActionSuccess(`Usuario ${userEmail} eliminado con éxito.`)
      fetchUsers()
    } catch (err) {
      console.error(err)
      setActionError('Error al eliminar el usuario.')
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Gestión de Usuarios y Roles</h1>
          <p className="text-sm text-slate-500 mt-1">Administra los usuarios del sistema, sus roles (Admin / Usuario) y sus sitios de trabajo asignados.</p>
        </div>
        <div>
          <button
            onClick={() => setShowAddModal(true)}
            className="rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition"
          >
            👥 Agregar Usuario
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

      {/* LIST OF USERS */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 p-5 bg-slate-50/50">
          <h2 className="text-md font-bold text-slate-900 font-sans">Usuarios Registrados</h2>
          <p className="text-xs text-slate-500 mt-0.5">Listado completo de cuentas del sistema con sus accesos locales y globales.</p>
        </div>

        {loading ? (
          <div className="py-20 text-center text-slate-500 animate-pulse font-medium">
            Cargando usuarios...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase">
                  <th className="px-6 py-4">Nombre</th>
                  <th className="px-6 py-4">Correo Electrónico</th>
                  <th className="px-6 py-4">Rol</th>
                  <th className="px-6 py-4">Sitio Autorizado</th>
                  <th className="px-6 py-4">Fecha Registro</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {users.length > 0 ? (
                  users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/30 transition">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">{u.name || 'Sin nombre'}</div>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs">{u.email}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase tracking-wider ${
                          u.role === 'admin'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-slate-50 text-slate-700 border-slate-200'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`font-semibold ${u.site === 'Todos' ? 'text-blue-600' : 'text-slate-800'}`}>
                          {u.site || 'Sin sitio asignado'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-400">
                        {new Date(u.createdAt).toLocaleDateString('es-ES')}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex gap-2">
                          <button
                            onClick={() => handleEditClick(u)}
                            className="bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold text-xs px-3 py-1.5 rounded-lg transition"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u.id, u.email)}
                            disabled={loggedInUser && loggedInUser.id === u.id}
                            className="border border-slate-200 hover:bg-rose-50 hover:text-rose-600 text-slate-500 font-bold text-xs px-3 py-1.5 rounded-lg transition disabled:opacity-40"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-20 text-slate-400">
                      No se encontraron usuarios registrados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50">
              <div>
                <h3 className="text-md font-bold text-slate-900">Agregar Nuevo Usuario</h3>
                <p className="text-xs text-slate-500 mt-0.5">Registra una nueva cuenta e indica su rol y sitio.</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 rounded-lg hover:bg-slate-200/50 transition"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Nombre Completo</label>
                <input
                  type="text"
                  placeholder="ej: Juan Perez"
                  value={newUserData.name}
                  onChange={(e) => setNewUserData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Correo Electrónico</label>
                <input
                  type="email"
                  placeholder="ej: juan.perez@empresa.com"
                  value={newUserData.email}
                  onChange={(e) => setNewUserData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm focus:border-blue-500 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Contraseña</label>
                <input
                  type="password"
                  placeholder="Escribe la contraseña..."
                  value={newUserData.password}
                  onChange={(e) => setNewUserData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm focus:border-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Rol de Cuenta</label>
                  <select
                    value={newUserData.role}
                    onChange={(e) => setNewUserData(prev => ({ ...prev, role: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm bg-white font-bold"
                  >
                    <option value="user">User (Usuario)</option>
                    <option value="admin">Admin (Administrador)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Sitio de IT Autorizado</label>
                  <select
                    value={newUserData.site}
                    onChange={(e) => setNewUserData(prev => ({ ...prev, site: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm bg-white font-semibold"
                  >
                    {sites.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-bold border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submittingNew}
                  className="px-4 py-2 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition"
                >
                  {submittingNew ? 'Guardando...' : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50">
              <div>
                <h3 className="text-md font-bold text-slate-900">Editar Usuario</h3>
                <p className="text-xs text-slate-500 mt-0.5">Modifica los accesos del usuario {editingUser.email}</p>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 rounded-lg hover:bg-slate-200/50 transition"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Nombre Completo</label>
                <input
                  type="text"
                  value={editUserData.name}
                  onChange={(e) => setEditUserData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Correo Electrónico</label>
                <input
                  type="email"
                  value={editUserData.email}
                  onChange={(e) => setEditUserData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm focus:border-blue-500 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Contraseña (Opcional)</label>
                <input
                  type="password"
                  placeholder="Dejar en blanco para no cambiar..."
                  value={editUserData.password}
                  onChange={(e) => setEditUserData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Rol de Cuenta</label>
                  <select
                    value={editUserData.role}
                    onChange={(e) => setEditUserData(prev => ({ ...prev, role: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm bg-white font-bold"
                  >
                    <option value="user">User (Usuario)</option>
                    <option value="admin">Admin (Administrador)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Sitio de IT Autorizado</label>
                  <select
                    value={editUserData.site}
                    onChange={(e) => setEditUserData(prev => ({ ...prev, site: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm bg-white font-semibold"
                  >
                    {sites.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 text-xs font-bold border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submittingEdit}
                  className="px-4 py-2 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition"
                >
                  {submittingEdit ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}

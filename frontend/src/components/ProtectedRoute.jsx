import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children, allowedRoles = [], requiredPermission }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="text-slate-500 animate-pulse text-lg font-medium">Verificando credenciales...</div>
      </div>
    )
  }

  if (!user) {
    // Redirect to login if not logged in
    return <Navigate to="/login" replace />
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Redirect to dashboard if user doesn't have the required role
    return <Navigate to="/" replace />
  }

  if (requiredPermission && user.permissions) {
    const userPerms = user.permissions.split(',').map(p => p.trim())
    if (!userPerms.includes(requiredPermission)) {
      return (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-sm max-w-md mx-auto my-12 animate-in fade-in duration-200">
          <span className="text-4xl">⚠️</span>
          <h2 className="text-lg font-bold text-slate-800 mt-4">Acceso Restringido</h2>
          <p className="text-xs text-slate-500 mt-2">Tu cuenta de usuario no cuenta con los permisos requeridos para acceder a esta función.</p>
          <p className="text-[10px] text-slate-400 mt-1 font-semibold">Contacta al administrador de IT de tu sitio si requieres acceso.</p>
        </div>
      )
    }
  }

  return children
}

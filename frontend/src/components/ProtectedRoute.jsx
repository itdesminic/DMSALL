import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children, allowedRoles = [] }) {
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

  return children
}

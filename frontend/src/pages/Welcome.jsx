import React from 'react'
import { useAuth } from '../context/AuthContext'

export default function Welcome() {
  const { user } = useAuth()

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-8">
      <div className="max-w-xl w-full bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-sm text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
        {/* Logo */}
        <div className="flex justify-center">
          <img 
            src="/logo.jpg" 
            alt="Logo Equinox Gold" 
            className="h-20 object-contain bg-white p-2 rounded-2xl border border-slate-100" 
          />
        </div>

        {/* Welcome message */}
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            ¡Bienvenid@, {user?.name || 'Usuario'}!
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            Portal de Servicios y Control Operativo — Desminic LL
          </p>
        </div>

        <div className="border-t border-slate-100 pt-6">
          <p className="text-xs text-slate-400 font-semibold leading-relaxed">
            Utiliza el menú lateral izquierdo para navegar y gestionar los servicios autorizados para tu cuenta.
          </p>
        </div>
      </div>
    </div>
  )
}

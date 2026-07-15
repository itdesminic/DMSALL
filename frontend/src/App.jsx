import React from 'react'
import { Routes, Route, Navigate, Link } from 'react-router-dom'
import Login from './pages/auth/Login'
import Dashboard from './pages/Dashboard'
import Forms from './pages/Forms'
import Food from './pages/Food'
import Radios from './pages/Radios'
import RadioRegistry from './pages/RadioRegistry'
import Rooms from './pages/Rooms'
import Admin from './pages/Admin'
import ChecklistReports from './pages/ChecklistReports'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import { useAuth } from './context/AuthContext'

function FormsRoute() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-500 animate-pulse text-lg font-medium">Cargando...</div>
      </div>
    )
  }

  if (user) {
    return (
      <Layout>
        <Forms />
      </Layout>
    )
  }

  // Standalone public portal for anonymous users
  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 font-sans antialiased">
      <div className="max-w-5xl mx-auto">
        {/* Simple Header branding */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <img src="/logo.jpg" alt="Logo Equinox Gold" className="h-10 object-contain rounded bg-white p-1" />
            <div>
              <h1 className="text-sm font-bold text-slate-900 leading-tight">Portal de Formularios</h1>
              <p className="text-[10px] text-slate-500 font-medium">Mina La Libertad</p>
            </div>
          </div>
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 transition px-3 py-1.5 text-xs font-bold text-blue-600 shadow-sm border border-blue-100/50"
          >
            🔐 Iniciar Sesión →
          </Link>
        </div>
        <Forms />
      </div>
    </div>
  )
}

function RadioRegistryRoute() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-500 animate-pulse text-lg font-medium">Cargando...</div>
      </div>
    )
  }

  if (user) {
    return (
      <Layout>
        <RadioRegistry />
      </Layout>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 font-sans antialiased">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <img src="/logo.jpg" alt="Logo Equinox Gold" className="h-10 object-contain rounded bg-white p-1" />
            <div>
              <h1 className="text-sm font-bold text-slate-900 leading-tight">Registro de Radio</h1>
              <p className="text-[10px] text-slate-500 font-medium">Mina La Libertad</p>
            </div>
          </div>
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 transition px-3 py-1.5 text-xs font-bold text-blue-600 shadow-sm border border-blue-100/50"
          >
            🔐 Iniciar Sesión →
          </Link>
        </div>
        <RadioRegistry />
      </div>
    </div>
  )
}

export default function App(){
  return (
    <Routes>
      <Route path="/login" element={<Login/>} />
      <Route path="/" element={<ProtectedRoute><Layout><Dashboard/></Layout></ProtectedRoute>} />
      <Route path="/checklist-reportes" element={<ProtectedRoute><Layout><ChecklistReports/></Layout></ProtectedRoute>} />
      <Route path="/formularios" element={<FormsRoute />} />
      <Route path="/comida" element={<ProtectedRoute><Layout><Food/></Layout></ProtectedRoute>} />
      <Route path="/radios/registro" element={<RadioRegistryRoute />} />
      <Route path="/radios/listado" element={<ProtectedRoute><Layout><Radios/></Layout></ProtectedRoute>} />
      <Route path="/radios" element={<Navigate replace to="/radios/listado" />} />
      <Route path="/salas" element={<ProtectedRoute><Layout><Rooms/></Layout></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><Layout><Admin/></Layout></ProtectedRoute>} />
      <Route path="*" element={<Navigate replace to="/" />} />
    </Routes>
  )
}

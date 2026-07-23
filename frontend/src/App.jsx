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
import PublicChecklists from './pages/PublicChecklists'
import CrimeaSamples from './pages/CrimeaSamples'
import PublicLodgingRequest from './pages/PublicLodgingRequest'
import AdminLodgingManagement from './pages/AdminLodgingManagement'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import { useAuth } from './context/AuthContext'
import PublicRadioSupport from './pages/PublicRadioSupport'
import AdminRadioDashboard from './pages/AdminRadioDashboard'
import AdminRadioList from './pages/AdminRadioList'
import AdminRadioReports from './pages/AdminRadioReports'
import AdminRadioNew from './pages/AdminRadioNew'
import AdminUserManagement from './pages/AdminUserManagement'
import UserRadioSupport from './pages/UserRadioSupport'
import UserRadioReports from './pages/UserRadioReports'
import Welcome from './pages/Welcome'
import AdminFoodMenu from './pages/AdminFoodMenu'

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
    if (user.permissions && !user.permissions.split(',').includes('forms')) {
      return <Navigate to="/" replace />
    }
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

function PublicChecklistsRoute() {
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
        <PublicChecklists />
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
              <h1 className="text-sm font-bold text-slate-900 leading-tight">Consulta de Checklists</h1>
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
        <PublicChecklists />
      </div>
    </div>
  )
}

function CrimeaSamplesRoute() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-500 animate-pulse text-lg font-medium">Cargando...</div>
      </div>
    )
  }

  if (user) {
    if (user.permissions && !user.permissions.split(',').includes('crimea')) {
      return <Navigate to="/" replace />
    }
    return (
      <Layout>
        <CrimeaSamples />
      </Layout>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 font-sans antialiased">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <img src="/logo.jpg" alt="Logo Equinox Gold" className="h-10 object-contain rounded bg-white p-1" />
            <div>
              <h1 className="text-sm font-bold text-slate-900 leading-tight">Portal Crimea</h1>
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
        <CrimeaSamples />
      </div>
    </div>
  )
}

export default function App(){
  return (
    <Routes>
      <Route path="/login" element={<Login/>} />
      <Route path="/" element={<Layout><ProtectedRoute><Welcome/></ProtectedRoute></Layout>} />
      <Route path="/dashboard" element={<Layout><ProtectedRoute requiredPermission="dashboard"><Dashboard/></ProtectedRoute></Layout>} />
      <Route path="/checklist-reportes" element={<Layout><ProtectedRoute requiredPermission="checklists"><ChecklistReports/></ProtectedRoute></Layout>} />
      <Route path="/formularios" element={<FormsRoute />} />
      <Route path="/formularios/checkcamionetas" element={<PublicChecklistsRoute />} />
      <Route path="/crimea/muestras" element={<CrimeaSamplesRoute />} />
      <Route path="/comida" element={<Layout><ProtectedRoute requiredPermission="food"><Food/></ProtectedRoute></Layout>} />
      <Route path="/radios/soporte" element={<PublicRadioSupport />} />
      <Route path="/radios/itadmon" element={<Layout><ProtectedRoute requiredPermission="radios"><AdminRadioDashboard/></ProtectedRoute></Layout>} />
      <Route path="/radios/itadmon/listado" element={<Layout><ProtectedRoute requiredPermission="radios"><AdminRadioList/></ProtectedRoute></Layout>} />
      <Route path="/radios/itadmon/reportes" element={<Layout><ProtectedRoute requiredPermission="radios"><AdminRadioReports/></ProtectedRoute></Layout>} />
      <Route path="/radios/itadmon/new" element={<Layout><ProtectedRoute requiredPermission="radios"><AdminRadioNew/></ProtectedRoute></Layout>} />
      <Route path="/radios/user/soporte" element={<Layout><ProtectedRoute requiredPermission="radios_user_support"><UserRadioSupport/></ProtectedRoute></Layout>} />
      <Route path="/radios/user/reporte" element={<Layout><ProtectedRoute requiredPermission="radios_user_reports"><UserRadioReports/></ProtectedRoute></Layout>} />
      <Route path="/radios" element={<Navigate replace to="/radios/soporte" />} />
      <Route path="/salas" element={<Layout><ProtectedRoute requiredPermission="rooms"><Rooms/></ProtectedRoute></Layout>} />
      <Route path="/servicios/hospedaje/solicitud" element={<PublicLodgingRequest />} />
      <Route path="/admin/hospedaje" element={<Layout><ProtectedRoute allowedRoles={['admin']} requiredPermission="lodging"><AdminLodgingManagement/></ProtectedRoute></Layout>} />
      <Route path="/admin/comida" element={<Layout><ProtectedRoute allowedRoles={['admin']} requiredPermission="food"><AdminFoodMenu/></ProtectedRoute></Layout>} />
      <Route path="/admin" element={<Layout><ProtectedRoute allowedRoles={['admin']} requiredPermission="vehicles"><Admin/></ProtectedRoute></Layout>} />
      <Route path="/configuracion/usuarios" element={<Layout><ProtectedRoute allowedRoles={['admin']} requiredPermission="users"><AdminUserManagement/></ProtectedRoute></Layout>} />
      <Route path="*" element={<Navigate replace to="/" />} />
    </Routes>
  )
}

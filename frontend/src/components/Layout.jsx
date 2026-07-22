import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Layout({ children }){
  const { user, logout } = useAuth()
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const isActive = (path) => {
    if (path === '/radios') {
      return location.pathname.startsWith('/radios')
    }
    return location.pathname === path
  }

  const linkClass = (path) => 
    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
      isActive(path)
        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
        : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
    }`

  const closeMobileMenu = () => setIsMobileMenuOpen(false)

  const hasPermission = (key) => {
    if (!user) return false
    if (!user.permissions) return true
    return user.permissions.split(',').map(p => p.trim()).includes(key)
  }

  const SidebarContent = () => (
    <>
      <div>
        {/* Header / Brand */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.jpg" alt="Logo Equinox Gold" className="h-9 object-contain rounded bg-white p-1" />
            <div>
              <h1 className="text-xs font-bold tracking-tight text-white">Desminic LL</h1>
              <p className="text-[9px] text-slate-400 font-medium">Mina La Libertad</p>
            </div>
          </div>
          {/* Close button on mobile */}
          <button 
            onClick={closeMobileMenu}
            className="md:hidden p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            ✕
          </button>
        </div>

        {/* Navigation links */}
        <nav className="space-y-1.5">
          {/* Group: Usuarios Desminic */}
          {(hasPermission('dashboard') || hasPermission('forms') || hasPermission('checklists') || hasPermission('food') || hasPermission('rooms') || hasPermission('crimea')) && (
            <div className="pt-2 pb-1">
              <span className="px-4 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Usuarios Desminic</span>
            </div>
          )}
          {hasPermission('dashboard') && (
            <Link className={linkClass('/')} to="/" onClick={closeMobileMenu}>
              📊 Dashboard
            </Link>
          )}
          {hasPermission('forms') && (
            <Link className={linkClass('/formularios')} to="/formularios" onClick={closeMobileMenu}>
              📝 Formularios
            </Link>
          )}
          {hasPermission('checklists') && (
            <Link className={linkClass('/checklist-reportes')} to="/checklist-reportes" onClick={closeMobileMenu}>
              📋 Reportes Checklist
            </Link>
          )}
          {hasPermission('food') && (
            <Link className={linkClass('/comida')} to="/comida" onClick={closeMobileMenu}>
              🍽️ Menú Semanal
            </Link>
          )}
          {hasPermission('rooms') && (
            <Link className={linkClass('/salas')} to="/salas" onClick={closeMobileMenu}>
              📅 Salas de Reunión
            </Link>
          )}
          {hasPermission('crimea') && (
            <Link className={linkClass('/crimea/muestras')} to="/crimea/muestras" onClick={closeMobileMenu}>
              💧 Muestras Crimea
            </Link>
          )}
          
          {/* Group: Servicios de IT */}
          {hasPermission('radios') && (
            <>
              <div className="pt-4 pb-1">
                <span className="px-4 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Servicios de IT</span>
              </div>
              <Link className={linkClass('/radios')} to="/radios/itadmon" onClick={closeMobileMenu}>
                📻 Inventario Radios
              </Link>
            </>
          )}

          {/* Group: Soporte Radios (Usuario) */}
          {(hasPermission('radios_user_support') || hasPermission('radios_user_reports')) && (
            <>
              <div className="pt-4 pb-1">
                <span className="px-4 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Soporte Radios</span>
              </div>
              {hasPermission('radios_user_support') && (
                <Link className={linkClass('/radios/user/soporte')} to="/radios/user/soporte" onClick={closeMobileMenu}>
                  🛎️ Reportar Caso
                </Link>
              )}
              {hasPermission('radios_user_reports') && (
                <Link className={linkClass('/radios/user/reporte')} to="/radios/user/reporte" onClick={closeMobileMenu}>
                  📋 Mis Tickets
                </Link>
              )}
            </>
          )}
          
          {user?.role === 'admin' && (hasPermission('lodging') || hasPermission('vehicles')) && (
            <div className="pt-4 pb-1">
              <span className="px-4 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Servicios Generales</span>
            </div>
          )}
          
          {user?.role === 'admin' && hasPermission('lodging') && (
            <Link className={linkClass('/admin/hospedaje')} to="/admin/hospedaje" onClick={closeMobileMenu}>
              🏨 Hospedaje y Comida
            </Link>
          )}
          {user?.role === 'admin' && hasPermission('vehicles') && (
            <Link className={linkClass('/admin')} to="/admin" onClick={closeMobileMenu}>
              ⚙️ Adm. Camionetas
            </Link>
          )}

          {user?.role === 'admin' && hasPermission('users') && (
            <>
              <div className="pt-4 pb-1">
                <span className="px-4 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Configuración</span>
              </div>
              <Link className={linkClass('/configuracion/usuarios')} to="/configuracion/usuarios" onClick={closeMobileMenu}>
                👥 Usuarios y Roles
              </Link>
            </>
          )}
        </nav>
      </div>

      {/* User Info & Logout */}
      <div className="pt-6 border-t border-slate-800">
        <div className="bg-slate-800/40 p-4 rounded-xl mb-4 border border-slate-800">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center font-bold text-md text-white">
              {user?.name ? user.name[0].toUpperCase() : 'U'}
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-slate-200 truncate">{user?.name || 'Operador'}</p>
              <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
          <div className="mt-2.5">
            <span className="inline-block rounded-md bg-blue-500/10 border border-blue-500/25 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-blue-400">
              {user?.role || 'usuario'}
            </span>
          </div>
        </div>
        <button
          onClick={() => {
            closeMobileMenu()
            logout()
          }}
          className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-900/50 hover:bg-rose-950/20 hover:border-rose-900/30 hover:text-rose-400 px-4 py-2.5 text-xs font-bold text-slate-400 transition-all duration-200"
        >
          🚪 Cerrar Sesión
        </button>
      </div>
    </>
  )

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased flex flex-col md:flex-row">
      
      {/* Mobile Top Navigation Header */}
      <header className="flex items-center justify-between bg-slate-900 text-white px-4 py-3 md:hidden border-b border-slate-800 z-30 shadow-sm">
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition text-lg"
          aria-label="Open menu"
        >
          ☰
        </button>
        <div className="flex items-center gap-2">
          <img src="/logo.jpg" alt="Logo Equinox Gold" className="h-7 object-contain rounded bg-white p-0.5" />
          <span className="font-bold text-xs tracking-tight">CRM Industrial</span>
        </div>
        <div className="h-8 w-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center font-bold text-xs text-slate-200">
          {user?.name ? user.name[0].toUpperCase() : 'U'}
        </div>
      </header>

      {/* Sidebar Backdrop Overlay for Mobile */}
      {isMobileMenuOpen && (
        <div 
          onClick={closeMobileMenu} 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden transition-opacity duration-300"
        />
      )}

      {/* Sidebar - Desktop (static) & Mobile (drawer) */}
      <aside 
        className={`fixed md:sticky top-0 bottom-0 left-0 z-50 w-72 bg-slate-900 text-white p-6 flex flex-col justify-between border-r border-slate-800 transition-transform duration-300 md:transform-none md:flex ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <SidebarContent />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-8 overflow-y-auto max-h-screen md:max-h-none">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}

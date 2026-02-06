import { useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  BookOpen,
  Users,
  CreditCard,
  Menu,
  X,
  LogOut,
  ChevronDown,
} from 'lucide-react'

const navItems = [
  { label: 'Dashboard', to: '/admin', icon: LayoutDashboard },
  { label: 'Livres', to: '/admin/livres', icon: BookOpen },
  { label: 'Utilisateurs', to: '/admin/utilisateurs', icon: Users },
  { label: 'Paiements', to: '/admin/paiements', icon: CreditCard },
]

function AdminLayout({ children, user = null, onLogout = () => {} }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const location = useLocation()

  return (
    <div className="flex h-screen bg-ink-50">
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-ink-100 bg-white transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-ink-100 px-4">
          <Link to="/admin" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-sm font-bold text-white">
              B
            </div>
            {sidebarOpen ? <span className="font-bold text-ink-900">Admin</span> : null}
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-ink-100 text-ink-600"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2 overflow-y-auto px-3 py-4">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.to
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? 'bg-brand-soft text-brand-700'
                    : 'text-ink-600 hover:bg-ink-50 hover:text-ink-900'
                }`}
                title={!sidebarOpen ? item.label : undefined}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {sidebarOpen ? <span>{item.label}</span> : null}
              </NavLink>
            )
          })}
        </nav>

        {/* User */}
        {sidebarOpen && user ? (
          <div className="border-t border-ink-100 p-4">
            <div className="flex items-center gap-3 rounded-lg bg-ink-50 p-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">
                {user.name?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-ink-900">
                  {user.name || 'Admin'}
                </p>
                <p className="truncate text-xs text-ink-500">{user.role || 'Administrateur'}</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="mt-3 flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-ink-600 hover:bg-red-50 hover:text-red-700 transition"
            >
              <LogOut className="h-4 w-4" />
              Déconnexion
            </button>
          </div>
        ) : null}
      </aside>

      {/* Main Content */}
      <main
        className={`flex-1 overflow-auto transition-all duration-300 ${
          sidebarOpen ? 'ml-64' : 'ml-20'
        }`}
      >
        {/* Top Bar */}
        <div className="sticky top-0 z-30 border-b border-ink-100 bg-white px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-ink-900">Administration</h1>
            <div className="flex items-center gap-4">
              <Link
                to="/"
                className="text-sm font-medium text-ink-600 hover:text-brand transition"
              >
                Voir le site
              </Link>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-6">{children}</div>
      </main>
    </div>
  )
}

export default AdminLayout

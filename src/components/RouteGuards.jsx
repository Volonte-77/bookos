import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export function PublicRoute({ redirectTo = '/profil' }) {
  const { currentUser, loading } = useAuth()

  if (loading) {
    return <div className="p-6 text-ink-500">Chargement...</div>
  }

  if (currentUser) {
    return <Navigate to={redirectTo} replace />
  }

  return <Outlet />
}

export function ProtectedRoute({ redirectTo = '/connexion' }) {
  const { currentUser, loading } = useAuth()

  if (loading) {
    return <div className="p-6 text-ink-500">Chargement...</div>
  }

  if (!currentUser) {
    return <Navigate to={redirectTo} replace />
  }

  return <Outlet />
}

export function AdminRoute({ redirectTo = '/connexion' }) {
  const { currentUser, loading } = useAuth()

  if (loading) {
    return <div className="p-6 text-ink-500">Chargement...</div>
  }

  if (!currentUser || currentUser.role !== 'admin') {
    return <Navigate to={redirectTo} replace />
  }

  return <Outlet />
}

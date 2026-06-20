import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'

function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <div className="loading">Carregando…</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

export default ProtectedRoute

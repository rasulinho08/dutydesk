import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

/**
 * Protected Route Component
 * Redirects unauthenticated users to login
 * Redirects based on user role
 */
export const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth()

  // Show loading state while validating token
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        color: '#6b7280'
      }}>
        Yüklənir...
      </div>
    )
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Requires admin but user is not admin
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/dashboard" replace />
  }

  // Is admin but trying to access employee routes
  if (!requireAdmin && isAdmin) {
    return <Navigate to="/admin" replace />
  }

  return children
}

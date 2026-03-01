/**
 * DutyDesk - Növbə İdarəetmə Sistemi
 * 
 * Əsas Application komponenti
 * - JWT token-based authentication
 * - Backend API integration
 * - Role-based route protection (ADMIN/SUPERVISOR/EMPLOYEE)
 * - Automatic token validation on app load
 * 
 * @author DutyDesk Team
 * @version 2.0.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth'
import { ProtectedRoute } from './components/ProtectedRoute'

// ============================================
// Pages
// ============================================
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import MyShifts from './pages/MyShifts'
import HandoverForm from './pages/HandoverForm'
import HandoverHistory from './pages/HandoverHistory'

// ============================================
// Layout Components
// ============================================
import Layout from './components/Layout'
import AdminLayout from './components/AdminLayout'

// ============================================
// Admin Pages
// ============================================
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminStatistics from './pages/admin/AdminStatistics'
import AdminHistory from './pages/admin/AdminHistory'
import AdminSchedule from './pages/admin/AdminSchedule'
import AdminWorkers from './pages/admin/AdminWorkers'

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Route - Login */}
          <Route path="/login" element={<Login />} />

          {/* Admin Routes - Protected (ADMIN/SUPERVISOR only) */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminLayout>
                  <Routes>
                    <Route path="/" element={<AdminDashboard />} />
                    <Route path="/statistics" element={<AdminStatistics />} />
                    <Route path="/history" element={<AdminHistory />} />
                    <Route path="/schedule" element={<AdminSchedule />} />
                    <Route path="/workers" element={<AdminWorkers />} />
                    <Route path="*" element={<Navigate to="/admin" replace />} />
                  </Routes>
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          {/* Employee Routes - Protected (EMPLOYEE only) */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-shifts"
            element={
              <ProtectedRoute>
                <Layout>
                  <MyShifts />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/handover-form"
            element={
              <ProtectedRoute>
                <Layout>
                  <HandoverForm />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/handover-history"
            element={
              <ProtectedRoute>
                <Layout>
                  <HandoverHistory />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App

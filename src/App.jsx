/**
 * DutyDesk - Növbə İdarəetmə Sistemi
 * 
 * Əsas Application komponenti
 * - Login/Logout idarəetməsi
 * - Admin/User route-larının ayrılması
 * - Layout komponentlərinin təyin edilməsi
 * 
 * @author DutyDesk Team
 * @version 1.0.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState } from 'react'

// ============================================
// User Pages
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
  // ============================================
  // Authentication State
  // ============================================
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  /**
   * Login handler
   * Admin credentials: admin123@example.com / admin123
   * Regular user: any other email/password
   */
  const handleLogin = (email, password) => {
    // TODO: Backend API call əvəzinə mock data
    if (email === 'admin123@example.com' && password === 'admin123') {
      setIsAdmin(true)
      setIsAuthenticated(true)
    } else {
      setIsAdmin(false)
      setIsAuthenticated(true)
    }
  }

  /**
   * Logout handler
   * Bütün auth state-ləri sıfırlayır
   */
  const handleLogout = () => {
    setIsAuthenticated(false)
    setIsAdmin(false)
  }

  // ============================================
  // Unauthenticated - Login Page
  // ============================================
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />
  }

  // ============================================
  // Admin Panel Routes
  // ============================================
  if (isAdmin) {
    return (
      <Router>
        <AdminLayout onLogout={handleLogout}>
          <Routes>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/statistics" element={<AdminStatistics />} />
            <Route path="/admin/history" element={<AdminHistory />} />
            <Route path="/admin/schedule" element={<AdminSchedule />} />
            <Route path="/admin/workers" element={<AdminWorkers />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </AdminLayout>
      </Router>
    )
  }

  // ============================================
  // Regular User Panel Routes
  // ============================================
  return (
    <Router>
      <Layout onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/my-shifts" element={<MyShifts />} />
          <Route path="/handover-form" element={<HandoverForm />} />
          <Route path="/handover-history" element={<HandoverHistory />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App

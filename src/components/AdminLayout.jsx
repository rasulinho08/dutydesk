import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutGrid, FileText, Calendar,
  Users, LogOut, Menu
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import Header from './Header'
import './AdminLayout.css'

function AdminLayout({ children }) {
  const { logout, user } = useAuth()
  const [collapsed, setCollapsed] = useState(false)

  const menuItems = [
    { path: '/admin', icon: LayoutGrid, label: 'Dashboard', exact: true },
    { path: '/admin/statistics', icon: FileText, label: 'History' },
    { path: '/admin/schedule', icon: Calendar, label: 'Work schedule' },
    { path: '/admin/workers', icon: Users, label: 'Workers' }
  ]

  return (
    <div className="admin-layout">
      {/* Header */}
      <Header />

      <div className="admin-body">
        {/* Sidebar */}
        <aside className={`admin-sidebar ${collapsed ? 'collapsed' : ''}`}>
          <div className="sidebar-header">
            {!collapsed && (
              <>
                <h2>Dashboard</h2>
                <span className="admin-panel-label">Admin Panel</span>
              </>
            )}
            <button className="menu-toggle" onClick={() => setCollapsed(!collapsed)}>
              <Menu size={20} />
            </button>
          </div>

          <nav className="sidebar-nav">
            {menuItems.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.exact}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                title={collapsed ? item.label : ''}
              >
                <item.icon size={18} />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            ))}
          </nav>

          <div className="sidebar-footer">
            <div className="user-info">
              <div className="user-avatar">
                {user?.fullName?.substring(0, 2).toUpperCase() || 'AD'}
              </div>
              {!collapsed && (
                <div className="user-details">
                  <span className="user-name">{user?.fullName || 'Admin'}</span>
                  <span className="user-role">{user?.role || 'Administrator'}</span>
                </div>
              )}
            </div>
            <button className="logout-btn" onClick={logout}>
              <LogOut size={18} />
              {!collapsed && 'Exit'}
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="admin-main">
          {children}
        </main>
      </div>
    </div>
  )
}

export default AdminLayout

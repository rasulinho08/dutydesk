import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Calendar,
  FileText,
  History,
  LogOut,
  Menu
} from 'lucide-react'
import Header from './Header'
import './Layout.css'

function Layout({ children, onLogout }) {
  const [collapsed, setCollapsed] = useState(false)

  const menuItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/my-shifts', icon: Calendar, label: 'Mənim Növbələrim' },
    // { path: '/handover-form', icon: FileText, label: 'Təhvil-Təslim Formu' },
    // { path: '/handover-history', icon: History, label: 'Təhvil-Təslim Tarixçəsi' },
  ]

  return (
    <div className="layout">
      {/* Header */}
      <Header />

      {/* Body */}
      <div className="layout-body">
        {/* Sidebar */}
        <aside className={`admin-sidebar ${collapsed ? 'collapsed' : ''}`}>
          <div className="sidebar-header">
            {!collapsed && (
              <>
                <h2>Dashboard</h2>
                <span className="admin-panel-label">APM Team</span>
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
              <div className="user-avatar">VƏ</div>
              {!collapsed && (
                <div className="user-details">
                  <span className="user-name">Vüsal Əliyev</span>
                  <span className="user-role">Employee</span>
                </div>
              )}
            </div>
            <button className="logout-btn" onClick={onLogout}>
              <LogOut size={18} />
              {!collapsed && 'Exit'}
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout

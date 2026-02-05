import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, BarChart2, History, Calendar,
  Users, LogOut, Menu, ChevronRight
} from 'lucide-react'
import Header from './Header'
import './AdminLayout.css'

function AdminLayout({ children, onLogout }) {
  const [collapsed, setCollapsed] = useState(false)

  const menuItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
    // { path: '/admin/history', icon: History, label: 'History' },
    { path: '/admin/statistics', icon: BarChart2, label: 'History' },
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

          {/* Collapse Toggle Button */}
          <button className="collapse-toggle" onClick={() => setCollapsed(!collapsed)}>
            <ChevronRight size={16} className={collapsed ? '' : 'rotated'} />
          </button>

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
                  <span className="user-role">Administrator</span>
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
        <main className="admin-main">
          {children}
        </main>
      </div>
    </div>
  )
}

export default AdminLayout

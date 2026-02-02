import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Calendar, 
  FileText, 
  History, 
  LogOut,
  Menu,
  Bell,
  ChevronRight
} from 'lucide-react'
import './Layout.css'

function Layout({ children, onLogout }) {
  const [collapsed, setCollapsed] = useState(false)

  const menuItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/my-shifts', icon: Calendar, label: 'Mənim Növbələrim' },
    { path: '/handover-form', icon: FileText, label: 'Təhvil-Təslim Formu' },
    { path: '/handover-history', icon: History, label: 'Təhvil-Təslim Tarixçəsi' },
  ]

  return (
    <div className="layout">
      {/* Header */}
      <header className="layout-header">
        <div className="header-logo">
          <span className="logo-text">DutyDesk</span>
        </div>
        <div className="header-actions">
          <button className="notification-btn">
            <Bell size={20} />
          </button>
          <span className="flag-icon">🇦🇿</span>
        </div>
      </header>

      {/* Body */}
      <div className="layout-body">
        {/* Sidebar */}
        <aside className={`layout-sidebar ${collapsed ? 'collapsed' : ''}`}>
          {/* Collapse Toggle */}
          <button className="collapse-toggle" onClick={() => setCollapsed(!collapsed)}>
            <ChevronRight size={14} className={collapsed ? '' : 'rotated'} />
          </button>

          <div className="sidebar-header">
            <div className="sidebar-title">
              <h2>Dashboard</h2>
              <span className="team-label">APM Team</span>
            </div>
            <button className="menu-btn" onClick={() => setCollapsed(!collapsed)}>
              <Menu size={20} />
            </button>
          </div>

          <nav className="sidebar-nav">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => 
                  `nav-item ${isActive ? 'active' : ''}`
                }
                title={collapsed ? item.label : ''}
              >
                <item.icon size={20} />
                <span className="nav-label">{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="sidebar-footer">
            <div className="user-info">
              <div className="user-avatar">LM</div>
              <div className="user-details">
                <span className="user-name">Leyla Məmmədova</span>
                <span className="user-role">Employee</span>
              </div>
            </div>
            
            <button className="logout-btn" onClick={onLogout}>
              <LogOut size={18} />
              <span className="logout-label">Exit</span>
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

import { NavLink } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Calendar, 
  FileText, 
  History, 
  LogOut,
  Menu
} from 'lucide-react'
import './Sidebar.css'

function Sidebar({ onLogout }) {
  const menuItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/my-shifts', icon: Calendar, label: 'Mənim Növbələrim' },
    { path: '/handover-form', icon: FileText, label: 'Təhvil-Təslim Formu' },
    { path: '/handover-history', icon: History, label: 'Təhvil-Təslim Tarixçəsi' },
  ]

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-title">
          <h2>Dashboard</h2>
          <span className="team-label">APM Team</span>
        </div>
        <button className="menu-btn">
          <Menu size={20} />
        </button>
      </div>

      <div className="sidebar-toggle">
        <div className="toggle-indicator"></div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `nav-item ${isActive ? 'active' : ''}`
            }
          >
            <item.icon size={20} />
            <span>{item.label}</span>
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
          <span>Exit</span>
        </button>
      </div>
    </aside>
  )
}

export default Sidebar

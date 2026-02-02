import { Bell } from 'lucide-react'
import './Header.css'

function Header() {
  return (
    <header className="header">
      <div className="header-logo">
        <span className="logo-text">DutyDesk</span>
      </div>

      <div className="header-actions">
        <button className="notification-btn">
          <Bell size={22} />
        </button>
        <div className="flag-icon">
          <img 
            src="https://flagcdn.com/w40/az.png" 
            alt="Azerbaijan Flag" 
            width="28"
            height="20"
          />
        </div>
      </div>
    </header>
  )
}

export default Header

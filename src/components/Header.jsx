// Header.jsx
import { Bell } from 'lucide-react';
import logo from '../assets/logo.png'; // Make sure this path points to your actual DutyDesk logo
import './Header.css';

function Header() {
  return (
    <header className="header">
      <div className="header-logo">
        <img 
          src={logo} 
          alt="DutyDesk Logo" 
          className="logo-img" 
        />
      </div>

      <div className="header-actions">
        <button className="notification-btn" aria-label="Notifications">
          <Bell size={20} />
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
  );
}

export default Header;
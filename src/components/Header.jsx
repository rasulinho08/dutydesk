// Header.jsx
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
    </header>
  );
}

export default Header;
import React, { useState, useEffect, useRef } from "react";
import { FaUserCircle, FaSignOutAlt, FaBars } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import "../styles/Navbar.css";

const Navbar = ({ onLogout, onToggleSidebar }) => {
  const [userRole, setUserRole] = useState(localStorage.getItem('userRole') || 'Usuario');
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        setUserRole(decodedToken.role || 'Usuario');
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = (e) => {
    e.preventDefault(); // Prevenimos cualquier comportamiento por defecto
    e.stopPropagation(); // Evitamos la propagación del evento
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    if (typeof onLogout === 'function') {
      onLogout();
    }
    navigate('/login');
  };

  return (
    <nav className="nav-navbar nav-navbar-responsive">
      <div className="nav-navbar-content">
      <button onClick={() => {onToggleSidebar();}}>
          <FaBars /> {/* Icono de menú hamburguesa */}
        </button>
        <div className="nav-user-section" ref={dropdownRef}>
        <div 
            className="nav-user-info"
            onClick={() => {setDropdownOpen(!isDropdownOpen);}}
          >
            <span className="nav-user-name">Bienvenido, {userRole}</span>
            <FaUserCircle className="nav-user-icon" />
          </div>

          {isDropdownOpen && (
            <div className="nav-dropdown-menu">
              <div className="nav-dropdown-header">
                
              </div>
              <button 
                className="nav-logout-button" 
                onClick={handleLogout}
                type="button" // Añadimos esto para mayor claridad
              >
                <span>Cerrar sesión</span>
                <FaSignOutAlt size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

import React, { useState, useEffect, useRef } from "react";
import { FaUserCircle, FaSignOutAlt, FaBars } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "../styles/Navbar.css";
import { decodeToken } from "../utils/api";
import LowStockNotification from "./LowStockNotification";

const Navbar = ({ onLogout, onToggleSidebar }) => {
  const [userRole, setUserRole] = useState("Usuario");
  const [username, setUsername] = useState("");
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = decodeToken();
    if (userData) {
      setUserRole(userData.role || "Usuario");
      setUsername(userData.username || "");
    }

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = (e) => {
    e.preventDefault(); // Prevenimos cualquier comportamiento por defecto
    e.stopPropagation(); // Evitamos la propagación del evento

    localStorage.removeItem("authToken");

    if (typeof onLogout === "function") {
      onLogout();
    }

    navigate("/login");
  };

  // formatear el rol para mostrar (primera letra mayúscula)
  const formatRole = (role) => {
    if (!role) return "Usuario";
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  return (
    <nav className="nav-navbar nav-navbar-responsive">
      <div className="nav-navbar-content">
        <button
          onClick={() => {
            onToggleSidebar();
          }}
        >
          <FaBars /> {/* Icono de menú hamburguesa */}
        </button>

        <div className="nav-user-section" ref={dropdownRef}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginRight: "10px",
            }}
          >
            <LowStockNotification />
          </div>
          
          <div
            className="nav-user-info"
            onClick={() => {
              setDropdownOpen(!isDropdownOpen);
            }}
          >
            <span className="nav-user-name">
              {username ? `Hola, ${username}` : "Bienvenido"}
              <small className="ms-2 text-muted">
                ({formatRole(userRole)})
              </small>
            </span>
            <FaUserCircle className="nav-user-icon" />
          </div>

          {isDropdownOpen && (
            <div className="nav-dropdown-menu">
              <div className="nav-dropdown-header"></div>
              <button
                className="nav-logout-button"
                onClick={handleLogout}
                type="button"
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

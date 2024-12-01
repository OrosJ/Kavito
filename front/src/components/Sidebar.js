import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaHome,
  FaUsers,
  FaBox,
  FaProjectDiagram,
  FaCogs,
  FaTimes,
  FaTasks,
} from "react-icons/fa"; // Iconos de FontAwesome
import "../styles/Sidebar.css";

const Sidebar = ({ isSidebarOpen, onClose }) => {
  const location = useLocation();
  const isActive = (path) => {
    return location.pathname === path;
  };
  return (
    <div className={`sidebar ${isSidebarOpen ? "show" : ""}`}>
      <div className="sidebar-header">
        <h3>KAVITO</h3>
        <button className="sidebar-close-btn mobile-only" onClick={onClose}>
          <FaTimes />
        </button>
      </div>
      <ul className="sidebar-menu">
        <li className={isActive('/') ? 'active' : ''}>
          <Link to="/">
            <FaHome /> Inicio
          </Link>
        </li>
        <li className={isActive('/products') ? 'active' : ''}>
          <Link to="/products">
            <FaBox /> Productos
          </Link>
        </li>
        <li className={isActive('/users') ? 'active' : ''}>
          <Link to="/users">
            <FaUsers className="me-2" /> Usuarios
          </Link>
        </li>
        <li className={isActive('/clients') ? 'active' : ''}>
          <Link to="/clients">
            <FaUsers className="me-2" /> Clientes
          </Link>
        </li>
        <li className={isActive('/categories') ? 'active' : ''}>
          <Link to="/categories">
            <FaCogs /> Categorias
          </Link>
        </li>
        <li className={isActive('/projects') ? 'active' : ''}>
          <Link to="/projects">
            <FaProjectDiagram /> Proyectos
          </Link>
        </li>
        <li className={isActive('/invouts') ? 'active' : ''}>
          <Link to="/invouts">
            <FaTasks/> Salidas
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;

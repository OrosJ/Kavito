import React from "react";
import { Link } from "react-router-dom";
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
  return (
    <div className={`sidebar ${isSidebarOpen ? "show" : ""}`}>
      <div className="sidebar-header">
        <h3>KAVITO</h3>
        <button className="sidebar-close-btn mobile-only" onClick={onClose}>
          <FaTimes />
        </button>
      </div>
      <ul className="sidebar-menu">
        <li>
          <Link to="/">
            <FaHome /> Inicio
          </Link>
        </li>
        <li>
          <Link to="/products">
            <FaBox /> Productos
          </Link>
        </li>
        <li>
          <Link to="/users">
            <FaUsers className="me-2" /> Usuarios
          </Link>
        </li>
        <li>
          <Link to="/categories">
            <FaCogs /> Categorias
          </Link>
        </li>
        <li>
          <Link to="/">
            <FaProjectDiagram /> Proyectos
          </Link>
        </li>
        <li>
          <Link to="/invouts">
            <FaTasks/> Salidas
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;

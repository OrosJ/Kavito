import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaHome,
  FaUsers,
  FaBox,
  FaProjectDiagram,
  FaCogs,
  FaTimes,
  FaTasks,
  FaHistory,
  FaWarehouse,
  FaAngleDown,
  FaAngleUp,
} from "react-icons/fa"; // FontAwesome
import "../styles/Sidebar.css";
import api, { decodeToken } from "../utils/api";

const Sidebar = ({ isSidebarOpen, onClose }) => {
  const location = useLocation();
  const [userRole, setUserRole] = useState("vendedor");
  const [inventoryExpanded, setInventoryExpanded] = useState(false);

  useEffect(() => {
    // Decodificar el token para obtener el rol
    const userData = decodeToken();
    if (userData && userData.role) {
      setUserRole(userData.role);
    }

    // Expandir automáticamente el menú de inventario si estamos en una de sus rutas
    const inventoryPaths = ["/products", "/invouts", "/inventory/history"];
    if (inventoryPaths.some((path) => location.pathname.startsWith(path))) {
      setInventoryExpanded(true);
    }
  }, [location.pathname]);

  const isActive = (path) => {
    return location.pathname === path;
  };

  const isActiveParent = (paths) => {
    return paths.some((path) => location.pathname.startsWith(path));
  };

  // Función para determinar si se debe mostrar un elemento del menú según el rol
  const shouldShowMenuItem = (requiredRole) => {
    if (!requiredRole) return true; // Si no se requiere un rol específico, mostrar a todos
    return userRole === requiredRole || userRole === "administrador"; // Administrador ve todo
  };

  const toggleInventoryMenu = () => {
    setInventoryExpanded(!inventoryExpanded);
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
        <li className={isActive("/") ? "active" : ""}>
          <Link to="/">
            <FaHome /> Inicio
          </Link>
        </li>

        {/* Grupo de Inventario */}
        <li
          className={`${
            isActiveParent(["/products", "/invouts", "/inventory/history"])
              ? "active"
              : ""
          } menu-parent`}
        >
          <button
            type="button"
            className="menu-button"
            onClick={toggleInventoryMenu}
          >
            <FaWarehouse /> Inventario
            {inventoryExpanded ? (
              <FaAngleUp className="menu-arrow" />
            ) : (
              <FaAngleDown className="menu-arrow" />
            )}
          </button>

          {inventoryExpanded && (
            <ul className="submenu">
              <li className={isActive("/products") ? "active" : ""}>
                <Link to="/products">
                  <FaBox /> Productos
                </Link>
              </li>
              <li className={isActive("/invouts") ? "active" : ""}>
                <Link to="/invouts">
                  <FaTasks /> Salidas
                </Link>
              </li>
              <li className={isActive("/inventory/history") ? "active" : ""}>
                <Link to="/inventory/history">
                  <FaHistory /> Historial
                </Link>
              </li>
            </ul>
          )}
        </li>

        {shouldShowMenuItem("administrador") && (
          <li className={isActive("/users") ? "active" : ""}>
            <Link to="/users">
              <FaUsers className="me-2" /> Usuarios
            </Link>
          </li>
        )}

        <li className={isActive("/clients") ? "active" : ""}>
          <Link to="/clients">
            <FaUsers className="me-2" /> Clientes
          </Link>
        </li>
        <li className={isActive("/categories") ? "active" : ""}>
          <Link to="/categories">
            <FaCogs /> Categorias
          </Link>
        </li>
        <li className={isActive("/projects") ? "active" : ""}>
          <Link to="/projects">
            <FaProjectDiagram /> Proyectos
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;

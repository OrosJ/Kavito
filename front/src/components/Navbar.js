import React from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaBox, FaUsers, FaCogs, FaSignOutAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const CompNavbar = ({ onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-lg">
      <div className="container">
        <Link className="navbar-brand" to="/">
          <FaHome /> KAVITO
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/products">
                <FaBox className="me-2" /> Productos
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/users">
                <FaUsers className="me-2" /> Usuarios
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/categories">
                <FaCogs className="me-2" /> Categorías
              </Link>
            </li>
            <li className="nav-item">
              <button onClick={handleLogout} className="btn btn-danger">
                <FaSignOutAlt className="me-2" /> Cerrar sesión
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default CompNavbar;

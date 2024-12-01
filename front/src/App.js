import "./App.css";
import React, { useState, useEffect } from "react";
import { Route, Routes, useNavigate, useLocation } from "react-router-dom";

// Componentes
import Sidebar from "./components/Sidebar";
import CompNavbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomePage from "./components/HomePage";
import CompShowProducts from "./product/ShowProducts";
import CompCreateProduct from "./product/CreateProducts";
import CompEditProduct from "./product/EditProducts";
import CompShowUsers from "./user/ShowUsers";
import CompCreateUser from "./user/CreateUsers";
import CompShowClients from "./client/ShowClients.js";
import CompShowCategories from "./category/ShowCategory";
import CompCreateCategory from "./category/CreateCategory";
import CompShowInvOuts from "./invout/ShowOuts.js";
import CarritoComponent from "./invout/Cart.js";
import ConfirmarSalida from "./invout/Cart.js";
import InvOutDetails from "./invout/InvOutDetails.js";
import CompShowProjects from "./project/ShowProjects";
import CompCreateProject from "./project/CreateProject";
import Login from "./auth/Login";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  // Estado de autenticación
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Verificar si el usuario está autenticado al cargar la página
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      setIsAuthenticated(true);
      // redirigir a la página de inicio si estamos en la página de login
      if (location.pathname === "/login") {
        navigate("/");
      }
    } else {
      setIsAuthenticated(false); // Asegurarse de que el estado de autenticación sea correcto
    }
  }, [navigate, location]);

  // Implementar un temporizador de inactividad
  useEffect(() => {
    const timeout = 20 * 60 * 1000; // 20 minutos en ms
    let timer;

    const resetTimer = () => {
      if (timer) {
        clearTimeout(timer);
      }
      timer = setTimeout(() => {
        handleLogout();
      }, timeout);
    };

    // Detectar eventos de actividad
    const events = ["mousemove", "keydown", "click", "scroll"];
    events.forEach((event) => window.addEventListener(event, resetTimer));

    // Limpiar el temporizador cuando el componente se desmonte
    return () => {
      events.forEach((event) => window.removeEventListener(event, resetTimer));
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, []);

  // Función para el cierre de sesión
  const handleLogout = () => {
    // Eliminar el token del localStorage
    localStorage.removeItem("authToken");
    // Redirigir al login
    setIsAuthenticated(false);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
    /* console.log(isSidebarOpen); */
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className={`App ${isAuthenticated ? 'authenticated' : ''}`}>
      {/* Mostrar la barra de navegación solo si el usuario está autenticado */}
      {isAuthenticated && (
        <CompNavbar
          onLogout={handleLogout}
          onToggleSidebar={toggleSidebar}
          isSidebarOpen={isSidebarOpen}
        />
      )}
      {isAuthenticated && (
        <Sidebar
          className={`sidebar ${isSidebarOpen ? "show" : ""}`}
          isSidebarOpen={isSidebarOpen}
          onClose={closeSidebar}
        />
      )}

      <div
        className={`content ${
          isAuthenticated ? "with-sidebar" : "full-screen"
        }`}
      >
        <Routes>
          {/* Ruta para login */}
          <Route
            path="/login"
            element={<Login setIsAuthenticated={setIsAuthenticated} />}
          />
        </Routes>
        <Routes>
          {/* Ruta para la página principal */}
          <Route
            path="/"
            element={
              <ProtectedRoute
                isAuthenticated={isAuthenticated}
                element={<HomePage />}
              />
            }
          />

          {/* Rutas protegidas */}
          <Route
            path="/products"
            element={
              <ProtectedRoute
                isAuthenticated={isAuthenticated}
                element={<CompShowProducts />}
              />
            }
          />
          <Route
            path="/create"
            element={
              <ProtectedRoute
                isAuthenticated={isAuthenticated}
                element={<CompCreateProduct />}
              />
            }
          />
          <Route
            path="/edit/:id"
            element={
              <ProtectedRoute
                isAuthenticated={isAuthenticated}
                element={<CompEditProduct />}
              />
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute
                isAuthenticated={isAuthenticated}
                element={<CompShowUsers />}
              />
            }
          />
          <Route
            path="/create-user"
            element={
              <ProtectedRoute
                isAuthenticated={isAuthenticated}
                element={<CompCreateUser />}
              />
            }
          />
          <Route path="/edit-user/:id" element={<CompCreateUser />} />
          <Route
            path="/clients"
            element={
              <ProtectedRoute
                isAuthenticated={isAuthenticated}
                element={<CompShowClients />}
              />
            }
          />
          <Route
            path="/categories"
            element={
              <ProtectedRoute
                isAuthenticated={isAuthenticated}
                element={<CompShowCategories />}
              />
            }
          />
          <Route
            path="/create-category"
            element={
              <ProtectedRoute
                isAuthenticated={isAuthenticated}
                element={<CompCreateCategory />}
              />
            }
          />
          <Route
            path="/invouts"
            element={
              <ProtectedRoute
                isAuthenticated={isAuthenticated}
                element={<CompShowInvOuts />}
              />
            }
          />
          <Route
            path="/invouts/cart"
            element={
              <ProtectedRoute
                isAuthenticated={isAuthenticated}
                element={<CarritoComponent />}
              />
            }
          />
          <Route
            path="/invouts/create"
            element={
              <ProtectedRoute
                isAuthenticated={isAuthenticated}
                element={<ConfirmarSalida />}
              />
            }
          />
          <Route path="/invouts/details/:id" element={<InvOutDetails />} />
          {/* <Route path="*" element={<div>404 - Página no encontrada</div>} /> */}
          <Route
            path="/projects"
            element={
              <ProtectedRoute
                isAuthenticated={isAuthenticated}
                element={<CompShowProjects />}
              />
            }
          />
          <Route
            path="/projects/create"
            element={
              <ProtectedRoute
                isAuthenticated={isAuthenticated}
                element={<CompCreateProject />}
              />
            }
          />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}

export default App;

import "./App.css";
import { useState, useEffect } from "react";
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
import CompShowCategories from "./category/ShowCategory";
import CompCreateCategory from "./category/CreateCategory";
import Login from "./auth/Login";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  // Estado de autenticación
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Verificar si el usuario está autenticado al cargar la página
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      setIsAuthenticated(true);
      // Solo redirigir a la página de inicio si estamos en la página de login
      if (location.pathname === "/login") {
        navigate("/");
      }
    } else {
      setIsAuthenticated(false); // Asegurarse de que el estado de autenticación sea correcto
    }
  }, [navigate, location]);

  // Implementar un temporizador de inactividad
  useEffect(() => {
    const timeout = 20 * 60 * 1000; // 20 minutos en milisegundos
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

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="App">
      {/* Mostrar la barra de navegación solo si el usuario está autenticado */}
      {isAuthenticated && (
        <CompNavbar onLogout={handleLogout} onToggleSidebar={toggleSidebar} />
      )}
      {isAuthenticated && (
        <Sidebar className={`sidebar ${isSidebarOpen ? "show" : ""}`} />
      )}

      <div className="content">
        <Routes>
          {/* Ruta para login */}
          <Route
            path="/login"
            element={<Login setIsAuthenticated={setIsAuthenticated} />}
          />

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
        </Routes>
      </div>
      <Footer />
    </div>
  );
}

export default App;

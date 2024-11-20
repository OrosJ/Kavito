import './App.css';
import { useState, useEffect } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';

// Componentes
import CompNavbar from './components/Navbar';
import HomePage from './components/HomePage';
import CompShowProducts from './product/ShowProducts';
import CompCreateProduct from './product/CreateProducts';
import CompEditProduct from './product/EditProducts';
import CompShowUsers from './user/ShowUsers';
import CompCreateUser from './user/CreateUsers'; 
import CompShowCategories from './category/ShowCategory';
import CompCreateCategory from './category/CreateCategory';
import Login from './auth/Login';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  // Estado de autenticación
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Verificar si el usuario está autenticado al cargar la página
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);  // Asegurarse de que el estado de autenticación sea correcto
    }
  }, []);

  // Función para el cierre de sesión
  const handleLogout = () => {
    // Eliminar el token del localStorage
    localStorage.removeItem('authToken');
    
    // Redirigir al login
    setIsAuthenticated(false);
  };

  return (
    <div className="App">
      {/* Mostrar la barra de navegación solo si el usuario está autenticado */}
      {isAuthenticated && <CompNavbar onLogout={handleLogout} />}
      
      <Routes>
        {/* Ruta para login */}
        <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
        
        {/* Ruta para la página principal */}
        <Route path="/" 
          element={<ProtectedRoute isAuthenticated={isAuthenticated} element={<HomePage />} />} />
        
        {/* Rutas protegidas */}
        <Route path="/products" 
          element={<ProtectedRoute isAuthenticated={isAuthenticated} element={<CompShowProducts />} />} />
        <Route path='/create' 
          element={<ProtectedRoute isAuthenticated={isAuthenticated} element={<CompCreateProduct />} />} />
        <Route path='/edit/:id' 
          element={<ProtectedRoute isAuthenticated={isAuthenticated} element={<CompEditProduct />} />} />
        <Route path='/users' 
          element={<ProtectedRoute isAuthenticated={isAuthenticated} element={<CompShowUsers />} />} />
        <Route path='/create-user' 
          element={<ProtectedRoute isAuthenticated={isAuthenticated} element={<CompCreateUser />} />} />
        <Route path='/edit-user' 
          element={<CompCreateUser />} />
        <Route path='/categories' 
          element={<ProtectedRoute isAuthenticated={isAuthenticated} element={<CompShowCategories />} />} />
        <Route path='/create-category' 
          element={<ProtectedRoute isAuthenticated={isAuthenticated} element={<CompCreateCategory />} />} />
      </Routes>
    </div>
  );
}

export default App;

import { Navigate } from 'react-router-dom';

// Componente de Ruta Protegida
const ProtectedRoute = ({ isAuthenticated, element }) => {
  // Si el usuario no está autenticado, redirige al login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Si está autenticado, permite acceder a la ruta
  return element;
};

export default ProtectedRoute;

import axios from 'axios';

// Crear una instancia de Axios con la URL base
const api = axios.create({
  baseURL: 'http://localhost:8000',
});

// decodificar el token JWT
export const decodeToken = () => {
    const token = localStorage.getItem('authToken');
    if (!token) return null;
    
    try {
      // Dividir por el punto y tomar la parte del payload (la segunda)
      const base64Url = token.split('.')[1];
      // Convertir de base64 a utf8
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      // Decodificar y parsear a JSON
      const payload = JSON.parse(window.atob(base64));
      return payload;
    } catch (error) {
      console.error('Error decodificando token:', error);
      return null;
    }
  };
  
  // Función para verificar si el usuario tiene un rol específico
  export const userHasRole = (role) => {
    const userData = decodeToken();
    return userData && userData.role === role;
  };    

// Agregar un interceptor para incluir el token en cada solicitud
api.interceptors.request.use(
  (config) => {
    // Obtener el token desde localStorage
    const token = localStorage.getItem('authToken');
    
    // Si hay un token, añadirlo a los headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de respuesta (como token expirado)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si el error es 401 (No autorizado) o 403 (Prohibido)
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // redirigir al login o mostrar un mensaje
      console.error('Error de autenticación:', error.response.data);
      
      // Si es un error de token expirado o autorizacion, cerrar la sesión
      if (error.response.status === 401 || 
        (error.response.data && error.response.data.expired)) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
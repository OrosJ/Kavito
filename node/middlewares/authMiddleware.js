import jwt from 'jsonwebtoken';

// verificar el token
export const authenticateToken = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1]; // Authorization: Bearer <token>

  if (!token) {
    return res.status(401).json({ msg: 'Token no proporcionado' }); // Si no hay token
  }

  // Verificar token con la clave secreta
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ msg: 'Token no válido o expirado' });
    }

    req.user = user; // Añadir información del usuario decodificada
    next();
  });
};

//verificar roles
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    // Si no hay información de usuario o rol, denegar acceso
    if (!req.user || !req.user.role) {
      return res.status(403).json({ msg: 'Acceso denegado' });
    }

    // Verificar si el rol del usuario está en los roles permitidos
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ msg: 'No tienes permiso para acceder a este recurso' });
    }

    next();
  };
};
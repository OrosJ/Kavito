import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
  // Obtenemos el token del header Authorization
  const token = req.header('Authorization')?.split(' ')[1]; // Authorization: Bearer <token>

  if (!token) {
    return res.status(401).json({ msg: 'Token no proporcionado' }); // Si no hay token
  }

  // Verificamos el token con la clave secreta
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ msg: 'Token no válido o expirado' }); // Token inválido o expirado
    }

    /* console.log('Decoded JWT:', user); */
    req.user = { id: user.userId };
    /* console.log('User ID extracted from token:', req.user.id); */
    next(); // Continuamos con la siguiente función de la ruta
  });
};

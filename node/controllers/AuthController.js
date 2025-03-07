import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User  from '../models/UserModel.js';

// Controlador para el login
export const loginUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Buscar al usuario por nombre de usuario
    const user = await User.findOne({ where: { username } });
    
    if (!user) {
      return res.status(400).json({ msg: 'Usuario no encontrado' });
    }

    // Verificar la contraseña con bcrypt
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Contraseña incorrecta' });
    }

    // Generar el token JWT
    const payload = {
      userId: user.id,
      username: user.username,
      role: user.role
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1h' });

    // Enviar el token al cliente
    res.json({ token });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error del servidor' });
  }
};

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/UserModel.js";

// Middleware para verificar el token
export const verifyToken = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token no proporcionado" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Token no válido o expirado" });
    }
    req.user = user; // Añadir información del usuario decodificada
    next(); // Continuar con la ejecución de la ruta
  });
};

// Crear un nuevo usuario
export const createUser = async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      role,
    });

    res
      .status(201)
      .json({ message: "Usuario creado con éxito", user: newUser });
  } catch (error) {
    res.status(500).json({ message: "Error al crear usuario", error });
  }
};

// Autenticar usuario (login)
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Verificar la contraseña
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Contraseña incorrecta" });
    }

    // Crear un token JWT
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRY || "1h" }
    );

    res.status(200).json({
      message: "Login exitoso",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error en la autenticación", error });
  }
};

// Obtener todos los usuarios
export const getUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener los usuarios", error });
  }
};

// Obtener un usuario por ID
export const getUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener el usuario", error });
  }
};

// Actualizar un usuario por ID
export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { username, email, password, role } = req.body;

  try {
    // Buscar el usuario
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Verificar si se proporciona una nueva contraseña y, en caso afirmativo, encriptarla
    let hashedPassword = user.password;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // Actualizar el usuario
    await User.update(
      { username, email, password: hashedPassword, role },
      { where: { id } }
    );

    // Obtener el usuario actualizado
    const updatedUser = await User.findByPk(id);

    res
      .status(200)
      .json({ message: "Usuario actualizado con éxito", user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar el usuario", error });
  }
};

export const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    // Buscar al usuario por ID
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Eliminar el usuario
    await user.destroy();

    res.status(200).json({ message: "Usuario eliminado con éxito" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar el usuario", error });
  }
};

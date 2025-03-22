import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/UserModel.js";
import InventoryOutModel from "../models/InvOutModel.js";
import InventoryHistoryModel from "../models/InventoryHistoryModel.js";
import { ProjectProductHistory } from "../models/ProjectProductModel.js";

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
    const where = req.query.includeInactive === "true" ? {} : { activo: true };
    const users = await User.findAll({
      where,
      order: [["updatedAt", "DESC"]],
    });
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

    // Crear un objeto con los datos a actualizar
    const updateData = {
      username,
      email,
      role,
    };

    // Verificar si se proporciona una nueva contraseña y, en caso afirmativo, encriptarla
    let hashedPassword = user.password;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    // Actualizar el usuario solo con los campos en updateData
    await User.update(updateData, { where: { id } });

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
  try {
    const { id } = req.params;
    // Buscar al usuario por ID
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Verificar si hay salidas de inventario asociadas
    const inventoryOutsCount = await InventoryOutModel.count({
      where: { user_id: id },
    });

    if (inventoryOutsCount > 0) {
      return res.status(400).json({
        message: `No se puede eliminar este usuario porque tiene ${inventoryOutsCount} registros de salidas de inventario`,
        hasRelatedItems: true,
      });
    }

    // Verificar si hay historial de inventario asociado
    const inventoryHistoryCount = await InventoryHistoryModel.count({
      where: { user_id: id },
    });

    if (inventoryHistoryCount > 0) {
      return res.status(400).json({
        message: `No se puede eliminar este usuario porque tiene ${inventoryHistoryCount} registros en el historial de inventario`,
        hasRelatedItems: true,
      });
    }

    // Verificar si hay historial de proyecto asociado
    const projectHistoryCount = await ProjectProductHistory.count({
      where: { usuario_id: id },
    });

    if (projectHistoryCount > 0) {
      return res.status(400).json({
        message: `No se puede eliminar este usuario porque tiene ${projectHistoryCount} registros en el historial de proyectos`,
        hasRelatedItems: true,
      });
    }

    // Eliminar el usuario
    user.activo = false;
    await user.save();

    res.status(200).json({ message: "Usuario eliminado con éxito" });
  } catch (error) {
    console.error("Error al desactivar usuario:", error);
    res.status(500).json({ message: "Error al eliminar el usuario", error });
  }
};

export const deactivateUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar al usuario por ID
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // No permitir desactivar el último administrador
    if (user.role === "administrador") {
      const adminCount = await User.count({
        where: {
          role: "administrador",
          activo: true,
          id: {
            [Op.ne]: id, // No contar el usuario actual
          },
        },
      });

      if (adminCount === 0) {
        return res.status(400).json({
          message:
            "No se puede desactivar este usuario porque es el último administrador activo",
          hasRelatedItems: true,
        });
      }
    }

    // Desactivar el usuario
    user.activo = false;
    await user.save();

    res.status(200).json({
      message: "Usuario desactivado correctamente",
      info: "Este usuario ya no podrá iniciar sesión, pero sus registros históricos se mantienen",
    });
  } catch (error) {
    console.error("Error al desactivar usuario:", error);
    res.status(500).json({
      message: "Error al desactivar el usuario",
      error: error.message,
    });
  }
};

export const reactivateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    user.activo = true;
    await user.save();

    res.status(200).json({ message: "Usuario reactivado correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al reactivar el usuario", error });
  }
};

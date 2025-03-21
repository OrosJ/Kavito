import ClientModel from "../models/ClientModel.js";
import ProjectModel from "../models/ProjectModel.js";

export const getAllClients = async (req, res) => {
  try {
    const clients = await ClientModel.findAll({
        where: { activo: true }
    });
    res.json(clients);
  } catch (error) {
    res.json({ message: error.message });
  }
};

export const getClient = async (req, res) => {
  try {
    const client = await ClientModel.findAll({
      where: {
        id: req.params.id,
      },
    });
    res.json(client[0]);
  } catch (error) {
    res.json({ message: error.message });
  }
};

export const createClient = async (req, res) => {
  try {
    await ClientModel.create(req.body);
    res.json({
      message: "Cliente Creado",
    });
  } catch (error) {
    res.json({ message: error.message });
  }
};

export const updateClient = async (req, res) => {
  try {
    await ClientModel.update(req.body, {
      where: { id: req.params.id },
    });
    res.json({
      message: "Cliente Actualizado",
    });
  } catch (error) {
    res.json({ message: error.message });
  }
};

export const deleteClient = async (req, res) => {
  try {
    const { id } = req.params;
    // Verificar si el cliente existe
    const client = await ClientModel.findByPk(id);
    if (!client) {
      return res.status(404).json({
        message: "Cliente no encontrado",
      });
    }
    // Verificar si hay proyectos asociados al cliente
    const projectsCount = await ProjectModel.count({
      where: { client_id: id },
    });
    if (projectsCount > 0) {
      return res.status(400).json({
        message: `No se puede eliminar este cliente porque tiene ${projectsCount} proyectos asociados`,
        hasRelatedItems: true,
      });
    }
    // Desactivar el cliente
    client.activo = false;
    await client.save();

    res.json({
      message: "Cliente Eliminado",
    });
  } catch (error) {
    console.error("Error al desactivar cliente:", error);
    res.json({ message: error.message });
  }
};

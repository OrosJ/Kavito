import ProjectModel, { ProjectProduct } from "../models/ProjectModel.js";
import ProductModel from "../models/ProductModel.js";
import Client from "../models/ClientModel.js";
import { Op } from "sequelize";
import db from "../database/db.js";

// Obtener todos los proyectos
export const getProjects = async (req, res) => {
  try {
    const projects = await ProjectModel.findAll({
      include: [
        {
          model: ProductModel,
          through: { attributes: ["cantidad_requerida", "cantidad_entregada"] },
        },
      ],
    });
    res.json(projects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// Obtener un proyecto específico
export const getProject = async (req, res) => {
  try {
    const project = await ProjectModel.findByPk(req.params.id, {
      include: [
        {
          model: ProductModel,
          through: { attributes: ["cantidad_requerida", "cantidad_entregada"] },
        },
      ],
    });
    if (!project) {
      return res.status(404).json({ message: "Proyecto no encontrado" });
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Crear nuevo proyecto
export const createProject = async (req, res) => {
  const transaction = await db.transaction();
  try {
    console.log("Datos recibidos:", req.body);
    const {
      nombre,
      descripcion,
      fecha_inicio,
      fecha_entrega,
      productos,
      client_id,
      ...otrosDatos
    } = req.body;

    if (!nombre || !fecha_inicio || !fecha_entrega || !client_id) {
      throw new Error("Faltan campos requeridos");
    }

    const client = await Client.findByPk(client_id);
    if (!client) {
      throw new Error(`Cliente con ID ${client_id} no encontrado`);
    }

    const project = await ProjectModel.create(
      {
        nombre,
        descripcion,
        fecha_inicio,
        fecha_entrega,
        client_id,
        ...otrosDatos,
      },
      { transaction }
    );

    console.log("Proyecto creado:", project);

    if (productos && productos.length > 0) {
      for (const prod of productos) {
        console.log("Procesando producto:", prod); // Log de cada producto

        if (!prod.product_id || !prod.cantidad_requerida) {
          throw new Error("Datos de producto incompletos");
        }
        const producto = await ProductModel.findByPk(prod.product_id);
        if (!producto) {
          throw new Error(`Producto ${prod.product_id} no encontrado`);
        }

        await ProjectProduct.create(
          {
            projectId: project.id,
            productId: prod.product_id,
            cantidad_requerida: prod.cantidad_requerida,
            fecha_requerida: prod.fecha_requerida || null,
          },
          { transaction }
        );

        if (prod.reservar) {
          if (producto.cantidad < prod.cantidad_requerida) {
            throw new Error(`Stock insuficiente para ${producto.descripcion}`);
          }
          await producto.decrement("cantidad", {
            by: prod.cantidad_requerida,
            transaction,
          });
        }
      }
    }

    await transaction.commit();
    res.status(201).json({
      message: "Proyecto creado exitosamente",
      project: {
        ...project.toJSON(),
        productos: productos,
      },
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Error en createProject:", error);
    res
      .status(500)
      .json({
        message: error.message || "Error al crear el proyecto",
        error: error.toString(),
      });
  }
};

// Actualizar proyecto
export const updateProject = async (req, res) => {
  const transaction = await db.transaction();
  try {
    const { id } = req.params;
    const project = await ProjectModel.findByPk(id);

    if (!project) {
      return res.status(404).json({ message: "Proyecto no encontrado" });
    }

    await project.update(req.body, { transaction });

    if (req.body.productos) {
      // Eliminar productos anteriores
      await ProjectProduct.destroy({
        where: { projectId: id },
        transaction,
      });

      // Agregar nuevos productos
      for (const prod of req.body.productos) {
        await ProjectProduct.create(
          {
            projectId: id,
            ...prod,
          },
          { transaction }
        );
      }
    }

    await transaction.commit();
    res.json(project);
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ message: error.message });
  }
};

// Eliminar proyecto
export const deleteProject = async (req, res) => {
  const transaction = await db.transaction();
  try {
    const { id } = req.params;
    const project = await ProjectModel.findByPk(id);

    if (!project) {
      return res.status(404).json({ message: "Proyecto no encontrado" });
    }

    // Eliminar productos asociados
    await ProjectProduct.destroy({
      where: { projectId: id },
      transaction,
    });

    // Eliminar el proyecto
    await project.destroy({ transaction });

    await transaction.commit();
    res.json({ message: "Proyecto eliminado correctamente" });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ message: error.message });
  }
};

// Obtener proyectos próximos a vencer
export const getProjectsWithDeadlines = async (req, res) => {
  try {
    const hoy = new Date();
    const treintaDiasDespues = new Date();
    treintaDiasDespues.setDate(hoy.getDate() + 30);

    const projects = await ProjectModel.findAll({
      where: {
        fecha_entrega: {
          [Op.between]: [hoy, treintaDiasDespues],
        },
        estado: {
          [Op.notIn]: ["COMPLETADO", "CANCELADO"],
        },
      },
      include: [
        {
          model: ProductModel,
          through: {
            where: {
              estado: {
                [Op.not]: "ENTREGADO",
              },
            },
          },
        },
      ],
    });

    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Asignar producto a proyecto
export const assignProductToProject = async (req, res) => {
  const transaction = await db.transaction();
  try {
    const { projectId, productId, cantidad } = req.body;

    const projectProduct = await ProjectProduct.findOne({
      where: { projectId, productId },
    });

    if (!projectProduct) {
      throw new Error("Producto no asignado a este proyecto");
    }

    const product = await ProductModel.findByPk(productId, {
      transaction,
      lock: true,
    });

    if (product.cantidad < cantidad) {
      throw new Error("Stock insuficiente");
    }

    await product.decrement("cantidad", { by: cantidad, transaction });
    await projectProduct.increment("cantidad_entregada", {
      by: cantidad,
      transaction,
    });

    if (
      projectProduct.cantidad_entregada + cantidad >=
      projectProduct.cantidad_requerida
    ) {
      await projectProduct.update({ estado: "ENTREGADO" }, { transaction });
    }

    await transaction.commit();
    res.json({ message: "Producto asignado correctamente" });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ message: error.message });
  }
};

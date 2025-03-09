import {
  ProjectProduct,
  ProjectProductHistory,
} from "../models/ProjectProductModel.js";
import ProductModel from "../models/ProductModel.js";
import ProjectModel from "../models/ProjectModel.js";
import InventoryOutModel, {
  InventoryOutProduct,
} from "../models/InvOutModel.js";
import { Op } from "sequelize";
import db from "../database/db.js";

// Obtener Product por ID
export const getProjectProduct = async (req, res) => {
  try {
    const projectProduct = await ProjectProduct.findByPk(req.params.id, {
      include: [
        {
          model: ProductModel,
          as: "productItem",
          attributes: ["descripcion", "precio"],
        },
        {
          model: ProjectProductHistory,
          order: [["createdAt", "DESC"]],
        },
      ],
    });

    if (!projectProduct) {
      return res
        .status(404)
        .json({ message: "Producto de proyecto no encontrado" });
    }

    res.json(projectProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Actualizar estado y cantidades
export const updateProjectProduct = async (req, res) => {
  const transaction = await db.transaction();
  try {
    const { id } = req.params;
    const { cantidad_entregada, estado, notas } = req.body;

    const projectProduct = await ProjectProduct.findByPk(id, {
      include: [
        {
          model: ProductModel,
          as: "productitem",
        },
      ],
      transaction,
      lock: true,
    });

    if (!projectProduct) {
      return res
        .status(404)
        .json({ message: "Producto de proyecto no encontrado" });
    }

    const estadoAnterior = projectProduct.estado;
    const cantidadAnterior = projectProduct.cantidad_entregada;

    await projectProduct.update(
      {
        cantidad_entregada:
          cantidad_entregada || projectProduct.cantidad_entregada,
        estado: estado || projectProduct.estado,
        notas: notas || projectProduct.notas,
      },
      { transaction }
    );

    // Registrar en historial si hubo cambios
    if (estado !== estadoAnterior || cantidad_entregada !== cantidadAnterior) {
      await ProjectProductHistory.create(
        {
          project_product_id: id,
          tipo_cambio: "MODIFICACION",
          cantidad: cantidad_entregada - cantidadAnterior,
          estado_anterior: estadoAnterior,
          estado_nuevo: estado,
          motivo: notas,
          usuario_id: req.userId,
        },
        { transaction }
      );
    }

    await transaction.commit();
    res.json(projectProduct);
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ message: error.message });
  }
};

// Entregar productos
export const deliverProducts = async (req, res) => {
  const transaction = await db.transaction();
  try {
    const { id } = req.params;
    const { cantidad } = req.body;

    const projectProduct = await ProjectProduct.findByPk(id, {
      include: [
        {
          model: ProductModel,
          as: "productItem",
        },
      ],
      transaction,
      lock: true,
    });

    if (!projectProduct) {
      return res
        .status(404)
        .json({ message: "Producto de proyecto no encontrado" });
    }

    // Validar cantidad
    const cantidadPendiente =
      projectProduct.cantidad_requerida - projectProduct.cantidad_entregada;
    if (cantidad > cantidadPendiente) {
      throw new Error("La cantidad excede lo pendiente por entregar");
    }

    // Actualizar cantidades
    const nuevaCantidadEntregada = projectProduct.cantidad_entregada + cantidad;
    const nuevoEstado =
      nuevaCantidadEntregada >= projectProduct.cantidad_requerida
        ? "ENTREGADO"
        : "EN_PROCESO";

    await projectProduct.update(
      {
        cantidad_entregada: nuevaCantidadEntregada,
        estado: nuevoEstado,
      },
      { transaction }
    );

    // Registrar en historial
    await ProjectProductHistory.create(
      {
        project_product_id: id,
        tipo_cambio: "ENTREGA",
        cantidad,
        estado_anterior: projectProduct.estado,
        estado_nuevo: nuevoEstado,
        usuario_id: req.userId,
      },
      { transaction }
    );

    await transaction.commit();
    res.json({
      message: "Entrega registrada correctamente",
      projectProduct,
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ message: error.message });
  }
};

// Obtener historial
export const getHistory = async (req, res) => {
  try {
    const { id } = req.params;

    const history = await ProjectProductHistory.findAll({
      where: { project_product_id: id },
      order: [["createdAt", "DESC"]],
    });

    res.json(history);
  } catch (error) {
    console.error("Error al obtener el historial:", error);
    res
      .status(500)
      .json({ message: "Error al obtener el historial del producto" });
  }
};

// Reservar productos adicionales
export const reserveAdditional = async (req, res) => {
  const transaction = await db.transaction();
  try {
    const { id } = req.params;
    const { cantidad } = req.body;

    // Validación para no permitir reservas de 0
    if (!cantidad || cantidad <= 0) {
      return res
        .status(400)
        .json({ message: "La cantidad a reservar debe ser mayor a 0" });
    }

    const projectProduct = await ProjectProduct.findByPk(id, {
      include: [
        {
          model: ProductModel,
          as: "productitem",
        },
      ],
      transaction,
      lock: true,
    });

    if (!projectProduct) {
      return res
        .status(404)
        .json({ message: "Producto de proyecto no encontrado" });
    }

    // Verificar disponibilidad en stock
    const disponible =
      projectProduct.productItem.cantidad -
      projectProduct.productItem.cantidad_reservada;
    if (disponible < cantidad) {
      throw new Error("Stock insuficiente para reserva adicional");
    }

    // Actualizar reservas
    await projectProduct.increment("cantidad_reservada", {
      by: cantidad,
      transaction,
    });

    await projectProduct.productItem.increment("cantidad_reservada", {
      by: cantidad,
      transaction,
    });

    // Registrar en historial
    await ProjectProductHistory.create(
      {
        project_product_id: id,
        tipo_cambio: "RESERVA",
        cantidad,
        estado_anterior: projectProduct.estado,
        estado_nuevo: "RESERVADO",
        usuario_id: req.userId,
      },
      { transaction }
    );

    await transaction.commit();
    res.json({
      message: "Reserva adicional registrada correctamente",
      projectProduct,
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ message: error.message });
  }
};

// Reservar productos adicionales
export const reserveProjectProduct = async (req, res) => {
  const transaction = await db.transaction();
  try {
    const { id } = req.params;
    const { cantidad } = req.body;

    /* console.log('Iniciando reserva:', { id, cantidad }); */

    // Validación para no permitir reservas de 0
    if (!cantidad || cantidad <= 0) {
      return res
        .status(400)
        .json({ message: "La cantidad a reservar debe ser mayor a 0" });
    }

    const projectProduct = await ProjectProduct.findOne({
      where: { id },
      include: [
        {
          model: ProductModel,
          as: "productItem",
          required: true, // Esto asegura un INNER JOIN en lugar de LEFT JOIN
          attributes: ["id", "descripcion", "cantidad", "cantidad_reservada"],
        },
      ],
      transaction,
      lock: true,
    });

    /* console.log('ProjectProduct raw:', projectProduct); */
    if (!projectProduct) {
      throw new Error("Producto de proyecto no encontrado");
    }

    // Verificar si el producto está incluido correctamente
    if (!projectProduct.productItem) {
      throw new Error("Producto no encontrado en la relación");
    }

    const product = projectProduct.productItem;
    /* console.log('Producto encontrado:', product); */

    // Verificar explícitamente los valores
    const cantidadActual = Number(product.cantidad) || 0;
    const reservadaActual = Number(product.cantidad_reservada) || 0;
    const disponible = cantidadActual - reservadaActual;

    /*console.log('Valores de stock:', {
      cantidadActual,
      reservadaActual,
      disponible,
      cantidadSolicitada: Number(cantidad)
    }); */

    if (disponible < Number(cantidad)) {
      throw new Error(
        `Stock insuficiente. Disponible: ${disponible}, Solicitado: ${cantidad}`
      );
    }

    // Actualizar cantidades
    await product.increment("cantidad_reservada", {
      by: Number(cantidad),
      transaction,
    });

    await projectProduct.increment("cantidad_reservada", {
      by: Number(cantidad),
      transaction,
    });

    await projectProduct.update(
      {
        estado: "RESERVADO",
      },
      { transaction }
    );

    // Crear historial
    await ProjectProductHistory.create(
      {
        project_product_id: projectProduct.id,
        tipo_cambio: "RESERVA",
        cantidad: Number(cantidad),
        estado_anterior: projectProduct.estado,
        estado_nuevo: "RESERVADO",
        motivo: "Reserva adicional",
        usuario_id: req.userId,
      },
      { transaction }
    );

    await transaction.commit();

    // Obtener datos actualizados
    const updatedProjectProduct = await ProjectProduct.findByPk(id, {
      include: [
        {
          model: ProductModel,
          as: "productItem",
          attributes: [
            "id",
            "descripcion",
            "cantidad",
            "cantidad_reservada",
            "precio",
          ],
        },
      ],
    });

    res.json({
      message: "Reserva realizada correctamente",
      projectProduct: updatedProjectProduct, // Corregido: era updateProjectProduct
    });
  } catch (error) {
    if (transaction && !transaction.finished) {
      await transaction.rollback();
    }
    console.error("Error en reserva:", error);
    return res.status(500).json({ message: error.message });
  }
};

// entregas con integracion de salidas de inventario
export const deliverProjectProduct = async (req, res) => {
  const transaction = await db.transaction();
  try {
    const { id } = req.params;
    const { cantidad } = req.body;

    // Validación para no permitir entregas de 0
    if (!cantidad || cantidad <= 0) {
      return res
        .status(400)
        .json({ message: "La cantidad a entregar debe ser mayor a 0" });
    }

    const projectProduct = await ProjectProduct.findOne({
      where: { id },
      include: [
        {
          model: ProductModel,
          as: "productItem",
        },
        {
          model: ProjectModel,
          as: "projectItem",
        },
      ],
      transaction,
      lock: true,
    });

    if (!projectProduct) {
      throw new Error("Producto de proyecto no encontrado");
    }

    const cantidadPendiente =
      projectProduct.cantidad_requerida - projectProduct.cantidad_entregada;
    if (cantidad > cantidadPendiente) {
      throw new Error("La cantidad excede lo pendiente por entregar");
    }

    const fecha = new Date();
    const year = fecha.getFullYear().toString().substr(-2);
    const month = (fecha.getMonth() + 1).toString().padStart(2, "0");
    const day = fecha.getDate().toString().padStart(2, "0");

    const ultimaSalida = await InventoryOutModel.findOne({
      where: {
        createdAt: {
          [Op.gte]: new Date(fecha.setHours(0, 0, 0, 0)),
        },
      },
      order: [["createdAt", "DESC"]],
      transaction,
    });

    let secuencial = "001";
    if (ultimaSalida && ultimaSalida.codigo) {
      const ultimoSecuencial = parseInt(ultimaSalida.codigo.slice(-3)) + 1;
      secuencial = ultimoSecuencial.toString().padStart(3, "0");
    }

    const codigo = `S${year}${month}${day}${secuencial}`;

    const precio = parseFloat(projectProduct.productItem?.precio || 0);
    const subtotal = precio * cantidad;

    const inventoryOut = await InventoryOutModel.create(
      {
        codigo,
        user_id: req.userId || req.user?.id,
        obs: `Salida por proyecto: ${projectProduct.Project.nombre || ''} (ID: ${projectProduct.projectitem?.id || ''})`,
        total: subtotal,
      },
      { transaction }
    );

    await InventoryOutProduct.create(
      {
        invout_id: inventoryOut.id,
        product_id: projectProduct.productId,
        cantidad: cantidad,
        subtotal: subtotal,
      },
      { transaction }
    );

    await projectProduct.productItem.decrement("cantidad", {
      by: cantidad,
      transaction,
    });

    if (projectProduct.cantidad_reservada > 0) {
      const cantidadADesreservar = Math.min(
        cantidad,
        projectProduct.cantidad_reservada
      );
      await projectProduct.productItem.decrement("cantidad_reservada", {
        by: cantidadADesreservar,
        transaction,
      });
      await projectProduct.decrement("cantidad_reservada", {
        by: cantidadADesreservar,
        transaction,
      });
    }

    await projectProduct.increment("cantidad_entregada", {
      by: cantidad,
      transaction,
    });

    const nuevaCantidadEntregada =
      projectProduct.cantidad_entregada + parseInt(cantidad);
    const nuevoEstado =
      nuevaCantidadEntregada >= projectProduct.cantidad_requerida
        ? "ENTREGADO"
        : "EN PROCESO";

    await projectProduct.update(
      {
        estado: nuevoEstado,
      },
      { transaction }
    );

    await ProjectProductHistory.create(
      {
        project_product_id: projectProduct.id,
        tipo_cambio: "ENTREGA",
        cantidad,
        estado_anterior: projectProduct.estado,
        estado_nuevo: nuevoEstado,
        motivo: "Entrega de productos",
        usuario_id: req.userId,
      },
      { transaction }
    );

    await transaction.commit();

    // Obtener los datos actualizados incluyendo el precio del producto
    const updatedProjectProduct = await ProjectProduct.findByPk(id, {
      include: [
        {
          model: ProductModel,
          as: "productItem",
          attributes: [
            "id",
            "descripcion",
            "cantidad",
            "cantidad_reservada",
            "precio",
          ],
        },
      ],
    });

    // Incluir el precio en la respuesta
    const inventoryOutData = await InventoryOutModel.findByPk(inventoryOut.id, {
      include: [
        {
          model: ProductModel,
          as: "productos",
          through: {
            attributes: ["cantidad", "subtotal"],
          },
        },
      ],
    });

    res.json({
      message: "Entrega realizada correctamente",
      projectProduct: updatedProjectProduct,
      precio: precio,
      inventoryOut: inventoryOutData,
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ message: error.message });
  }
};

export const releaseReservation = async (req, res) => {
  const transaction = await db.transaction();
  try {
    const projectProduct = await ProjectProduct.findByPk(req.params.id, {
      include: [
        {
          model: ProductModel,
          as: "productItem",
        },
      ],
      transaction,
    });

    if (!projectProduct) {
      return res
        .status(404)
        .json({ message: "Producto del proyecto no encontrado" });
    }

    if (projectProduct.cantidad_reservada > 0) {
      await ProductModel.increment("cantidad_reservada", {
        by: -projectProduct.cantidad_reservada,
        where: { id: projectProduct.productId },
        transaction,
      });

      await projectProduct.update(
        {
          cantidad_reservada: 0,
          estado: "PENDIENTE",
        },
        { transaction }
      );

      await ProjectProductHistory.create(
        {
          project_product_id: projectProduct.id,
          tipo_cambio: "MODIFICACION",
          cantidad: -projectProduct.cantidad_reservada,
          estado_anterior: "RESERVADO",
          estado_nuevo: "PENDIENTE",
          motivo: "Liberación de reserva",
          usuario_id: req.userId,
        },
        { transaction }
      );
    }

    await transaction.commit();
    res.json({ message: "Reserva liberada exitosamente" });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ message: error.message });
  }
};

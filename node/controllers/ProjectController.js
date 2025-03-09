import ProjectModel from "../models/ProjectModel.js";
import {
  ProjectProduct,
  ProjectProductHistory,
} from "../models/ProjectProductModel.js";
import ProductModel from "../models/ProductModel.js";
import InventoryOutModel, {
  InventoryOutProduct,
} from "../models/InvOutModel.js";
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
          as: "products",
          through: {
            model: ProjectProduct,
            attributes: [
              "cantidad_requerida",
              "cantidad_entregada",
              "cantidad_reservada",
              "estado",
              "fecha_requerida",
            ],
          },
        },
        {
          model: Client,
          as: "client",
        },
      ],
      order: [["fecha_entrega", "ASC"]],
    });
    res.json(projects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// Obtener un proyecto específico con todos sus detalles
export const getProject = async (req, res) => {
  const transaction = await db.transaction();
  try {
    /* console.log("Buscando proyecto con ID:", req.params.id); */
    const project = await ProjectModel.findByPk(req.params.id, {
      include: [
        {
          model: ProductModel,
          as: "products",
          through: {
            model: ProjectProduct,
            attributes: [
              "id", // incluir el id para referencias
              "cantidad_requerida",
              "cantidad_entregada",
              "cantidad_reservada",
              "estado",
              "fecha_requerida",
            ],
          },
        },
        {
          model: Client,
          as: "client",
        },
      ],
      transaction,
    });

    /* console.log("Proyecto encontrado:", JSON.stringify(project, null, 2)); */

    if (!project) {
      await transaction.rollback();
      return res.status(404).json({ message: "Proyecto no encontrado" });
    }

    const projectProducts = project.products
      .map((p) => p.project_products.id)
      .filter((id) => id != null);

    let history = [];
    if (projectProducts.length > 0) {
      history = await ProjectProductHistory.findAll({
        where: {
          project_product_id: {
            [Op.in]: projectProducts,
          },
        },
        transaction,
      });
    }

    const projectData = project.toJSON();
    projectData.history = history;

    await transaction.commit();
    res.json(projectData);
  } catch (error) {
    if (transaction && !transaction.finished) {
      await transaction.rollback();
    }
    console.error("Error completo:", error);
    res.status(500).json({ message: error.message });
  }
};

// Crear nuevo proyecto
export const createProject = async (req, res) => {
  const transaction = await db.transaction();
  try {
    const {
      nombre,
      descripcion,
      fecha_inicio,
      fecha_entrega,
      productos,
      client_id,
      direccion,
      presupuesto,
      prioridad,
      ...otrosDatos
    } = req.body;

    // Validaciones
    if (!nombre || !fecha_inicio || !fecha_entrega || !client_id) {
      throw new Error("Faltan campos requeridos");
    }

    // Validar fechas
    const fechaInicio = new Date(fecha_inicio);
    const fechaEntrega = new Date(fecha_entrega);
    const hoy = new Date();

    hoy.setHours(0, 0, 0, 0);
    fechaInicio.setHours(0, 0, 0, 0);

    if (fechaInicio < hoy) {
      throw new Error("La fecha de inicio no puede ser anterior a hoy");
    }
    if (fechaEntrega <= fechaInicio) {
      throw new Error(
        "La fecha de entrega debe ser posterior a la fecha de inicio"
      );
    }

    // Validar cliente
    const client = await Client.findByPk(client_id);
    if (!client) {
      throw new Error(`Cliente con ID ${client_id} no encontrado`);
    }

    // Calcular costo total basado en los precios de los productos
    let costoTotal = 0;
    if (productos && productos.length > 0) {
      for (const prod of productos) {
        if (!prod.product_id || !prod.cantidad_requerida) {
          throw new Error("Datos de producto incompletos");
        }

        const producto = await ProductModel.findByPk(prod.product_id, {
          transaction,
        });

        if (!producto) {
          throw new Error(`Producto ${prod.product_id} no encontrado`);
        }

        // Agregar al costo total
        costoTotal += producto.precio * prod.cantidad_requerida;
      }
    }

    // Crear proyecto
    const project = await ProjectModel.create(
      {
        nombre,
        descripcion,
        fecha_inicio,
        fecha_entrega,
        client_id,
        direccion,
        costo: costoTotal,
        prioridad: prioridad || "MEDIA",
        estado: "PLANIFICACION",
      },
      { transaction }
    );

    /* console.log("Proyecto creado:", project.id); */

    // Procesar productos
    if (productos && productos.length > 0) {
      for (const prod of productos) {
        /* console.log("Procesando producto:", prod); */

        // Validar datos del producto
        if (!prod.product_id || !prod.cantidad_requerida) {
          throw new Error("Datos de producto incompletos");
        }

        if (prod.cantidad_requerida <= 0) {
          throw new Error(
            `La cantidad requerida debe ser mayor a 0 para el producto ${prod.product_id}`
          );
        }

        const producto = await ProductModel.findByPk(prod.product_id, {
          transaction,
          lock: true,
        });

        if (!producto) {
          throw new Error(`Producto ${prod.product_id} no encontrado`);
        }

        /* console.log("Producto encontrado:", producto.descripcion); */

        // Verificar disponibilidad si se quiere reservar
        if (prod.reservar) {
          const disponible =
            producto.cantidad - (producto.cantidad_reservada || 0);
          if (disponible < prod.cantidad_requerida) {
            throw new Error(
              `Stock insuficiente para ${producto.descripcion}. ` +
                `Disponible: ${disponible}, Requerido: ${prod.cantidad_requerida}`
            );
          }
        }

        try {
          // Crear relación proyecto-producto
          /* console.log("Creando ProjectProduct..."); */
          const projectProduct = await ProjectProduct.create(
            {
              projectId: project.id,
              productId: parseInt(prod.product_id),
              cantidad_requerida: parseInt(prod.cantidad_requerida),
              fecha_requerida: prod.fecha_requerida || null,
              estado: prod.reservar ? "RESERVADO" : "PENDIENTE",
              cantidad_reservada: prod.reservar
                ? parseInt(prod.cantidad_requerida)
                : 0,
              cantidad_entregada: 0,
              notas: null,
            },
            {
              transaction,
              returning: true,
            }
          );

          /* console.log("ProjectProduct creado con ID:", projectProduct.id); */

          // Si se solicita reservar
          if (prod.reservar) {
            // Actualizar stock del producto
            await producto.increment("cantidad_reservada", {
              by: parseInt(prod.cantidad_requerida),
              transaction,
            });

            /* console.log("Stock actualizado para producto:", producto.id); */

            // Crear registro en historial
            await ProjectProductHistory.create(
              {
                project_product_id: projectProduct.id,
                tipo_cambio: "RESERVA",
                cantidad: parseInt(prod.cantidad_requerida),
                estado_anterior: "PENDIENTE",
                estado_nuevo: "RESERVADO",
                motivo: "Reserva inicial al crear proyecto",
                usuario_id: req.userId || null,
              },
              { transaction }
            );

            /* console.log("Historial creado"); */
          }
        } catch (error) {
          console.error("Error detallado al crear ProjectProduct:", error);
          throw new Error(
            `Error al procesar producto ${producto.descripcion}: ${error.message}`
          );
        }
      }
    }

    await transaction.commit();
    /* console.log("Transacción completada"); */

    // Obtener el proyecto completo con sus relaciones
    const projectComplete = await ProjectModel.findByPk(project.id, {
      include: [
        {
          model: ProductModel,
          as: "products",
          through: {
            attributes: [
              "cantidad_requerida",
              "cantidad_entregada",
              "cantidad_reservada",
              "estado",
              "fecha_requerida",
            ],
          },
        },
        {
          model: Client,
          as: "client",
        },
      ],
    });

    res.status(201).json({
      message: "Proyecto creado exitosamente",
      project: projectComplete,
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Error en createProject:", error);
    res.status(500).json({
      message: error.message || "Error al crear el proyecto",
    });
  }
};

// Actualizar proyecto
export const updateProject = async (req, res) => {
  const transaction = await db.transaction();
  try {
    const { id } = req.params;
    const {
      nombre,
      descripcion,
      fecha_inicio,
      fecha_entrega,
      productos,
      client_id,
      presupuesto,
    } = req.body;

    const project = await ProjectModel.findByPk(id, {
      include: [
        {
          model: ProductModel,
          as: "products",
          through: {
            attributes: ["id", "cantidad_reservada", "estado"],
          },
        },
      ],
      transaction,
    });

    if (!project) {
      return res.status(404).json({ message: "Proyecto no encontrado" });
    }

    if (project.estado === "COMPLETADO" || project.estado === "CANCELADO") {
      throw new Error(
        `No se puede modificar un proyecto ${project.estado.toLowerCase()}`
      );
    }

    // Calcular nuevo costo si hay cambios en los productos
    let nuevoCosto = parseFloat(project.costo) || 0;

    if (productos && productos.length > 0) {
      nuevoCosto = 0; // Recalcular todo el costo

      for (const prod of productos) {
        if (!prod.product_id || !prod.cantidad_requerida) {
          throw new Error("Datos de producto incompletos");
        }

        // NUEVO: Validar que la cantidad sea mayor a cero
        if (prod.cantidad_requerida <= 0) {
          throw new Error(
            `La cantidad requerida debe ser mayor a 0 para el producto ${prod.product_id}`
          );
        }

        const producto = await ProductModel.findByPk(prod.product_id, {
          transaction,
        });

        if (!producto) {
          throw new Error(`Producto ${prod.product_id} no encontrado`);
        }

        // Sumar al costo total
        nuevoCosto += producto.precio * prod.cantidad_requerida;
      }
    }

    await project.update(
      {
        nombre,
        descripcion,
        fecha_inicio,
        fecha_entrega,
        client_id,
        costo: nuevoCosto,
      },
      { transaction }
    );

    if (productos) {
      // Liberar reservas
      for (const producto of project.products) {
        if (producto.project_products.cantidad_reservada > 0) {
          await ProductModel.increment("cantidad_reservada", {
            by: -producto.project_products.cantidad_reservada,
            where: { id: producto.id },
            transaction,
          });
        }
      }

      // Eliminar productos
      await ProjectProduct.destroy({
        where: { projectId: id },
        transaction,
      });

      // Agregar nuevos productos
      for (const prod of productos) {
        const producto = await ProductModel.findByPk(prod.product_id, {
          transaction,
          lock: true,
        });

        if (!producto) {
          throw new Error(`Producto ${prod.product_id} no encontrado`);
        }

        await ProjectProduct.create(
          {
            projectId: id,
            productId: prod.product_id,
            cantidad_requerida: prod.cantidad_requerida,
            fecha_requerida: prod.fecha_requerida || null,
            estado: "PENDIENTE",
            cantidad_reservada: 0,
            cantidad_entregada: 0,
          },
          { transaction }
        );
      }
    }

    await transaction.commit();

    const updatedProject = await ProjectModel.findByPk(id, {
      include: [
        {
          model: ProductModel,
          as: "products",
          through: {
            attributes: [
              "cantidad_requerida",
              "cantidad_entregada",
              "cantidad_reservada",
              "estado",
              "fecha_requerida",
            ],
          },
        },
        {
          model: Client,
          as: "client",
        },
      ],
    });

    res.json({
      message: "Proyecto actualizado exitosamente",
      project: updatedProject,
    });
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
    const project = await ProjectModel.findByPk(id, {
      include: [
        {
          model: ProductModel,
          as: "products",
          through: ProjectProduct,
        },
      ],
      transaction,
    });

    if (!project) {
      return res.status(404).json({ message: "Proyecto no encontrado" });
    }

    // No permitir eliminar proyectos completados
    if (project.estado === "COMPLETADO") {
      throw new Error("No se pueden eliminar proyectos completados");
    }

    // Liberar productos reservados
    for (const producto of project.products) {
      const projectProduct = producto.project_products;
      if (projectProduct.cantidad_reservada > 0) {
        await producto.decrement("cantidad_reservada", {
          by: projectProduct.cantidad_reservada,
          transaction,
        });
      }
    }

    // Eliminar registros relacionados
    await ProjectProductHistory.destroy({
      where: {
        project_product_id: {
          [Op.in]: project.products.map((p) => p.project_products.id),
        },
      },
      transaction,
    });

    await project.destroy({ transaction });

    await transaction.commit();
    res.json({
      message: "Proyecto eliminado correctamente",
      projectId: id,
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ message: error.message });
  }
};

// Actualizar estado del proyecto
export const updateProjectStatus = async (req, res) => {
  const transaction = await db.transaction();
  try {
    const { id } = req.params;
    const { estado, motivo, notas } = req.body;
    const userId = req.userId || req.user?.id;

    if (!userId) {
      throw new Error("Usuario no autenticado");
    }

    const project = await ProjectModel.findByPk(id, {
      include: [
        {
          model: ProductModel,
          as: "products",
          through: {
            attributes: [
              "id",
              "cantidad_requerida",
              "cantidad_entregada",
              "cantidad_reservada",
            ],
          },
        },
        {
          model: Client,
          as: "client",
        },
      ],
      transaction,
    });

    if (!project) {
      await transaction.rollback();
      return res.status(404).json({ message: "Proyecto no encontrado" });
    }

    // Validar transiciones de estado válidas
    const estadoAnterior = project.estado;
    const transicionesValidas = {
      PLANIFICACION: ["EN_PROGRESO", "CANCELADO"],
      EN_PROGRESO: ["PAUSADO", "COMPLETADO", "CANCELADO"],
      PAUSADO: ["EN_PROGRESO", "CANCELADO"],
      COMPLETADO: [],
      CANCELADO: [],
    };

    if (!transicionesValidas[estadoAnterior].includes(estado)) {
      await transaction.rollback();
      return res.status(400).json({
        message: `No se puede cambiar el estado de ${estadoAnterior} a ${estado}`,
      });
    }

    let inventoryOut = null;

    if (estado === "COMPLETADO") {
      // Verificar que todos los productos requeridos estén disponibles
      for (const producto of project.products) {
        const projectProduct = producto.project_products;
        const cantidadPendiente =
          projectProduct.cantidad_requerida - projectProduct.cantidad_entregada;

        if (cantidadPendiente > 0) {
          const stockDisponible =
            producto.cantidad -
            (producto.cantidad_reservada - projectProduct.cantidad_reservada);

          if (stockDisponible < cantidadPendiente) {
            await transaction.rollback();
            return res.status(400).json({
              message: `Stock insuficiente para completar el proyecto. Faltantes en producto: ${producto.descripcion}`,
            });
          }
        }
      }

      // Generar salida de inventario
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
      let total = 0;

      // Crear salida de inventario
      inventoryOut = await InventoryOutModel.create(
        {
          codigo,
          user_id: userId,
          obs: `Salida por finalización de proyecto: ${project.nombre} (ID: ${project.id})`,
          total: 0, // Se actualizará después de procesar todos los productos
        },
        { transaction }
      );

      // Procesar cada producto del proyecto
      for (const producto of project.products) {
        const projectProduct = producto.project_products;
        const cantidadPendiente =
          projectProduct.cantidad_requerida - projectProduct.cantidad_entregada;

        if (cantidadPendiente > 0) {
          const stockDisponible =
            producto.cantidad -
            (producto.cantidad_reservada - projectProduct.cantidad_reservada);

          if (stockDisponible < cantidadPendiente) {
            await transaction.rollback();
            return res.status(400).json({
              message: `Stock insuficiente para el producto ${producto.descripcion}`,
            });
          }

          // Calcular subtotal
          const subtotal = parseFloat(producto.precio) * cantidadPendiente;
          total += subtotal;

          // Registrar en salida
          await InventoryOutProduct.create(
            {
              invout_id: inventoryOut.id,
              product_id: producto.id,
              cantidad: cantidadPendiente,
              subtotal: subtotal,
            },
            { transaction }
          );

          // Actualizar stock y reservas
          await producto.decrement("cantidad", {
            by: cantidadPendiente,
            transaction,
          });

          if (projectProduct.cantidad_reservada > 0) {
            await producto.decrement("cantidad_reservada", {
              by: projectProduct.cantidad_reservada,
              transaction,
            });
          }

          // Actualizar estado del producto en el proyecto
          await projectProduct.update(
            {
              estado: "ENTREGADO",
              cantidad_entregada: projectProduct.cantidad_requerida,
              cantidad_reservada: 0,
            },
            { transaction }
          );

          // Registrar en historial
          await ProjectProductHistory.create(
            {
              project_product_id: projectProduct.id,
              tipo_cambio: "ENTREGA",
              cantidad: cantidadPendiente,
              estado_anterior: projectProduct.estado,
              estado_nuevo: "ENTREGADO",
              usuario_id: userId,
            },
            { transaction }
          );
        }
      }

      // Actualizar total de la salida
      await inventoryOut.update({ total }, { transaction });
    } else if (estado === "CANCELADO") {
      // Liberar todas las reservas existentes
      for (const producto of project.products) {
        if (producto.project_products.cantidad_reservada > 0) {
          await ProductModel.increment("cantidad_reservada", {
            by: -producto.project_products.cantidad_reservada,
            where: { id: producto.id },
            transaction,
          });

          await producto.project_products.update(
            {
              estado: "CANCELADO",
              cantidad_reservada: 0,
            },
            { transaction }
          );

          await ProjectProductHistory.create(
            {
              project_product_id: producto.project_products.id,
              tipo_cambio: "CANCELACION",
              cantidad: producto.project_products.cantidad_reservada,
              estado_anterior: producto.project_products.estado,
              estado_nuevo: "CANCELADO",
              motivo: motivo || "Cancelación del proyecto",
              usuario_id: userId,
            },
            { transaction }
          );
        }
      }
    }

    // Actualizar estado del proyecto
    await project.update(
      {
        estado,
        ...(estado === "COMPLETADO" && { fecha_completado: new Date() }),
        ...(estado === "CANCELADO" && { motivo_cancelacion: motivo }),
        ...(notas && { notas_cierre: notas }),
      },
      { transaction }
    );

    await transaction.commit();
    /* console.log("Transacción completada exitosamente"); */

    try {
      /* console.log("Obteniendo proyecto actualizado..."); */
      // Obtener el proyecto actualizado con toda su información
      const projectUpdated = await ProjectModel.findByPk(id, {
        include: [
          {
            model: ProductModel,
            as: "products",
            through: {
              attributes: [
                "cantidad_requerida",
                "cantidad_entregada",
                "cantidad_reservada",
                "estado",
                "fecha_requerida",
              ],
            },
          },
          {
            model: Client,
            as: "client",
          },
        ],
      });
      console.log("Proyecto actualizado obtenido correctamente");

      console.log("Obteniendo datos de salida...");
      // Si se completó el proyecto y generó una salida, obtenemos sus datos
      let inventoryOutData = null;
      if (estado === "COMPLETADO" && inventoryOut) {
        inventoryOutData = await InventoryOutModel.findByPk(inventoryOut.id, {
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
        /* console.log("Datos de salida obtenidos correctamente"); */
      }

      /* console.log("Preparando respuesta..."); */
      const respuesta = {
        message: `Proyecto ${estado.toLowerCase()} exitosamente`,
        project: projectUpdated,
        inventoryOut: inventoryOutData,
      };
      /* console.log("Respuesta preparada correctamente"); */

      /* console.log("Enviando respuesta al cliente..."); */

      return res.json({ respuesta });
    } catch (secondaryError) {
      console.error("Error después del commit:", secondaryError);
      return res.json({
        message: `Proyecto ${estado.toLowerCase()} exitosamente`,
        projectId: id,
        estado: estado,
      });
    }
  } catch (error) {
    // error en la transacción principal
    if (transaction && !transaction.finished) {
      await transaction.rollback();
    }
    /* console.error("Error en updateProjectStatus:", error); */
    return res.status(500).json({
      message: error.message || "Error al actualizar el estado del proyecto",
    });
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
          as: "products",
          through: {
            where: {
              estado: {
                [Op.not]: "ENTREGADO",
              },
            },
          },
        },
        {
          model: Client,
          as: "client",
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
    const { projectId, productId, cantidad, reservar } = req.body;

    // Validar que la cantidad sea mayor a 0
    if (!cantidad || cantidad <= 0) {
      return res
        .status(400)
        .json({ message: "La cantidad debe ser mayor a 0" });
    }

    const projectProduct = await ProjectProduct.findOne({
      where: { projectId, productId },
      transaction,
      lock: true,
    });

    if (!projectProduct) {
      throw new Error("Producto no asignado a este proyecto");
    }

    const product = await ProductModel.findByPk(productId, {
      transaction,
      lock: true,
    });

    if (!product) {
      throw new Error("Producto no encontrado");
    }

    // Verificar disponibilidad si se quiere reservar
    if (reservar) {
      const disponible = product.cantidad - product.cantidad_reservada;
      if (disponible < cantidad) {
        throw new Error(
          `Stock insuficiente para reservar. Disponible: ${disponible}, Solicitado: ${cantidad}`
        );
      }

      // Actualizar reserva en el producto
      await product.increment("cantidad_reservada", {
        by: cantidad,
        transaction,
      });

      // Actualizar reserva en la relación proyecto-producto
      await projectProduct.increment("cantidad_reservada", {
        by: cantidad,
        transaction,
      });

      // Actualizar estado si es necesario
      if (projectProduct.estado === "PENDIENTE") {
        await projectProduct.update(
          {
            estado: "RESERVADO",
          },
          { transaction }
        );
      }
    }

    // Registrar en el historial
    await ProjectProductHistory.create(
      {
        project_product_id: projectProduct.id,
        tipo_cambio: reservar ? "RESERVA" : "MODIFICACION",
        cantidad,
        estado_anterior: projectProduct.estado,
        estado_nuevo: reservar ? "RESERVADO" : projectProduct.estado,
        usuario_id: req.userId,
      },
      { transaction }
    );

    await transaction.commit();

    // Obtener datos actualizados
    const updatedProjectProduct = await ProjectProduct.findOne({
      where: { projectId, productId },
      include: [{ ProductModel, as: "Product" }],
    });

    res.json({
      message: "Producto actualizado correctamente",
      projectProduct: updatedProjectProduct,
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Error en assignProductToProject:", error);
    res.status(500).json({
      message: error.message || "Error al asignar producto al proyecto",
    });
  }
};

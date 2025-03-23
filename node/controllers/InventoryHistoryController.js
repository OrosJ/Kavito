import InventoryHistoryModel from "../models/InventoryHistoryModel.js";
import ProductModel from "../models/ProductModel.js";
import UserModel from "../models/UserModel.js";
import db from "../database/db.js";
import { Op } from "sequelize";

// Obtener historial de inventario (entradas/modificaciones)
export const getInventoryHistory = async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      tipo,
      productId,
      sortBy = "fecha", 
      orderDir = "DESC",
      showInactiveProducts = false,
    } = req.query;

    // Construir la consulta base
    const query = {
      include: [
        {
          model: ProductModel,
          as: "producto",
          attributes: ["id", "descripcion", "precio", "image"],
          where: showInactiveProducts === "true" ? {} : { activo: true },
          include: [
            {
              model: CategoryModel,
              attributes: ["categoryname"],
              as: "category",
            },
          ],
        },
        {
          model: UserModel,
          as: "usuario",
          attributes: ["id", "username"],
        },
      ],
      order: [["fecha", "DESC"]],
    };

    // Filtrar por fechas si se proporcionan
    if (startDate && endDate) {
      query.where = {
        ...query.where,
        fecha: {
          [Op.between]: [new Date(startDate), new Date(endDate)],
        },
      };
    }

    // Filtrar por tipo si se proporciona
    if (tipo) {
      query.where = {
        ...query.where,
        tipo,
      };
    }

    // Filtrar por producto si se proporciona
    if (productId) {
      query.where = {
        ...query.where,
        product_id: productId,
      };
    }

    // Configurar ordenamiento
    let order = [];

    switch (sortBy) {
      case "fecha":
        order.push(["fecha", orderDir]);
        break;
      case "tipo":
        order.push(["tipo", orderDir]);
        break;
      case "cantidad":
        order.push(["diferencia", orderDir]);
        break;
      default:
        order.push(["fecha", "DESC"]);
    }

    query.order = order;

    const history = await InventoryHistoryModel.findAll(query);

    // Transformar los resultados para simplificar la estructura y evitar duplicados
    const formattedHistory = history.map((item) => {
      const plainItem = item.get({ plain: true });

      // Si se requiere alguna transformación adicional para evitar duplicados

      // Formatear la URL de la imagen si existe
      if (plainItem.producto && plainItem.producto.image) {
        plainItem.producto.image = `http://localhost:8000/uploads/${plainItem.producto.image}`;
      }

      return plainItem;
    });

    res.json(formattedHistory);
  } catch (error) {
    console.error("Error en getInventoryHistory:", error);
    res.status(500).json({
      message: "Error al obtener el historial de inventario",
      error: error.message,
    });
  }
};

// Registrar un ingreso en el historial
export const registerInventoryEntry = async (req, res) => {
  try {
    const { product_id, cantidad, motivo } = req.body;

    // Verificar que el producto exista
    const product = await ProductModel.findByPk(product_id);
    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    // Registrar la transacción en el historial
    const historyRecord = await InventoryHistoryModel.create({
      tipo: "ENTRADA",
      product_id,
      cantidad_anterior: product.cantidad,
      cantidad_nueva: product.cantidad + cantidad,
      diferencia: cantidad,
      motivo: motivo || "Entrada manual de inventario",
      user_id: req.userId || req.user?.id,
      fecha: new Date(),
    });

    // Actualizar el producto
    await product.increment("cantidad", { by: cantidad });

    res.status(201).json({
      message: "Entrada de inventario registrada con éxito",
      historyRecord,
    });
  } catch (error) {
    console.error("Error en registerInventoryEntry:", error);
    res.status(500).json({
      message: "Error al registrar la entrada de inventario",
      error: error.message,
    });
  }
};

// Función auxiliar para registrar modificaciones (será llamada desde ProductController)
export const recordInventoryChange = async (
  productId,
  cantidadAnterior,
  cantidadNueva,
  tipo,
  motivo,
  userId,
  transaction = null
) => {
  try {
    /*     console.log("recordInventoryChange called with params:", {
      productId,
      cantidadAnterior,
      cantidadNueva,
      tipo,
      motivo,
      userId,
      withTransaction: !!transaction,
    }); */

    /*     if (!productId) {
      console.error("no se encontro el id de producto");
      throw new Error("se requiere Id de producto");
    } */

    const diferencia = cantidadNueva - cantidadAnterior;
    /* console.log(`diferencia calculada: ${diferencia}`); */

    // verificar tipo
    const validTypes = [
      "ENTRADA",
      "MODIFICACION",
      "ELIMINACION",
      "DESACTIVACION",
      "SALIDA",
    ];

    if (!validTypes.includes(tipo)) {
      console.error(
        `Valor invaido para tipo: ${tipo}. debe ser uno de: ${validTypes.join(
          ", "
        )}`
      );
      tipo = "MODIFICACION"; // Default
    }

    // Crear registro con o sin transaccion
    const options = transaction ? { transaction } : {};

    // Si no hay transaccion se crea una propia
    let localTransaction = null;
    let result = false;

    try {
      if (!transaction) {
        // Crear transaccion local
        localTransaction = await db.transaction({
          isolationLevel:
            db.Sequelize.Transaction.ISOLATION_LEVELS.READ_COMMITTED,
        });
        options.transaction = localTransaction;
      }

      // Crear el registro
      const record = await InventoryHistoryModel.create(
        {
          tipo: tipo,
          product_id: productId,
          cantidad_anterior: cantidadAnterior,
          cantidad_nueva: cantidadNueva,
          diferencia,
          motivo: motivo || "Modificación de cantidad",
          user_id: userId || null,
          fecha: new Date(),
        },
        options
      );

      // commit de la transaccion si se creo
      if (localTransaction) {
        await localTransaction.commit();
      }

      console.log("Successfully created inventory history record:", {
        id: record.id,
        tipo: record.tipo,
        product_id: record.product_id,
      });

      result = true;
    } catch (innerError) {
      //
      if (localTransaction) {
        await localTransaction.rollback();
      }
      throw innerError; //
    }

    // validar ID
    /*     if (!userId) {
      console.warn("No hay ID de usuario");
    } */

    return result;
  } catch (error) {
    console.error("Error in recordInventoryChange:", error);
    if (error.name === "SequelizeValidationError") {
      console.error("Validation errors:", error.errors);
    }
    return false;
  }
};

// Obtener estadísticas de inventario
export const getInventoryStats = async (req, res) => {
  try {
    const { period = "month" } = req.query;
    const today = new Date();

    let startDate;
    switch (period) {
      case "week":
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 7);
        break;
      case "month":
        startDate = new Date(today);
        startDate.setMonth(today.getMonth() - 1);
        break;
      case "year":
        startDate = new Date(today);
        startDate.setFullYear(today.getFullYear() - 1);
        break;
      default:
        startDate = new Date(today);
        startDate.setMonth(today.getMonth() - 1);
    }

    // Consultar entradas
    const entradas = await InventoryHistoryModel.findAll({
      where: {
        tipo: "ENTRADA",
        fecha: {
          [Op.between]: [startDate, today],
        },
      },
      attributes: [
        "fecha",
        [db.fn("SUM", db.col("diferencia")), "total_entradas"],
      ],
      group: [db.fn("DATE", db.col("fecha"))],
      order: [[db.literal("fecha"), "ASC"]],
    });

    const salidaRecords = await InventoryHistoryModel.findAll({
      where: {
        tipo: "SALIDA",
        fecha: {
          [Op.between]: [startDate, today],
        },
      },
      attributes: [
        "fecha",
        [db.fn("SUM", db.col("diferencia")), "total_salidas_hist"],
      ],
      group: [db.fn("DATE", db.col("fecha"))],
      order: [[db.literal("fecha"), "ASC"]],
    });

    // Consultar modificaciones positivas (incrementos)
    const incrementos = await InventoryHistoryModel.findAll({
      where: {
        tipo: "MODIFICACION",
        diferencia: {
          [Op.gt]: 0,
        },
        fecha: {
          [Op.between]: [startDate, today],
        },
      },
      attributes: [
        "fecha",
        [db.fn("SUM", db.col("diferencia")), "total_incrementos"],
      ],
      group: [db.fn("DATE", db.col("fecha"))],
      order: [[db.literal("fecha"), "ASC"]],
    });

    // Consultar salidas (desde InventoryOutModel para tener datos completos)
    const salidas = await db.query(
      `
      SELECT 
        DATE(createdAt) as fecha, 
        SUM(cantidad) as total_salidas 
      FROM inventory_out_products
      WHERE createdAt BETWEEN :startDate AND :endDate
      GROUP BY DATE(createdAt)
      ORDER BY fecha ASC
    `,
      {
        replacements: {
          startDate: startDate,
          endDate: today,
        },
        type: db.QueryTypes.SELECT,
      }
    );

    // Combinar los datos para el gráfico
    const dates = new Set();

    // Agregar todas las fechas a un conjunto
    entradas.forEach((e) => dates.add(e.fecha.toISOString().split("T")[0]));
    incrementos.forEach((i) => dates.add(i.fecha.toISOString().split("T")[0]));
    salidas.forEach((s) => dates.add(s.fecha));

    // Convertir a array y ordenar
    const sortedDates = Array.from(dates).sort();

    // Crear objeto de datos para el gráfico
    const chartData = sortedDates.map((date) => {
      const entrada = entradas.find(
        (e) => e.fecha.toISOString().split("T")[0] === date
      );
      const incremento = incrementos.find(
        (i) => i.fecha.toISOString().split("T")[0] === date
      );
      const salida = salidas.find((s) => s.fecha === date);

      return {
        fecha: date,
        entradas: entrada ? parseInt(entrada.dataValues.total_entradas) : 0,
        incrementos: incremento
          ? parseInt(incremento.dataValues.total_incrementos)
          : 0,
        salidas: salida ? parseInt(salida.total_salidas) : 0,
      };
    });

    res.json(chartData);
  } catch (error) {
    console.error("Error en getInventoryStats:", error);
    res.status(500).json({
      message: "Error al obtener estadísticas de inventario",
      error: error.message,
    });
  }
};

// Importación de CategoryModel (necesario para la consulta)
import CategoryModel from "../models/CategoryModel.js";

//InvOutController.js:
import InventoryOutModel, {
  InventoryOutProduct,
} from "../models/InvOutModel.js";
import ProductModel from "../models/ProductModel.js";
import UserModel from "../models/UserModel.js";
import { recordInventoryChange } from "../controllers/InventoryHistoryController.js";
import db from "../database/db.js";
import { Op } from "sequelize";

export const createInventoryOut = async (req, res) => {
  const { productos, obs } = req.body;
  const user_id = req.user.id;

  // rastrear cambios en productos
  const productChanges = [];

  const transaction = await db.transaction();

  try {
    // Validación de datos de entrada
    if (!productos || !Array.isArray(productos) || productos.length === 0) {
      return res
        .status(400)
        .json({ message: "La lista de productos es requerida." });
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
    });

    let secuencial = "001";
    if (ultimaSalida && ultimaSalida.codigo) {
      const ultimoSecuencial = parseInt(ultimaSalida.codigo.slice(-3)) + 1;
      secuencial = ultimoSecuencial.toString().padStart(3, "0");
    }

    const codigo = `S${year}${month}${day}${secuencial}`;

    const inventoryOut = await InventoryOutModel.create(
      {
        codigo,
        user_id,
        obs,
        total: 0,
      },
      { transaction }
    );

    let total = 0;

    // Procesar cada producto
    for (const producto of productos) {
      const { product_id, cantidad } = producto;

      if (!product_id || !cantidad || cantidad <= 0) {
        throw new Error(
          `Datos inválidos para producto: ${JSON.stringify(producto)}`
        );
      }

      // Buscar producto en el inventario
      const product = await ProductModel.findByPk(product_id, {
        transaction,
        lock: true,
      });

      if (!product) {
        throw new Error(`Producto con ID ${product_id} no encontrado.`);
      }

      // Verificar disponibilidad de inventario
      if (product.cantidad < cantidad) {
        throw new Error(
          `Stock insuficiente para producto ${product.descripcion}. Disponible: ${product.cantidad}`
        );
      }

      // Calcular subtotal
      const subtotal = parseFloat(product.precio) * cantidad;
      total += subtotal;

      // almacenar cantidad original para despues
      const cantidadAnterior = product.cantidad;
      const cantidadNueva = cantidadAnterior - cantidad;

      // Actualizar inventario del producto
      await product.decrement("cantidad", {
        by: cantidad,
        transaction,
      });

      // almacenar cambios en productos para el historial
      productChanges.push({
        product_id,
        cantidadAnterior,
        cantidadNueva,
        codigo,
      });

      // Crear la relación en la tabla intermedia
      await InventoryOutProduct.create(
        {
          invout_id: inventoryOut.id,
          product_id: product_id,
          cantidad: cantidad,
          subtotal: subtotal,
        },
        { transaction }
      );
    }

    await inventoryOut.update({ total }, { transaction });

    // Confirmar la transacción
    await transaction.commit();

    // ahora que el commit principal se realizo, registrar en el historial
    for (const change of productChanges) {
      try {
        await recordInventoryChange(
          change.product_id,
          change.cantidadAnterior,
          change.cantidadNueva,
          "SALIDA",
          `Salida de inventario: ${change.codigo}`,
          user_id,
          null // No transaction - this is a separate operation
        );
      } catch (historyError) {
        console.error("Error recording inventory history:", historyError);
        // Don't throw - we want to continue even if some history records fail
      }
    }

    const salidaCompleta = await InventoryOutModel.findByPk(inventoryOut.id, {
      include: [
        {
          model: ProductModel,
          as: "productos",
          through: { attributes: ["cantidad", "subtotal"] },
          attributes: ["descripcion", "id", "precio"],
        },
        {
          model: UserModel,
          attributes: ["username"],
        },
      ],
    });

    res.status(201).json({
      message: "Salida registrada con éxito.",
      inventoryOut: salidaCompleta,
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Error en createInventoryOut:", error);
    res.status(500).json({
      message: error.message || "Error al registrar la salida de inventario.",
    });
  }
};

export const getAllInventoryOuts = async (req, res) => {
  try {
    const salidas = await InventoryOutModel.findAll({
      include: [
        {
          model: UserModel,
          attributes: ["username", "email"],
        },
        {
          model: ProductModel,
          as: "productos",
          through: {
            attributes: ["cantidad", "subtotal"],
          },
          attributes: ["descripcion", "id", "precio"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    const formattedSalidas = salidas.map((salida) => {
      const salidaJSON = salida.toJSON();
      return {
        ...salidaJSON,
        usuario: salidaJSON.user?.username || "Sin usuario",
        productos: salidaJSON.productos.map((producto) => ({
          id: producto.id,
          descripcion: producto.descripcion,
          cantidad: producto.inventory_out_products.cantidad, // Acceder a la cantidad desde la tabla intermedia
          precio: producto.precio,
          subtotal: producto.inventory_out_products.subtotal,
        })),
      };
    });

    res.json(formattedSalidas);
  } catch (error) {
    console.error("Error detallado:", error);
    res.status(500).json({
      message: error.message,
      stack: error.stack,
    });
  }
};

export const updateInventoryOut = async (req, res) => {
  const { id } = req.params;
  const { cantidad, obs, product_id, user_id } = req.body;

  try {
    // Verificar si el registro de salida existe
    const inventoryOut = await InventoryOutModel.findByPk(id);
    if (!inventoryOut) {
      return res
        .status(404)
        .json({ message: "Registro de salida no encontrado" });
    }

    // Verificar si el producto existe
    const product = await ProductModel.findByPk(
      product_id || inventoryOut.product_id
    );
    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    // Calcular la diferencia de cantidad
    const diferencia = cantidad - inventoryOut.cantidad;

    // Verificar si hay suficiente inventario para realizar la operación
    if (product.cantidad - diferencia < 0) {
      return res
        .status(400)
        .json({ message: "Cantidad insuficiente en inventario" });
    }

    // Actualizar el inventario del producto
    product.cantidad -= diferencia;
    await product.save();

    // Actualizar el registro de salida
    await InventoryOutModel.update(
      { cantidad, obs, product_id, user_id },
      { where: { id } }
    );

    res.json({ message: "Registro actualizado con éxito" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getInventoryOutById = async (req, res) => {
  const { id } = req.params;

  try {
    // Buscar el registro de salida por ID incluyendo productos y usuario
    const inventoryOut = await InventoryOutModel.findByPk(id, {
      include: [
        {
          model: UserModel,
          attributes: ["username", "email"],
        },
        {
          model: ProductModel,
          as: "productos",
          through: {
            attributes: ["cantidad", "subtotal"],
          },
          attributes: ["descripcion", "id", "precio"],
        },
      ],
    });

    if (!inventoryOut) {
      return res
        .status(404)
        .json({ message: "Registro de salida no encontrado" });
    }

    // Formatear la respuesta
    const formattedSalida = {
      ...inventoryOut.toJSON(),
      usuario: inventoryOut.user?.username || "Sin usuario",
      productos: inventoryOut.productos.map((producto) => ({
        id: producto.id,
        descripcion: producto.descripcion,
        cantidad: producto.inventory_out_products.cantidad,
        precio: producto.precio,
        subtotal: producto.inventory_out_products.subtotal,
      })),
    };

    res.json(formattedSalida);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* export const deleteInventoryOut = async (req, res) => {
  const { id } = req.params;

  try {
    // Verificar si el registro de salida existe
    const inventoryOut = await InventoryOutModel.findByPk(id);
    if (!inventoryOut) {
      return res
        .status(404)
        .json({ message: "Registro de salida no encontrado" });
    }

    // Verificar si el producto existe
    const product = await ProductModel.findByPk(inventoryOut.product_id);
    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    // Devolver la cantidad al inventario
    product.cantidad += inventoryOut.cantidad;
    await product.save();

    // Eliminar el registro de salida
    await InventoryOutModel.destroy({ where: { id } });

    res.json({ message: "Registro eliminado con éxito" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; */

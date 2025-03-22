import ProductModel from "../models/ProductModel.js";
import CategoryModel from "../models/CategoryModel.js";
import { recordInventoryChange } from "../controllers/InventoryHistoryController.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { ProjectProduct } from "../models/ProjectProductModel.js";
import { InventoryOutProduct } from "../models/InvOutModel.js";
// Obtener la ruta del directorio raíz del proyecto
const rootDir = path.resolve(); // Esto nos da el directorio raíz del proyecto

// Definir la carpeta de uploads correctamente desde el directorio raíz
const uploadDir = path.join(rootDir, "uploads");

// Comprobar si el directorio de subida existe, si no, crearlo
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuración de Multer para subir imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Guardar las imágenes en la carpeta 'uploads'
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Crear un nombre único para la imagen (timestamp + extensión)
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

export const getAllProducts = async (req, res) => {
  try {
    // Incluyendo la categoría en la consulta
    const products = await ProductModel.findAll({
      where: { activo: true },
      include: [
        {
          model: CategoryModel,
          attributes: ["categoryname"], // Solo seleccionamos el campo `categoryname`
        },
      ],
      attributes: {
        include: [
          "id",
          "descripcion",
          "cantidad",
          "cantidad_reservada",
          "precio",
          "image",
        ],
      },
      order: [["updatedAt", "DESC"]],
    });

    // Combinar ambas transformaciones
    const formattedProducts = products.map((product) => {
      const productJSON = product.toJSON();
      return {
        ...productJSON,
        cantidad_disponible:
          product.cantidad - (product.cantidad_reservada || 0),
        image: product.image
          ? `http://localhost:8000/uploads/${product.image}`
          : null,
      };
    });

    res.status(200).json(formattedProducts);
  } catch (error) {
    console.error("Error al obtener productos:", error);
    res.json({ message: error.message });
  }
};

export const getProduct = async (req, res) => {
  try {
    const product = await ProductModel.findByPk(req.params.id, {
      include: [
        {
          model: CategoryModel,
          attributes: ["categoryname"],
        },
      ],
    });
    res.json(product);
  } catch (error) {
    res.json({ message: error.message });
  }
};

export const createProduct = async (req, res) => {
  const { descripcion, cantidad, precio, categoria } = req.body;

  let image = null;
  if (req.file) {
    image = req.file.filename;
  }

  try {
    // Validar que cantidad y precio sean mayores que cero
    if (parseInt(cantidad) <= 0) {
      return res.status(400).json({
        message: "La cantidad debe ser mayor que cero",
      });
    }

    if (parseFloat(precio) <= 0) {
      return res.status(400).json({
        message: "El precio debe ser mayor que cero",
      });
    }

    const userId = req.user?.id || req.userId;
    console.log("ID de usuario obtenido para historial:", userId);
    console.log("Datos de req.user:", req.user);

    const category = await CategoryModel.findByPk(categoria);
    if (!category) {
      return res.status(400).json({
        message: "La categoría no existe",
      });
    }

    const newProduct = await ProductModel.create({
      descripcion,
      cantidad,
      precio,
      categoria, //id
      image,
    });

    // Registrar en el historial como ENTRADA
    await recordInventoryChange(
      newProduct.id,
      0,
      cantidad,
      "ENTRADA",
      "Creación inicial del producto",
      userId
    );

    res.status(201).json({
      message: "Producto creado con éxito",
      product: newProduct,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProduct = async (req, res) => {
  const { descripcion, cantidad, precio, categoria } = req.body;

  try {
    // Validar que cantidad y precio sean mayores que cero si se proporcionan
    if (cantidad !== undefined && parseInt(cantidad) <= 0) {
      return res.status(400).json({
        message: "La cantidad debe ser mayor que cero",
      });
    }

    if (precio !== undefined && parseFloat(precio) <= 0) {
      return res.status(400).json({
        message: "El precio debe ser mayor que cero",
      });
    }
    
    // Verificar que la categoría exista si se pasa una nueva
    if (categoria) {
      const category = await CategoryModel.findByPk(categoria);
      if (!category) {
        return res.status(400).json({
          message: "La categoría no existe",
        });
      }
    }

    // Obtener el producto actual para comparar cambios
    const product = await ProductModel.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    const cantidadAnterior = product.cantidad;

    // Preparar el objeto de actualización
    const updateData = {
      descripcion,
      cantidad,
      precio,
      categoria,
    };

    // Solo actualizar la imagen si se proporciona una nueva
    if (req.file) {
      updateData.image = req.file.filename;
    }

    // Actualizar el producto
    await ProductModel.update(updateData, {
      where: { id: req.params.id },
    });

    // Registrar cambio en el historial si cambió la cantidad
    if (cantidad !== undefined && cantidad !== cantidadAnterior) {
      await recordInventoryChange(
        req.params.id,
        cantidadAnterior,
        cantidad,
        cantidad > cantidadAnterior ? "ENTRADA" : "MODIFICACION",
        "Actualización manual de cantidad",
        req.userId || req.user?.id
      );
    }

    res.json({
      message: "Producto actualizado con éxito",
    });
  } catch (error) {
    res.json({ message: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Intentando eliminar con ID: ${id}`);

    // Obtener el producto antes de eliminarlo
    const product = await ProductModel.findByPk(id);
    if (!product) {
      console.log(`Product with ID ${id} not found`);
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    console.log(`producto encontrado: ${product.descripcion}`);

    // Verificar si tiene reservas
    console.log(
      `Revisando reservas, reservas actuales: ${product.cantidad_reservada}`
    );
    if (product.cantidad_reservada > 0) {
      console.log(
        `Producto con reservas activas: ${product.cantidad_reservada}`
      );
      return res.status(400).json({
        message:
          "No se puede eliminar este producto porque tiene reservas activas",
        hasRelatedItems: true,
      });
    }

    // Verificar si está asociado a algún proyecto
    console.log("Revisando asociaciones...");
    const projectProductCount = await ProjectProduct.count({
      where: { productId: id },
    });
    console.log(`asciaciones encontradas con proyecto: ${projectProductCount}`);

    if (projectProductCount > 0) {
      console.log(`Producto asociado con ${projectProductCount} proyectos`);
      return res.status(400).json({
        message:
          "No se puede eliminar este producto porque está asociado a uno o más proyectos",
        hasRelatedItems: true,
      });
    }

    // Verificar si hay salidas asociadas
    console.log("Revisando salidas...");
    const outProductCount = await InventoryOutProduct.count({
      where: { product_id: id },
    });
    console.log(`salidas encontradas: ${outProductCount}`);

    if (outProductCount > 0) {
      console.log(`Producto tiene ${outProductCount} salidas`);
      return res.status(400).json({
        message:
          "No se puede eliminar este producto porque tiene salidas de inventario registradas",
        hasRelatedItems: true,
      });
    }

    // Extraer el ID del usuario de forma más explícita
    const userId = req.userId || (req.user && req.user.id);
    console.log("Usuario ID para historial de eliminación:", userId);

    console.log("About to record inventory change...");
    try {
      // Registrar en el historial
      const result = await recordInventoryChange(
        product.id,
        product.cantidad,
        0,
        "DESACTIVACION",
        "Desactivacion del producto",
        userId
      );
      console.log("cambio registrado:", result);
    } catch (error) {
      console.error("Error guardando el cambio:", recordError);
      throw recordError;
    }

    // "Eliminar" el producto
    console.log("Intentando desactivar el producto...");
    product.activo = false;
    await product.save();
    console.log("Producto desactivado correctamente");

    res.json({
      message: "Producto Desactivado",
    });
  } catch (error) {
    console.error("Error al desactivar producto:", error);
    res.json({ message: error.message });
  }
};

export const uploadImage = upload.single("image");

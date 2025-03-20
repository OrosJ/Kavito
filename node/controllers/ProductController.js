import ProductModel from "../models/ProductModel.js";
import CategoryModel from "../models/CategoryModel.js";
import { recordInventoryChange } from "../controllers/InventoryHistoryController.js";
import multer from "multer";
import path from "path";
import fs from "fs";

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
    // Obtener el producto antes de eliminarlo
    const product = await ProductModel.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    // Registrar en el historial como ELIMINACION
    await recordInventoryChange(
      product.id,
      product.cantidad,
      0,
      "ELIMINACION",
      "Eliminación del producto",
      req.userId || req.user?.id
    );

    // Eliminar el producto
    await ProductModel.destroy({
      where: { id: req.params.id },
    });
    res.json({
      message: "Producto Eliminado",
    });
  } catch (error) {
    res.json({ message: error.message });
  }
};

export const uploadImage = upload.single("image");

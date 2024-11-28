import ProductModel from "../models/ProductModel.js";
import CategoryModel from "../models/CategoryModel.js";
import multer from "multer";
import path from "path";
import fs from "fs";

// Obtener la ruta del directorio raíz del proyecto
const rootDir = path.resolve();  // Esto nos da el directorio raíz del proyecto

// Definir la carpeta de uploads correctamente desde el directorio raíz
const uploadDir = path.join(rootDir, 'uploads');

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
    });

    const updatedProducts = products.map((product) => {
      if (product.image) {
        product.image = `http://localhost:8000/uploads/${product.image}`;
      }
      return product;
    });

    res.json(updatedProducts);
  } catch (error) {
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
    image = req.file.filename; // Guardar el nombre del archivo de la imagen
  }

  try {
    // Verificar que la categoría exista
    const category = await CategoryModel.findByPk(categoria);
    if (!category) {
      return res.status(400).json({
        message: "La categoría no existe",
      });
    }

    // Crear el producto asociado a la categoría
    const newProduct = await ProductModel.create({
      descripcion,
      cantidad,
      precio,
      categoria, //id
      image,
    });

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

  let image = null;

  if (req.file) {
    image = req.file.filename; // Guardar el nuevo archivo de la imagen
  }

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

    // Actualizar el producto
    await ProductModel.update(
      {
        descripcion,
        cantidad,
        precio,
        categoria, // Este campo puede cambiarse, ya que la categoría es una FK
        image,
      },
      {
        where: { id: req.params.id },
      }
    );

    res.json({
      message: "Producto actualizado con éxito",
    });
  } catch (error) {
    res.json({ message: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
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

import CategoryModel from "../models/CategoryModel.js";
import ProductModel from "../models/ProductModel.js";

export const getAllCategories = async (req, res) => {
  try {
    const categories = await CategoryModel.findAll();
    res.json(categories);
  } catch (error) {
    res.json({ message: error.message });
  }
};

export const getCategory = async (req, res) => {
  try {
    const category = await CategoryModel.findAll({
      where: {
        id: req.params.id,
      },
    });
    res.json(category[0]);
  } catch (error) {
    res.json({ message: error.message });
  }
};

export const createCategory = async (req, res) => {
  try {
    await CategoryModel.create(req.body);
    res.json({
      message: "Categoria Creada",
    });
  } catch (error) {
    res.json({ message: error.message });
  }
};

export const updateCategory = async (req, res) => {
  try {
    await CategoryModel.update(req.body, {
      where: { id: req.params.id },
    });
    res.json({
      message: "Categoria Actualizada",
    });
  } catch (error) {
    res.json({ message: error.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si hay productos asociados a esta categoría
    const productsCount = await ProductModel.count({
      where: { categoria: id },
    });

    if (productsCount > 0) {
      return res.status(400).json({
        message: `No se puede eliminar esta categoría porque tiene ${productsCount} productos asociados`,
        hasRelatedItems: true,
      });
    }

    await CategoryModel.destroy({
      where: { id:id },
    });

    res.json({
      message: "Categoria Eliminada",
    });
  } catch (error) {
    res.json({ message: error.message });
  }
};

import ProductModel from "../models/ProductModel.js";
import CategoryModel from "../models/CategoryModel.js";

export const getAllProducts = async (req, res) => {
    try {
        // Incluyendo la categoría en la consulta
        const products = await ProductModel.findAll({
            include: [{
                model: CategoryModel,
                attributes: ['categoryname']  // Solo seleccionamos el campo `categoryname`
            }]
        });

        res.json(products);
    } catch (error) {
        res.json({ message: error.message });
    }
}

export const getProduct = async (req, res) => {
    try {
        const product = await ProductModel.findAll({
            where: {
                id:req.params.id
            }
        })
        res.json(product[0])
    } catch (error) {
        res.json ({message: error.message})
    }
}

export const createProduct = async (req, res) => {
    const { descripcion, cantidad, precio, categoria } = req.body;

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
            categoria, // Aquí se guarda el ID de la categoría
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
            where: {id:req.params.id}
        })
        res.json({
            "message":"Producto Eliminado"
        })
    } catch (error) {
        res.json ({message: error.message})
    }
}
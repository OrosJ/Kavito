import db from "../database/db.js";

import { DataTypes } from "sequelize";

import Category from './CategoryModel.js';

const ProductModel = db.define('products', {
    descripcion: {type: DataTypes.STRING},
    categoria: {
        type: DataTypes.INTEGER,
        references: {
          model: Category,  // Referencia al modelo Category
          key: 'id'         // clave primaria en Category
        },
        allowNull: false
      },
    cantidad: {type: DataTypes.NUMBER},
    precio: {type: DataTypes.STRING},
    image: { 
      type: DataTypes.STRING,
      allowNull: true,
    }
})

ProductModel.belongsTo(Category, { foreignKey: 'categoria' });  // Un producto pertenece a una categoría
Category.hasMany(ProductModel, { foreignKey: 'categoria' }); 

export default ProductModel
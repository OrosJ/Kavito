import db from "../database/db.js";
import { DataTypes } from "sequelize";
import Category from "./CategoryModel.js";

const ProductModel = db.define(
  "products",
  {
    descripcion: { type: DataTypes.STRING },
    categoria: {
      type: DataTypes.INTEGER,
      references: {
        model: Category, // Referencia al modelo Category
        key: "id", // clave primaria en Category
      },
      allowNull: false,
    },
    cantidad: { type: DataTypes.NUMBER },
    cantidad_reservada: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    precio: {
      type: DataTypes.DECIMAL(10, 2),
      validate: {
        isDecimal: true, // Validación para asegurarte de que sea decimal
        min: 0,
      },
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    getterMethods: {
      cantidad_disponible() {
        return this.cantidad - (this.cantidad_reservada || 0);
      },
    },
  }
);

ProductModel.belongsTo(Category, { foreignKey: "categoria" }); // Un producto pertenece a una categoría
Category.hasMany(ProductModel, { foreignKey: "categoria" });

export default ProductModel;

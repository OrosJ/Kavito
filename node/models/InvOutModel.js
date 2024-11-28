import { DataTypes } from "sequelize";
import db from "../database/db.js";
import ProductModel from "./ProductModel.js";
import User from "./UserModel.js";

const InventoryOutModel = db.define("invouts", {
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  obs: {
    type: DataTypes.STRING,
    allowNull: true,
  }
});

// Tabla intermedia para productos en una salida
export const InventoryOutProduct = db.define("inventory_out_products", {
  cantidad: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
});

// Relaciones
InventoryOutModel.belongsToMany(ProductModel, { 
  through: InventoryOutProduct,
  foreignKey: 'invout_id',
  otherKey: 'product_id',
  as: 'productos'
});
ProductModel.belongsToMany(InventoryOutModel, { 
  through: InventoryOutProduct,
  foreignKey: 'product_id',
  otherKey: 'invout_id',
  as: 'salidas'
});

InventoryOutModel.belongsTo(User, { foreignKey: "user_id"});
User.hasMany(InventoryOutModel, { foreignKey: "user_id" });

export default InventoryOutModel;
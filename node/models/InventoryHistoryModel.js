import { DataTypes } from "sequelize";
import db from "../database/db.js";
import ProductModel from "./ProductModel.js";
import UserModel from "./UserModel.js";

const InventoryHistoryModel = db.define("inventory_history", {
  tipo: {
    type: DataTypes.ENUM('ENTRADA', 'MODIFICACION', 'ELIMINACION', 'DESACTIVACION'),
    allowNull: false
  },
  cantidad_anterior: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  cantidad_nueva: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  diferencia: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  motivo: {
    type: DataTypes.STRING,
    allowNull: true
  },
  fecha: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
});

// Relaciones
InventoryHistoryModel.belongsTo(ProductModel, { 
  foreignKey: "product_id",
  as: "producto"
});

InventoryHistoryModel.belongsTo(UserModel, { 
  foreignKey: "user_id", 
  as: "usuario"
});

export default InventoryHistoryModel;
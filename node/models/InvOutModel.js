import { DataTypes } from "sequelize";
import db from "../database/db.js";
import ProductModel from "./ProductModel.js";
import User from "./UserModel.js";

const InventoryOutModel = db.define("invouts", {
  codigo: {
    type: DataTypes.STRING(15),
    allowNull: false,
    unique: true
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  obs: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
    validate: {
      min: 0
    }
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
});

// Tabla intermedia para productos en una salida
export const InventoryOutProduct = db.define("inventory_out_products", {
  cantidad: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1
    }
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
    validate: {
      min: 0
    }
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
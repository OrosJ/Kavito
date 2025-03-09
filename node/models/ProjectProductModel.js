import { DataTypes } from "sequelize";
import db from "../database/db.js";
import ProjectModel from "./ProjectModel.js";
import ProductModel from "./ProductModel.js";

const ProjectProduct = db.define("project_products", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  projectId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'projects',
      key: 'id'
    }
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'products',
      key: 'id'
    }
  },
  cantidad_requerida: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1
    }
  },
  cantidad_entregada: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  cantidad_reservada: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  estado: {
    type: DataTypes.ENUM(
      'PENDIENTE',
      'RESERVADO',
      'EN PROCESO',
      'ENTREGADO',
      'CANCELADO'
    ),
    defaultValue: 'PENDIENTE'
  },
  fecha_requerida: {
    type: DataTypes.DATE,
    allowNull: true
  },
  notas: {
    type: DataTypes.TEXT,
    allowNull: true
  }
});

// Historial de cambios en productos del proyecto
const ProjectProductHistory = db.define("project_product_histories", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  project_product_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'project_products',
      key: 'id'
    }
  },
  tipo_cambio: {
    type: DataTypes.ENUM('RESERVA', 'ENTREGA', 'CANCELACION', 'MODIFICACION'),
    allowNull: false
  },
  cantidad: {
    type: DataTypes.INTEGER
  },
  estado_anterior: {
    type: DataTypes.STRING
  },
  estado_nuevo: {
    type: DataTypes.STRING
  },
  motivo: {
    type: DataTypes.STRING
  },
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
});

export { ProjectProduct, ProjectProductHistory };
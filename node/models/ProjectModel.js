import { DataTypes } from "sequelize";
import db from "../database/db.js";
import ProductModel from "./ProductModel.js";
import ClientModel from "./ClientModel.js";
import { ProjectProduct } from "./ProjectProductModel.js";

const ProjectModel = db.define("projects", {
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  descripcion: DataTypes.TEXT,
  fecha_inicio: {
    type: DataTypes.DATE,
    allowNull: false
  },
  fecha_entrega: {
    type: DataTypes.DATE,
    allowNull: false
  },
  client_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
        model: ClientModel,
        key: 'id'
    }
  },
  estado: {
    type: DataTypes.ENUM('PLANIFICACION', 'EN_PROGRESO', 'PAUSADO', 'COMPLETADO', 'CANCELADO'),
    defaultValue: 'PLANIFICACION'
  },
  direccion: DataTypes.STRING,
  costo: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  prioridad: {
    type: DataTypes.ENUM('BAJA', 'MEDIA', 'ALTA'),
    defaultValue: 'MEDIA'
  },
  fecha_completado: DataTypes.DATE,
  motivo_cancelacion: DataTypes.STRING,
  notas_cierre: DataTypes.TEXT
});

export default ProjectModel;
import { DataTypes } from 'sequelize';
import db from '../database/db.js';

const Client = db.define('clients', {
  clientname: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false
  }
});

export default Client;

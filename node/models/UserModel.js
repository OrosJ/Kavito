import { DataTypes } from 'sequelize';
import db from '../database/db.js';

const User = db.define('users', {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('vendedor', 'administrador'),
    allowNull: false,
    defaultValue: 'vendedor',
  },
});

export default User;

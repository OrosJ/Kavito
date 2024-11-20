import { DataTypes } from 'sequelize';
import db from '../database/db.js';

const CategoryModel= db.define('categories', {
  categoryname: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  }
});

export default CategoryModel;

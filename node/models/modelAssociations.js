import ProjectModel from './ProjectModel.js';
import ProductModel from './ProductModel.js';
import { ProjectProduct, ProjectProductHistory } from './ProjectProductModel.js';

export const setupAssociations = () => {
  // Asociaciones para ProjectProduct
  ProjectModel.belongsToMany(ProductModel, { through: ProjectProduct });
  ProductModel.belongsToMany(ProjectModel, { through: ProjectProduct });
  
  // Asociaciones para ProjectProductHistory
  ProjectProduct.hasMany(ProjectProductHistory, {
    foreignKey: 'project_product_id',
    onDelete: 'CASCADE'
  });
  ProjectProductHistory.belongsTo(ProjectProduct, {
    foreignKey: 'project_product_id'
  });
};
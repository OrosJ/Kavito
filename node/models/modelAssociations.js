import ProjectModel from "./ProjectModel.js";
import ProductModel from "./ProductModel.js";
import ClientModel from './ClientModel.js';
import {
  ProjectProduct,
  ProjectProductHistory,
} from "./ProjectProductModel.js";

export const setupAssociations = () => {
  // Asociaciones para ProjectProduct
  ProjectModel.belongsToMany(ProductModel, {
    through: ProjectProduct,
    foreignKey: "projectId",
    otherKey: "productId",
    as: "products",
  });

  ProductModel.belongsToMany(ProjectModel, {
    through: ProjectProduct,
    foreignKey: "productId",
    otherKey: "projectId",
    as: "projects",
  });

  // Asociaciones para acceder directamente desde ProjectProduct
  ProjectProduct.belongsTo(ProductModel, {
    foreignKey: "productId",
    as: "productItem", // Alias
  });

  ProjectProduct.belongsTo(ProjectModel, {
    foreignKey: "projectId",
    as: "projectItem", // Alias utilizado en los controladores
  });

  // Asociaciones para ProjectProductHistory
  ProjectProduct.hasMany(ProjectProductHistory, {
    foreignKey: "project_product_id",
    onDelete: "CASCADE",
  });
  ProjectProductHistory.belongsTo(ProjectProduct, {
    foreignKey: "project_product_id",
  });

  ProjectModel.belongsTo(ClientModel, { 
    foreignKey: 'client_id',
    as: 'client'
  });
  
  ClientModel.hasMany(ProjectModel, { 
    foreignKey: 'client_id',
    as: 'projects'
  });
};

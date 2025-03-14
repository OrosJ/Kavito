import { Sequelize, DataTypes } from "sequelize";
import bcrypt from 'bcryptjs';

// Crear instancia de Sequelize para pruebas
const testDB = new Sequelize('kavito_test', 'root', '', {
  host: 'localhost',
  dialect: 'mysql',
  logging: false
});

// Función para inicializar la base de datos de pruebas
async function initTestDB() {
  try {
    console.log('Conectando explícitamente a: kavito_test');
    
    // Verificar conexión
    await testDB.authenticate();
    console.log('Conexión establecida correctamente a kavito_test');
    
    // Desactivar verificación de claves foráneas
    await testDB.query('SET FOREIGN_KEY_CHECKS = 0');
    
    // ========== DEFINICIÓN DE MODELOS ==========
    
    // User Model
    const UserModel = testDB.define('users', {
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

    // Category Model
    const CategoryModel = testDB.define('categories', {
      categoryname: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      }
    });

    // Client Model
    const ClientModel = testDB.define('clients', {
      clientname: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      }
    });

    // Product Model
    const ProductModel = testDB.define('products', {
      descripcion: { 
        type: DataTypes.STRING 
      },
      categoria: {
        type: DataTypes.INTEGER,
        references: {
          model: CategoryModel,
          key: "id",
        },
        allowNull: false,
      },
      cantidad: { 
        type: DataTypes.INTEGER 
      },
      cantidad_reservada: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: {
          min: 0,
        },
      },
      precio: {
        type: DataTypes.DECIMAL(10, 2),
        validate: {
          isDecimal: true,
          min: 0,
        },
      },
      image: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    });

    // Project Model
    const ProjectModel = testDB.define("projects", {
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

    // ProjectProduct Model
    const ProjectProduct = testDB.define("project_products", {
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

    // ProjectProductHistory Model
    const ProjectProductHistory = testDB.define("project_product_histories", {
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

    // InventoryOut Model
    const InventoryOutModel = testDB.define("invouts", {
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

    // InventoryOutProduct Model (tabla intermedia)
    const InventoryOutProduct = testDB.define("inventory_out_products", {
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

    // ========== CONFIGURACIÓN DE ASOCIACIONES ==========

    // Asociaciones de ProductModel
    ProductModel.belongsTo(CategoryModel, { foreignKey: "categoria" });
    CategoryModel.hasMany(ProductModel, { foreignKey: "categoria" });

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
      as: "productItem",
    });

    ProjectProduct.belongsTo(ProjectModel, {
      foreignKey: "projectId",
      as: "projectItem",
    });

    // Asociaciones para ProjectProductHistory
    ProjectProduct.hasMany(ProjectProductHistory, {
      foreignKey: "project_product_id",
      onDelete: "CASCADE",
    });
    ProjectProductHistory.belongsTo(ProjectProduct, {
      foreignKey: "project_product_id",
    });

    // Asociaciones para ProjectModel y ClientModel
    ProjectModel.belongsTo(ClientModel, { 
      foreignKey: 'client_id',
      as: 'client'
    });
    
    ClientModel.hasMany(ProjectModel, { 
      foreignKey: 'client_id',
      as: 'projects'
    });

    // Asociaciones para InventoryOutModel
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

    InventoryOutModel.belongsTo(UserModel, { foreignKey: "user_id"});
    UserModel.hasMany(InventoryOutModel, { foreignKey: "user_id" });

    // ========== SINCRONIZAR MODELOS Y CREAR TABLAS ==========
    
    // Forzar recreación de tablas
    await testDB.sync({ force: true });
    
    // Reactivar verificación
    await testDB.query('SET FOREIGN_KEY_CHECKS = 1');
    
    console.log('Todas las tablas creadas exitosamente');
    
    // ========== INSERCIÓN DE DATOS INICIALES ==========
    
    // Crear usuario administrador para pruebas
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await UserModel.create({
      username: 'Administrador',
      email: 'admin@test.com',
      password: hashedPassword,
      role: 'administrador'
    });
    console.log('Usuario administrador creado');
    
    // Crear categoría de prueba
    const category = await CategoryModel.create({
      categoryname: 'Categoría de Prueba'
    });
    console.log('Categoría de prueba creada');
    
    // Crear cliente de prueba
    const client = await ClientModel.create({
      clientname: 'Cliente de Prueba'
    });
    console.log('Cliente de prueba creado');
    
    // Crear producto de prueba
    const product = await ProductModel.create({
      descripcion: 'Producto de Prueba',
      categoria: category.id,
      cantidad: 100,
      precio: 25.50,
      image: 'test_image.jpg'
    });
    console.log('Producto de prueba creado');
    
    // Crear fecha del proyecto (hoy y mañana)
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    
    // Crear proyecto de prueba
    const project = await ProjectModel.create({
      nombre: 'Proyecto de Prueba',
      descripcion: 'Descripción del proyecto de prueba',
      fecha_inicio: today,
      fecha_entrega: tomorrow,
      client_id: client.id,
      direccion: 'Dirección de prueba',
      prioridad: 'MEDIA'
    });
    console.log('Proyecto de prueba creado');
    
    // Crear relación proyecto-producto
    const projectProduct = await ProjectProduct.create({
      projectId: project.id,
      productId: product.id,
      cantidad_requerida: 10,
      estado: 'PENDIENTE'
    });
    console.log('Relación proyecto-producto creada');
    
    console.log('Base de datos kavito_test inicializada completamente');
    
    // Cerrar conexión
    await testDB.close();
    process.exit(0);
  } catch (error) {
    console.error('Error al inicializar la base de datos de pruebas:', error);
    if (error.parent) {
      console.error('Error detallado:', error.parent.message);
    }
    process.exit(1);
  }
}

// Ejecutar inicialización
initTestDB();
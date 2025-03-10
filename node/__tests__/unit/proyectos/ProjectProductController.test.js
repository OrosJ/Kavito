import { jest } from '@jest/globals';

// Silenciar mensajes de consola solo para pruebas
/* console.error = () => {};
console.log = () => {};
console.warn = () => {}; */

// Crear mocks explícitos para transacciones
const mockTransactionRollback = jest.fn().mockResolvedValue(true);
const mockTransactionCommit = jest.fn().mockResolvedValue(true);
const mockTransaction = {
  commit: mockTransactionCommit,
  rollback: mockTransactionRollback
};

// Mock de los modelos
jest.unstable_mockModule('../../../models/ProjectProductModel.js', () => ({
  ProjectProduct: {
    findOne: jest.fn(),
    findByPk: jest.fn(),
    increment: jest.fn(),
    update: jest.fn()
  },
  ProjectProductHistory: {
    create: jest.fn(),
    findAll: jest.fn()
  }
}));

jest.unstable_mockModule('../../../models/ProductModel.js', () => ({
  default: {
    findByPk: jest.fn(),
    findOne: jest.fn(),
    increment: jest.fn(),
    decrement: jest.fn()
  }
}));

jest.unstable_mockModule('../../../models/ProjectModel.js', () => ({
  default: {
    findByPk: jest.fn()
  }
}));

jest.unstable_mockModule('../../../models/InvOutModel.js', () => ({
  default: {
    create: jest.fn(),
    findByPk: jest.fn(),
    findOne: jest.fn()
  },
  InventoryOutProduct: {
    create: jest.fn()
  }
}));

jest.unstable_mockModule('../../../database/db.js', () => ({
  default: {
    transaction: jest.fn().mockResolvedValue(mockTransaction),
    literal: jest.fn()
  }
}));

// Importaciones después de los mocks
const controllers = await import('../../../controllers/ProjectProductController.js');
const { 
  getProjectProduct, 
  updateProjectProduct, 
  deliverProducts, 
  getHistory,
  reserveProjectProduct,
  deliverProjectProduct,
  releaseReservation
} = controllers;

const ProjectProductModels = await import('../../../models/ProjectProductModel.js');
const { ProjectProduct, ProjectProductHistory } = ProjectProductModels;

const ProductModelModule = await import('../../../models/ProductModel.js');
const ProductModel = ProductModelModule.default;

const ProjectModelModule = await import('../../../models/ProjectModel.js');
const ProjectModel = ProjectModelModule.default;

const InvOutModelModule = await import('../../../models/InvOutModel.js');
const InventoryOutModel = InvOutModelModule.default;
const { InventoryOutProduct } = InvOutModelModule;

const dbModule = await import('../../../database/db.js');
const db = dbModule.default;

describe('ProjectProductController', () => {
  let req, res;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Configurar req y res
    req = {
      body: {},
      params: {},
      user: { id: 1, userId: 1 }
    };
    
    res = {
      json: jest.fn(() => res),
      status: jest.fn(() => res)
    };
  });
  
  describe('getProjectProduct', () => {
    test('debe retornar un producto de proyecto por ID', async () => {
      // Configurar parámetros
      req.params.id = '1';
      
      // Mock producto de proyecto
      const mockProjectProduct = {
        id: 1,
        projectId: 1,
        productId: 1,
        cantidad_requerida: 5,
        cantidad_entregada: 2,
        cantidad_reservada: 3,
        estado: 'EN_PROCESO',
        productItem: {
          id: 1,
          descripcion: 'Producto 1',
          precio: 100
        }
      };
      
      ProjectProduct.findByPk.mockResolvedValue(mockProjectProduct);
      
      // Llamar a la función
      await getProjectProduct(req, res);
      
      // Verificaciones
      expect(ProjectProduct.findByPk).toHaveBeenCalledWith('1', expect.objectContaining({
        include: expect.any(Array)
      }));
      expect(res.json).toHaveBeenCalledWith(mockProjectProduct);
    });
    
    test('debe retornar error si el producto de proyecto no existe', async () => {
      // Configurar parámetros
      req.params.id = '999';
      
      // Mock no encontrado
      ProjectProduct.findByPk.mockResolvedValue(null);
      
      // Llamar a la función
      await getProjectProduct(req, res);
      
      // Verificaciones
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Producto de proyecto no encontrado'
      }));
    });
  });
  
  describe('updateProjectProduct', () => {
    test('debe actualizar un producto de proyecto correctamente', async () => {
      // Configurar parámetros
      req.params.id = '1';
      req.body = {
        cantidad_entregada: 3,
        estado: 'EN_PROCESO',
        notas: 'Actualización de prueba'
      };
      
      // Mock producto de proyecto
      const mockProjectProduct = {
        id: 1,
        projectId: 1,
        productId: 1,
        cantidad_requerida: 5,
        cantidad_entregada: 2,
        cantidad_reservada: 3,
        estado: 'RESERVADO',
        update: jest.fn().mockResolvedValue([1])
      };
      
      ProjectProduct.findByPk.mockResolvedValue(mockProjectProduct);
      
      // Llamar a la función
      await updateProjectProduct(req, res);
      
      // Verificaciones
      expect(db.transaction).toHaveBeenCalled();
      expect(ProjectProduct.findByPk).toHaveBeenCalledWith('1', expect.objectContaining({
        include: expect.any(Array),
        transaction: mockTransaction
      }));
      
      expect(mockProjectProduct.update).toHaveBeenCalledWith(
        expect.objectContaining({
          cantidad_entregada: 3,
          estado: 'EN_PROCESO',
          notas: 'Actualización de prueba'
        }),
        expect.objectContaining({
          transaction: mockTransaction
        })
      );
      
      expect(ProjectProductHistory.create).toHaveBeenCalled();
      expect(mockTransactionCommit).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalled();
    });
    
    test('debe retornar error si el producto de proyecto no existe', async () => {
      // Configurar parámetros
      req.params.id = '999';
      req.body = {
        cantidad_entregada: 3
      };
      
      // Mock no encontrado
      ProjectProduct.findByPk.mockResolvedValue(null);
      
      // Llamar a la función
      await updateProjectProduct(req, res);
      
      // Verificaciones
      expect(mockTransactionRollback).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Producto de proyecto no encontrado'
      }));
    });
  });
  
  describe('deliverProducts', () => {
    test('debe entregar productos correctamente', async () => {
      // Configurar parámetros
      req.params.id = '1';
      req.body = {
        cantidad: 2
      };
      
      // Mock producto de proyecto
      const mockProjectProduct = {
        id: 1,
        projectId: 1,
        productId: 1,
        cantidad_requerida: 5,
        cantidad_entregada: 0,
        cantidad_reservada: 3,
        estado: 'RESERVADO',
        update: jest.fn().mockResolvedValue([1])
      };
      
      ProjectProduct.findByPk.mockResolvedValue(mockProjectProduct);
      
      // Llamar a la función
      await deliverProducts(req, res);
      
      // Verificaciones
      expect(db.transaction).toHaveBeenCalled();
      expect(ProjectProduct.findByPk).toHaveBeenCalledWith('1', expect.objectContaining({
        include: expect.any(Array),
        transaction: mockTransaction
      }));
      
      expect(mockProjectProduct.update).toHaveBeenCalledWith(
        expect.objectContaining({
          cantidad_entregada: 2,
          estado: 'EN_PROCESO'
        }),
        expect.objectContaining({
          transaction: mockTransaction
        })
      );
      
      expect(ProjectProductHistory.create).toHaveBeenCalled();
      expect(mockTransactionCommit).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Entrega registrada correctamente'
      }));
    });
    
    test('debe rechazar entrega que excede lo pendiente', async () => {
      // Configurar parámetros
      req.params.id = '1';
      req.body = {
        cantidad: 10  // Más que cantidad_requerida
      };
      
      // Mock producto de proyecto
      const mockProjectProduct = {
        id: 1,
        projectId: 1,
        productId: 1,
        cantidad_requerida: 5,
        cantidad_entregada: 0,
        cantidad_reservada: 3,
        estado: 'RESERVADO'
      };
      
      ProjectProduct.findByPk.mockResolvedValue(mockProjectProduct);
      
      // Llamar a la función
      await deliverProducts(req, res);
      
      // Verificaciones
      expect(mockTransactionRollback).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('excede')
      }));
    });
  });
  
  describe('getHistory', () => {
    test('debe retornar el historial de un producto de proyecto', async () => {
      // Configurar parámetros
      req.params.id = '1';
      
      // Mock historial
      const mockHistory = [
        {
          id: 1,
          project_product_id: 1,
          tipo_cambio: 'RESERVA',
          cantidad: 3,
          estado_anterior: 'PENDIENTE',
          estado_nuevo: 'RESERVADO',
          createdAt: new Date()
        },
        {
          id: 2,
          project_product_id: 1,
          tipo_cambio: 'ENTREGA',
          cantidad: 2,
          estado_anterior: 'RESERVADO',
          estado_nuevo: 'EN_PROCESO',
          createdAt: new Date()
        }
      ];
      
      ProjectProductHistory.findAll.mockResolvedValue(mockHistory);
      
      // Llamar a la función
      await getHistory(req, res);
      
      // Verificaciones
      expect(ProjectProductHistory.findAll).toHaveBeenCalledWith({
        where: { project_product_id: '1' },
        order: [['createdAt', 'DESC']]
      });
      expect(res.json).toHaveBeenCalledWith(mockHistory);
    });
    
    test('debe manejar errores al obtener historial', async () => {
      // Configurar parámetros
      req.params.id = '1';
      
      // Mock error
      ProjectProductHistory.findAll.mockRejectedValue(new Error('Error de base de datos'));
      
      // Llamar a la función
      await getHistory(req, res);
      
      // Verificaciones
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('Error')
      }));
    });
  });
  
  describe('reserveProjectProduct', () => {
    test('debe reservar productos correctamente', async () => {
      // Configurar parámetros
      req.params.id = '1';
      req.body = {
        cantidad: 3
      };
      
      // Mock producto de proyecto
      const mockProjectProduct = {
        id: 1,
        projectId: 1,
        productId: 1,
        cantidad_requerida: 5,
        cantidad_entregada: 0,
        cantidad_reservada: 0,
        estado: 'PENDIENTE',
        update: jest.fn().mockResolvedValue([1]),
        increment: jest.fn().mockResolvedValue([1])
      };
      
      ProjectProduct.findOne.mockResolvedValue(mockProjectProduct);
      
      // Mock producto
      const mockProduct = {
        id: 1,
        descripcion: 'Producto 1',
        cantidad: 10,
        cantidad_reservada: 0,
        precio: 100,
        increment: jest.fn().mockResolvedValue([1])
      };
      
      ProductModel.findByPk.mockResolvedValue(mockProduct);
      
      // Mock updated product
      const updatedProjectProduct = {
        ...mockProjectProduct,
        cantidad_reservada: 3,
        estado: 'RESERVADO',
        productItem: mockProduct
      };
      
      ProjectProduct.findByPk.mockResolvedValue(updatedProjectProduct);
      
      // Llamar a la función
      await reserveProjectProduct(req, res);
      
      // Verificaciones
      expect(db.transaction).toHaveBeenCalled();
      expect(ProjectProduct.findOne).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: '1' },
        include: expect.any(Array),
        transaction: mockTransaction
      }));
      
      expect(ProductModel.findByPk).toHaveBeenCalledWith(1, expect.objectContaining({
        transaction: mockTransaction
      }));
      
      expect(mockProduct.increment).toHaveBeenCalledWith('cantidad_reservada', expect.objectContaining({
        by: 3,
        transaction: mockTransaction
      }));
      
      expect(mockProjectProduct.update).toHaveBeenCalledWith(
        expect.objectContaining({
          estado: 'RESERVADO'
        }),
        expect.objectContaining({
          transaction: mockTransaction
        })
      );
      
      expect(mockProjectProduct.increment).toHaveBeenCalledWith('cantidad_reservada', expect.objectContaining({
        by: 3,
        transaction: mockTransaction
      }));
      
      expect(ProjectProductHistory.create).toHaveBeenCalled();
      expect(mockTransactionCommit).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Reserva realizada correctamente'
      }));
    });
    
    test('debe rechazar reserva con stock insuficiente', async () => {
      // Configurar parámetros
      req.params.id = '1';
      req.body = {
        cantidad: 15  // Más que stock disponible
      };
      
      // Mock producto de proyecto
      const mockProjectProduct = {
        id: 1,
        projectId: 1,
        productId: 1,
        cantidad_requerida: 20,
        cantidad_entregada: 0,
        cantidad_reservada: 0,
        estado: 'PENDIENTE'
      };
      
      ProjectProduct.findOne.mockResolvedValue(mockProjectProduct);
      
      // Mock producto con poco stock
      const mockProduct = {
        id: 1,
        descripcion: 'Producto 1',
        cantidad: 10,
        cantidad_reservada: 0,
        precio: 100
      };
      
      ProductModel.findByPk.mockResolvedValue(mockProduct);
      
      // Llamar a la función
      await reserveProjectProduct(req, res);
      
      // Verificaciones
      expect(mockTransactionRollback).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('insuficiente')
      }));
    });
  });
  
  describe('deliverProjectProduct', () => {
    test('debe entregar productos y generar salida de inventario', async () => {
      // Configurar fecha
      const fecha = new Date();
      const year = fecha.getFullYear().toString().substr(-2);
      const month = (fecha.getMonth() + 1).toString().padStart(2, '0');
      const day = fecha.getDate().toString().padStart(2, '0');
      
      // Configurar parámetros
      req.params.id = '1';
      req.body = {
        cantidad: 2
      };
      
      // Mock producto de proyecto
      const mockProjectProduct = {
        id: 1,
        projectId: 1,
        productId: 1,
        cantidad_requerida: 5,
        cantidad_entregada: 0,
        cantidad_reservada: 3,
        estado: 'RESERVADO',
        increment: jest.fn().mockResolvedValue([1]),
        decrement: jest.fn().mockResolvedValue([1]),
        update: jest.fn().mockResolvedValue([1]),
        productItem: {
          id: 1,
          descripcion: 'Producto 1',
          cantidad: 10,
          cantidad_reservada: 5,
          precio: 100,
          decrement: jest.fn().mockResolvedValue([1])
        },
        projectItem: {
          id: 1,
          nombre: 'Proyecto 1'
        }
      };
      
      ProjectProduct.findOne.mockResolvedValue(mockProjectProduct);
      
      // Mock salida de inventario
      const mockInventoryOut = {
        id: 1,
        codigo: `S${year}${month}${day}001`,
        total: 200,
        update: jest.fn().mockResolvedValue([1])
      };
      
      InventoryOutModel.create.mockResolvedValue(mockInventoryOut);
      InventoryOutProduct.create.mockResolvedValue({});
      
      // Mock para obtener salida completa
      InventoryOutModel.findByPk.mockResolvedValue({
        ...mockInventoryOut,
        productos: [
          {
            id: 1,
            descripcion: 'Producto 1',
            precio: 100,
            inventory_out_products: {
              cantidad: 2,
              subtotal: 200
            }
          }
        ]
      });
      
      // Llamar a la función
      await deliverProjectProduct(req, res);
      
      // Verificaciones
      expect(db.transaction).toHaveBeenCalled();
      expect(ProjectProduct.findOne).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: '1' },
        include: expect.any(Array),
        transaction: mockTransaction
      }));
      
      expect(InventoryOutModel.create).toHaveBeenCalled();
      expect(InventoryOutProduct.create).toHaveBeenCalled();
      
      expect(mockProjectProduct.productItem.decrement).toHaveBeenCalled();
      expect(mockProjectProduct.increment).toHaveBeenCalledWith('cantidad_entregada', expect.objectContaining({
        by: 2,
        transaction: mockTransaction
      }));
      
      expect(ProjectProductHistory.create).toHaveBeenCalled();
      expect(mockTransactionCommit).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Entrega realizada correctamente'
      }));
    });
    
    test('debe rechazar entrega que excede lo pendiente', async () => {
      // Configurar parámetros
      req.params.id = '1';
      req.body = {
        cantidad: 10  // Más que cantidad_requerida
      };
      
      // Mock producto de proyecto
      const mockProjectProduct = {
        id: 1,
        projectId: 1,
        productId: 1,
        cantidad_requerida: 5,
        cantidad_entregada: 0,
        cantidad_reservada: 3,
        estado: 'RESERVADO',
        productItem: {
          id: 1,
          descripcion: 'Producto 1',
          precio: 100
        },
        projectItem: {
          id: 1,
          nombre: 'Proyecto 1'
        }
      };
      
      ProjectProduct.findOne.mockResolvedValue(mockProjectProduct);
      
      // Llamar a la función
      await deliverProjectProduct(req, res);
      
      // Verificaciones
      expect(mockTransactionRollback).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('excede')
      }));
    });
  });
  
  describe('releaseReservation', () => {
    test('debe liberar una reserva correctamente', async () => {
      // Configurar parámetros
      req.params.id = '1';
      
      // Mock producto de proyecto con reserva
      const mockProjectProduct = {
        id: 1,
        projectId: 1,
        productId: 1,
        cantidad_requerida: 5,
        cantidad_entregada: 0,
        cantidad_reservada: 3,
        estado: 'RESERVADO',
        update: jest.fn().mockResolvedValue([1])
      };
      
      ProjectProduct.findByPk.mockResolvedValue(mockProjectProduct);
      
      // Mock producto
      const mockProduct = {
        id: 1,
        descripcion: 'Producto 1',
        cantidad: 10,
        cantidad_reservada: 5,
        increment: jest.fn().mockResolvedValue([1])
      };
      
      ProductModel.findByPk.mockResolvedValue(mockProduct);
      
      // Llamar a la función
      await releaseReservation(req, res);
      
      // Verificaciones
      expect(db.transaction).toHaveBeenCalled();
      expect(ProjectProduct.findByPk).toHaveBeenCalledWith('1', expect.objectContaining({
        include: expect.any(Array),
        transaction: mockTransaction
      }));
      
      expect(ProductModel.increment).toHaveBeenCalledWith('cantidad_reservada', expect.objectContaining({
        by: -3,
        where: { id: 1 },
        transaction: mockTransaction
      }));
      
      expect(mockProjectProduct.update).toHaveBeenCalledWith(
        expect.objectContaining({
          cantidad_reservada: 0,
          estado: 'PENDIENTE'
        }),
        expect.objectContaining({
          transaction: mockTransaction
        })
      );
      
      expect(ProjectProductHistory.create).toHaveBeenCalled();
      expect(mockTransactionCommit).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Reserva liberada exitosamente'
      }));
    });
    
    test('debe manejar caso sin reserva existente', async () => {
      // Configurar parámetros
      req.params.id = '1';
      
      // Mock producto de proyecto sin reserva
      const mockProjectProduct = {
        id: 1,
        projectId: 1,
        productId: 1,
        cantidad_requerida: 5,
        cantidad_entregada: 0,
        cantidad_reservada: 0,
        estado: 'PENDIENTE'
      };
      
      ProjectProduct.findByPk.mockResolvedValue(mockProjectProduct);
      
      // Llamar a la función
      await releaseReservation(req, res);
      
      // Verificaciones
      expect(mockTransactionCommit).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Reserva liberada exitosamente'
      }));
      
      // Verificar que no se hicieron actualizaciones
      expect(ProductModel.increment).not.toHaveBeenCalled();
    });
  });
});
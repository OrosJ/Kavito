import { jest } from '@jest/globals';

// Crear mocks explícitos para transacciones
const mockTransactionRollback = jest.fn().mockResolvedValue(true);
const mockTransactionCommit = jest.fn().mockResolvedValue(true);
const mockTransaction = {
  commit: mockTransactionCommit,
  rollback: mockTransactionRollback
};

// Mock del InventoryOutModel y InventoryOutProduct
jest.unstable_mockModule('../../../models/InvOutModel.js', () => {
  return {
    default: {
      findOne: jest.fn(),
      findAll: jest.fn(),
      findByPk: jest.fn(),
      create: jest.fn(),
      destroy: jest.fn()
    },
    InventoryOutProduct: {
      create: jest.fn()
    }
  };
});

// Mock del ProductModel
jest.unstable_mockModule('../../../models/ProductModel.js', () => {
  return {
    default: {
      findByPk: jest.fn()
    }
  };
});

// Mock del UserModel
jest.unstable_mockModule('../../../models/UserModel.js', () => {
  return {
    default: {}
  };
});

// Mock de la base de datos
jest.unstable_mockModule('../../../database/db.js', () => {
  return {
    default: {
      transaction: jest.fn().mockResolvedValue(mockTransaction),
      literal: jest.fn()
    }
  };
});

// Mock de Sequelize
jest.mock('sequelize', () => {
  return {
    Op: {
      gte: 'gte',
      lt: 'lt',
      in: 'in',
      notIn: 'notIn'
    }
  };
});

// Importaciones después de los mocks
const controllers = await import('../../../controllers/InvOutController.js');
const { createInventoryOut, getAllInventoryOuts, getInventoryOutById, deleteInventoryOut } = controllers;

const InvOutModelModule = await import('../../../models/InvOutModel.js');
const InventoryOutModel = InvOutModelModule.default;
const { InventoryOutProduct } = InvOutModelModule;

const ProductModelModule = await import('../../../models/ProductModel.js');
const ProductModel = ProductModelModule.default;

const UserModelModule = await import('../../../models/UserModel.js');
const UserModel = UserModelModule.default;

const dbModule = await import('../../../database/db.js');

// Silenciar solo para pruebas
console.error = () => {};
console.log = () => {};
console.warn = () => {};

const db = dbModule.default;

describe('InvOutController', () => {
  let req, res;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Configurar req y res
    req = {
      body: {},
      params: {},
      user: { id: 1 }
    };
    
    res = {
      json: jest.fn(() => res),
      status: jest.fn(() => res)
    };
  });
  
  describe('createInventoryOut', () => {
    test('debe crear una salida de inventario correctamente', async () => {
      // Datos de prueba
      req.body = {
        productos: [
          { product_id: 1, cantidad: 5 },
          { product_id: 2, cantidad: 3 }
        ],
        obs: 'Observación de prueba'
      };
      
      // Mock producto 1
      const mockProduct1 = {
        id: 1, 
        descripcion: 'Producto 1', 
        cantidad: 10, 
        precio: 100,
        decrement: jest.fn().mockResolvedValue({})
      };
      
      // Mock producto 2
      const mockProduct2 = {
        id: 2, 
        descripcion: 'Producto 2', 
        cantidad: 15, 
        precio: 200,
        decrement: jest.fn().mockResolvedValue({})
      };
      
      // Configurar findByPk para devolver diferentes productos
      ProductModel.findByPk
        .mockResolvedValueOnce(mockProduct1)
        .mockResolvedValueOnce(mockProduct2);
      
      // Mock para encontrar la última salida
      InventoryOutModel.findOne.mockResolvedValue(null);
      
      // Mock para crear la salida
      const mockInventoryOut = {
        id: 1,
        codigo: 'S240601001',
        user_id: 1,
        obs: 'Observación de prueba',
        total: 0,
        update: jest.fn().mockResolvedValue(true)
      };
      
      InventoryOutModel.create.mockResolvedValue(mockInventoryOut);
      InventoryOutProduct.create.mockResolvedValue({});
      
      // Mock para obtener la salida completa
      InventoryOutModel.findByPk.mockResolvedValue({
        ...mockInventoryOut,
        productos: [
          { 
            descripcion: 'Producto 1', 
            id: 1, 
            precio: 100, 
            inventory_out_products: { cantidad: 5, subtotal: 500 } 
          },
          { 
            descripcion: 'Producto 2', 
            id: 2, 
            precio: 200, 
            inventory_out_products: { cantidad: 3, subtotal: 600 } 
          }
        ],
        user: { username: 'admin' }
      });
      
      // Ejecutar el controlador
      await createInventoryOut(req, res);
      
      // Verificaciones
      expect(db.transaction).toHaveBeenCalled();
      expect(InventoryOutModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          codigo: expect.any(String),
          user_id: 1,
          obs: 'Observación de prueba'
        }),
        expect.any(Object)
      );
      
      expect(ProductModel.findByPk).toHaveBeenCalledTimes(2);
      expect(mockProduct1.decrement).toHaveBeenCalled();
      expect(mockProduct2.decrement).toHaveBeenCalled();
      expect(InventoryOutProduct.create).toHaveBeenCalledTimes(2);
      
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Salida registrada con éxito.'
      }));
      
      // Verificar que se llamó a commit
      expect(mockTransactionCommit).toHaveBeenCalled();
    });
    
    test('debe manejar errores cuando los datos son inválidos', async () => {
      // Datos de prueba inválidos (sin productos)
      req.body = {
        productos: [],
        obs: 'Observación de prueba'
      };
      
      // Ejecutar el controlador
      await createInventoryOut(req, res);
      
      // Verificaciones
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('productos')
      }));
    });
    
    test('debe manejar errores cuando un producto no tiene stock suficiente', async () => {
      // Datos de prueba
      req.body = {
        productos: [
          { product_id: 1, cantidad: 20 } // Más cantidad que stock disponible
        ],
        obs: 'Observación de prueba'
      };
      
      // Mock producto con poco stock
      const mockProduct = {
        id: 1, 
        descripcion: 'Producto 1', 
        cantidad: 10, // Solo hay 10 disponibles
        precio: 100
      };
      
      ProductModel.findByPk.mockResolvedValue(mockProduct);
      
      // Ejecutar el controlador
      await createInventoryOut(req, res);
      
      // Verificaciones
      expect(mockTransactionRollback).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('insuficiente')
        })
      );
    });
  });
  
  describe('getAllInventoryOuts', () => {
    test('debe retornar todas las salidas de inventario', async () => {
      // Mock de datos
      const mockSalidas = [
        {
          id: 1,
          codigo: 'S240601001',
          total: 1000,
          createdAt: new Date(),
          user: { username: 'admin' },
          productos: [
            { 
              id: 1, 
              descripcion: 'Producto 1', 
              precio: 100, 
              inventory_out_products: { cantidad: 5, subtotal: 500 } 
            }
          ],
          toJSON: () => ({
            id: 1,
            codigo: 'S240601001',
            total: 1000,
            createdAt: new Date(),
            user: { username: 'admin' },
            productos: [{ 
              id: 1, 
              descripcion: 'Producto 1', 
              precio: 100, 
              inventory_out_products: { cantidad: 5, subtotal: 500 } 
            }]
          })
        }
      ];
      
      InventoryOutModel.findAll.mockResolvedValue(mockSalidas);
      
      // Ejecutar el controlador
      await getAllInventoryOuts(req, res);
      
      // Verificaciones
      expect(InventoryOutModel.findAll).toHaveBeenCalledWith(expect.objectContaining({
        include: expect.any(Array),
        order: expect.any(Array)
      }));
      
      expect(res.json).toHaveBeenCalled();
    });
    
    test('debe manejar errores al obtener salidas', async () => {
      // Mock error
      const errorMessage = 'Error de base de datos';
      InventoryOutModel.findAll.mockRejectedValue(new Error(errorMessage));
      
      // Ejecutar el controlador
      await getAllInventoryOuts(req, res);
      
      // Verificaciones
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
  
  describe('getInventoryOutById', () => {
    test('debe retornar una salida específica por ID', async () => {
      // Mock ID
      req.params.id = '1';
      
      // Mock salida
      const mockInventoryOut = {
        id: 1,
        codigo: 'S240601001',
        total: 1000,
        createdAt: new Date(),
        user: { username: 'admin' },
        productos: [
          { 
            id: 1, 
            descripcion: 'Producto 1', 
            precio: 100, 
            inventory_out_products: { cantidad: 5, subtotal: 500 } 
          }
        ],
        toJSON: () => ({
          id: 1,
          codigo: 'S240601001',
          total: 1000,
          createdAt: new Date(),
          user: { username: 'admin' },
          productos: [{ 
            id: 1, 
            descripcion: 'Producto 1', 
            precio: 100, 
            inventory_out_products: { cantidad: 5, subtotal: 500 } 
          }]
        })
      };
      
      InventoryOutModel.findByPk.mockResolvedValue(mockInventoryOut);
      
      // Ejecutar el controlador
      await getInventoryOutById(req, res);
      
      // Verificaciones
      expect(InventoryOutModel.findByPk).toHaveBeenCalledWith('1', expect.objectContaining({
        include: expect.any(Array)
      }));
      
      expect(res.json).toHaveBeenCalled();
    });
    
    test('debe retornar error si la salida no existe', async () => {
      // Mock ID
      req.params.id = '999'; // ID inexistente
      
      // Mock salida no encontrada
      InventoryOutModel.findByPk.mockResolvedValue(null);
      
      // Ejecutar el controlador
      await getInventoryOutById(req, res);
      
      // Verificaciones
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Registro de salida no encontrado'
      }));
    });
  });
  
  describe('deleteInventoryOut', () => {
    test('debe eliminar una salida y restaurar inventario', async () => {
      // Mock ID
      req.params.id = '1';
      
      // Mock salida a eliminar
      const mockInventoryOut = {
        id: 1,
        product_id: 1,
        cantidad: 5
      };
      
      InventoryOutModel.findByPk.mockResolvedValue(mockInventoryOut);
      
      // Mock producto
      const mockProduct = {
        id: 1,
        cantidad: 10,
        save: jest.fn().mockResolvedValue(true)
      };
      
      ProductModel.findByPk.mockResolvedValue(mockProduct);
      InventoryOutModel.destroy.mockResolvedValue(1);
      
      // Ejecutar el controlador
      await deleteInventoryOut(req, res);
      
      // Verificaciones
      expect(InventoryOutModel.findByPk).toHaveBeenCalledWith('1');
      expect(InventoryOutModel.destroy).toHaveBeenCalledWith({ where: { id: '1' } });
      
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('eliminado')
      }));
    });
    
    test('debe retornar error si la salida no existe', async () => {
      // Mock ID
      req.params.id = '999'; // ID inexistente
      
      // Mock salida no encontrada
      InventoryOutModel.findByPk.mockResolvedValue(null);
      
      // Ejecutar el controlador
      await deleteInventoryOut(req, res);
      
      // Verificaciones
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Registro de salida no encontrado'
      }));
    });
  });
});
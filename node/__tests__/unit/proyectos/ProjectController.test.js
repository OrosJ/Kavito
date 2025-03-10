import { jest } from '@jest/globals';

// Silenciar solo para pruebas
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
jest.unstable_mockModule('../../../models/ProjectModel.js', () => ({
  default: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn()
  }
}));

jest.unstable_mockModule('../../../models/ProjectProductModel.js', () => ({
  ProjectProduct: {
    findOne: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
    increment: jest.fn(),
  },
  ProjectProductHistory: {
    create: jest.fn(),
    findAll: jest.fn(),
    destroy: jest.fn()
  }
}));

jest.unstable_mockModule('../../../models/ProductModel.js', () => ({
  default: {
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByPk: jest.fn(),
    increment: jest.fn(),
    decrement: jest.fn()
  }
}));

jest.unstable_mockModule('../../../models/ClientModel.js', () => ({
  default: {
    findByPk: jest.fn()
  }
}));

jest.unstable_mockModule('../../../models/InvOutModel.js', () => ({
  default: {
    findOne: jest.fn(),
    create: jest.fn()
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

// Mock de Sequelize
jest.mock('sequelize', () => ({
  Op: {
    gte: 'gte',
    lt: 'lt',
    in: 'in',
    notIn: 'notIn',
    between: 'between'
  }
}));

// Import de controladores y modelos despued de mocks
const controllers = await import('../../../controllers/ProjectController.js');
const { 
  getProjects, 
  getProject, 
  createProject, 
  updateProject, 
  deleteProject, 
  updateProjectStatus 
} = controllers;

const ProjectModelModule = await import('../../../models/ProjectModel.js');
const ProjectModel = ProjectModelModule.default;

const ProjectProductModels = await import('../../../models/ProjectProductModel.js');
const { ProjectProduct, ProjectProductHistory } = ProjectProductModels;

const ProductModelModule = await import('../../../models/ProductModel.js');
const ProductModel = ProductModelModule.default;

const ClientModelModule = await import('../../../models/ClientModel.js');
const ClientModel = ClientModelModule.default;

const InvOutModelModule = await import('../../../models/InvOutModel.js');
const InventoryOutModel = InvOutModelModule.default;
const { InventoryOutProduct } = InvOutModelModule;

const dbModule = await import('../../../database/db.js');
const db = dbModule.default;

describe('ProjectController', () => {
  let req, res;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Configuracion req y res
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
  
  describe('getProjects', () => {
    test('debe retornar todos los proyectos', async () => {
      // Mock de datos
      const mockProjects = [
        { 
          id: 1, 
          nombre: 'Proyecto 1', 
          descripcion: 'Descripción del proyecto 1',
          fecha_inicio: new Date(),
          fecha_entrega: new Date(),
          estado: 'PLANIFICACION',
          client_id: 1,
          client: { clientname: 'Cliente 1' },
          products: []
        },
        { 
          id: 2, 
          nombre: 'Proyecto 2', 
          descripcion: 'Descripción del proyecto 2',
          fecha_inicio: new Date(),
          fecha_entrega: new Date(),
          estado: 'EN_PROGRESO',
          client_id: 2,
          client: { clientname: 'Cliente 2' },
          products: []
        }
      ];
      
      // Configurar mock para devolver datos
      ProjectModel.findAll.mockResolvedValue(mockProjects);
      
      // Llamar a la función
      await getProjects(req, res);
      
      // Verificaciones
      expect(ProjectModel.findAll).toHaveBeenCalled();
      expect(ProjectModel.findAll).toHaveBeenCalledWith(expect.objectContaining({
        include: expect.any(Array),
        order: expect.any(Array)
      }));
      expect(res.json).toHaveBeenCalledWith(mockProjects);
    });
    
    test('debe manejar errores correctamente', async () => {
      // Configurar mock para simular error
      const errorMessage = 'Error de base de datos';
      ProjectModel.findAll.mockRejectedValue(new Error(errorMessage));
      
      // Llamar a la función
      await getProjects(req, res);
      
      // Verificaciones
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.any(String)
      }));
    });
  });
  
  describe('getProject', () => {
    test('debe retornar un proyecto específico por ID', async () => {
      // Configurar parámetros
      req.params.id = '1';
      
      // Mock de datos
      const mockProject = { 
        id: 1, 
        nombre: 'Proyecto 1', 
        descripcion: 'Descripción del proyecto 1',
        fecha_inicio: new Date(),
        fecha_entrega: new Date(),
        estado: 'PLANIFICACION',
        client_id: 1,
        client: { clientname: 'Cliente 1' },
        products: [
          {
            id: 1,
            descripcion: 'Producto 1',
            project_products: {
              id: 1,
              cantidad_requerida: 5,
              cantidad_entregada: 0,
              cantidad_reservada: 0,
              estado: 'PENDIENTE'
            }
          }
        ],
        toJSON: () => ({
          id: 1,
          nombre: 'Proyecto 1',
          products: []
        })
      };
      
      // Configurar mocks
      ProjectModel.findByPk.mockResolvedValue(mockProject);
      
      // Llamar a la función
      await getProject(req, res);
      
      // Verificaciones
      expect(ProjectModel.findByPk).toHaveBeenCalledWith('1', expect.objectContaining({
        include: expect.any(Array),
        transaction: mockTransaction
      }));
      expect(res.json).toHaveBeenCalled();
    });
    
    test('debe retornar error si el proyecto no existe', async () => {
      // Configurar parámetros
      req.params.id = '999';
      
      // Mock de datos
      ProjectModel.findByPk.mockResolvedValue(null);
      
      // Llamar a la función
      await getProject(req, res);
      
      // Verificaciones
      expect(mockTransactionRollback).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Proyecto no encontrado'
      }));
    });
  });
  
  describe('createProject', () => {
    test('debe crear un proyecto correctamente', async () => {
      // Configurar datos de prueba
      const today = new Date();
      const futureDate = new Date();
      futureDate.setDate(today.getDate() + 10);
      
      req.body = {
        nombre: 'Nuevo Proyecto',
        descripcion: 'Descripción del nuevo proyecto',
        fecha_inicio: today.toISOString().split('T')[0],
        fecha_entrega: futureDate.toISOString().split('T')[0],
        client_id: 1,
        productos: [
          { product_id: 1, cantidad_requerida: 5 }
        ]
      };
      
      // Mock cliente
      ClientModel.findByPk.mockResolvedValue({ id: 1, clientname: 'Cliente 1' });
      
      // Mock producto
      ProductModel.findByPk.mockResolvedValue({
        id: 1,
        descripcion: 'Producto 1',
        cantidad: 10,
        cantidad_reservada: 0,
        precio: 100
      });
      
      // Mock proyecto creado
      const mockCreatedProject = {
        id: 1,
        nombre: 'Nuevo Proyecto',
        descripcion: 'Descripción del nuevo proyecto',
        fecha_inicio: today,
        fecha_entrega: futureDate,
        client_id: 1,
        costo: 500,
        prioridad: 'MEDIA',
        estado: 'PLANIFICACION'
      };
      
      ProjectModel.create.mockResolvedValue(mockCreatedProject);
      ProjectProduct.create.mockResolvedValue({
        id: 1,
        projectId: 1,
        productId: 1,
        cantidad_requerida: 5,
        cantidad_reservada: 0,
        cantidad_entregada: 0,
        estado: 'PENDIENTE'
      });
      
      // Proyecto completo
      const mockProjectComplete = {
        ...mockCreatedProject,
        client: { clientname: 'Cliente 1' },
        products: [{
          id: 1,
          descripcion: 'Producto 1',
          project_products: {
            cantidad_requerida: 5,
            cantidad_reservada: 0,
            cantidad_entregada: 0
          }
        }]
      };
      
      ProjectModel.findByPk.mockResolvedValue(mockProjectComplete);
      
      // Llamar a la función
      await createProject(req, res);
      
      // Verificaciones
      expect(db.transaction).toHaveBeenCalled();
      expect(ClientModel.findByPk).toHaveBeenCalledWith(1);
      expect(ProductModel.findByPk).toHaveBeenCalledWith(1, expect.objectContaining({
        transaction: mockTransaction
      }));
      expect(ProjectModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          nombre: 'Nuevo Proyecto',
          client_id: 1
        }),
        expect.objectContaining({
          transaction: mockTransaction
        })
      );
      expect(mockTransactionCommit).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Proyecto creado exitosamente'
      }));
    });
    
    test('debe rechazar proyecto sin datos requeridos', async () => {
      // Datos incompletos
      req.body = {
        nombre: 'Proyecto Incompleto'
        // Sin fecha_inicio, fecha_entrega, ni client_id
      };
      
      // Llamar a la función
      await createProject(req, res);
      
      // Verificaciones
      expect(mockTransactionRollback).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('campos requeridos')
      }));
    });
    
    test('debe rechazar proyecto con fechas inválidas', async () => {
      // Fecha de inicio en el pasado
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 5);
      
      const today = new Date();
      
      req.body = {
        nombre: 'Proyecto Fechas Inválidas',
        descripcion: 'Descripción',
        fecha_inicio: pastDate.toISOString().split('T')[0], // Fecha en el pasado
        fecha_entrega: today.toISOString().split('T')[0], // Igual a fecha actual
        client_id: 1
      };
      
      // Llamar a la función
      await createProject(req, res);
      
      // Verificaciones
      expect(mockTransactionRollback).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('fecha')
      }));
    });
  });
  
  describe('updateProject', () => {
    test('debe actualizar un proyecto correctamente', async () => {
      // Configurar parámetros
      req.params.id = '1';
      
      // Configurar datos de prueba
      const today = new Date();
      const futureDate = new Date();
      futureDate.setDate(today.getDate() + 10);
      
      req.body = {
        nombre: 'Proyecto Actualizado',
        descripcion: 'Descripción actualizada',
        fecha_inicio: today.toISOString().split('T')[0],
        fecha_entrega: futureDate.toISOString().split('T')[0],
        client_id: 1,
        productos: [
          { product_id: 1, cantidad_requerida: 5 }
        ]
      };
      
      // Mock proyecto existente
      const mockExistingProject = {
        id: 1,
        nombre: 'Proyecto Original',
        descripcion: 'Descripción original',
        fecha_inicio: today,
        fecha_entrega: today,
        client_id: 1,
        estado: 'PLANIFICACION',
        costo: 300,
        products: [],
        update: jest.fn().mockResolvedValue([1])
      };
      
      ProjectModel.findByPk.mockResolvedValue(mockExistingProject);
      
      // Mock producto
      ProductModel.findByPk.mockResolvedValue({
        id: 1,
        descripcion: 'Producto 1',
        cantidad: 10,
        precio: 100
      });
      
      // Mock proyecto actualizado
      const mockUpdatedProject = {
        id: 1,
        nombre: 'Proyecto Actualizado',
        descripcion: 'Descripción actualizada',
        fecha_inicio: today,
        fecha_entrega: futureDate,
        client_id: 1,
        estado: 'PLANIFICACION',
        costo: 500,
        client: { clientname: 'Cliente 1' },
        products: [{
          id: 1,
          descripcion: 'Producto 1',
          project_products: {
            cantidad_requerida: 5,
            cantidad_reservada: 0,
            cantidad_entregada: 0
          }
        }]
      };
      
      // Mock para búsqueda después de actualizar
      ProjectModel.findByPk
        .mockResolvedValueOnce(mockExistingProject)
        .mockResolvedValueOnce(mockUpdatedProject);
      
      // Llamar a la función
      await updateProject(req, res);
      
      // Verificaciones
      expect(db.transaction).toHaveBeenCalled();
      expect(ProjectModel.findByPk).toHaveBeenCalledWith('1', expect.objectContaining({
        include: expect.any(Array),
        transaction: mockTransaction
      }));
      expect(mockExistingProject.update).toHaveBeenCalled();
      expect(mockTransactionCommit).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Proyecto actualizado exitosamente'
      }));
    });
    
    test('debe retornar error si el proyecto no existe', async () => {
      // Configurar parámetros
      req.params.id = '999';
      
      // Mock de datos
      ProjectModel.findByPk.mockResolvedValue(null);
      
      // Llamar a la función
      await updateProject(req, res);
      
      // Verificaciones
      expect(mockTransactionRollback).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Proyecto no encontrado'
      }));
    });
    
    test('debe rechazar actualización de proyecto completado', async () => {
      // Configurar parámetros
      req.params.id = '1';
      
      // Configurar datos de prueba
      req.body = {
        nombre: 'Proyecto Actualizado'
      };
      
      // Mock proyecto completado
      const mockCompletedProject = {
        id: 1,
        nombre: 'Proyecto Completado',
        estado: 'COMPLETADO',
        products: []
      };
      
      ProjectModel.findByPk.mockResolvedValue(mockCompletedProject);
      
      // Llamar a la función
      await updateProject(req, res);
      
      // Verificaciones
      expect(mockTransactionRollback).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('completado')
      }));
    });
  });
  
  describe('deleteProject', () => {
    test('debe eliminar un proyecto correctamente', async () => {
      // Configurar parámetros
      req.params.id = '1';
      
      // Mock proyecto
      const mockProject = {
        id: 1,
        nombre: 'Proyecto a Eliminar',
        estado: 'PLANIFICACION',
        products: [
          {
            id: 1,
            project_products: {
              id: 1,
              cantidad_reservada: 5
            }
          }
        ],
        destroy: jest.fn().mockResolvedValue(true)
      };
      
      ProjectModel.findByPk.mockResolvedValue(mockProject);
      
      // Mock producto
      const mockProduct = {
        id: 1,
        descripcion: 'Producto Reservado',
        cantidad_reservada: 10,
        decrement: jest.fn().mockResolvedValue(true)
      };
      
      // Llamar a la función
      await deleteProject(req, res);
      
      // Verificaciones
      expect(db.transaction).toHaveBeenCalled();
      expect(ProjectModel.findByPk).toHaveBeenCalledWith('1', expect.objectContaining({
        include: expect.any(Array),
        transaction: mockTransaction
      }));
      
      expect(mockProject.destroy).toHaveBeenCalledWith(expect.objectContaining({
        transaction: mockTransaction
      }));
      
      expect(mockTransactionCommit).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Proyecto eliminado correctamente',
        projectId: '1'
      }));
    });
    
    test('debe retornar error si el proyecto no existe', async () => {
      // Configurar parámetros
      req.params.id = '999';
      
      // Mock de datos
      ProjectModel.findByPk.mockResolvedValue(null);
      
      // Llamar a la función
      await deleteProject(req, res);
      
      // Verificaciones
      expect(mockTransactionRollback).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Proyecto no encontrado'
      }));
    });
    
    test('debe rechazar eliminación de proyecto completado', async () => {
      // Configurar parámetros
      req.params.id = '1';
      
      // Mock proyecto completado
      const mockCompletedProject = {
        id: 1,
        nombre: 'Proyecto Completado',
        estado: 'COMPLETADO',
        products: []
      };
      
      ProjectModel.findByPk.mockResolvedValue(mockCompletedProject);
      
      // Llamar a la función
      await deleteProject(req, res);
      
      // Verificaciones
      expect(mockTransactionRollback).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('completados')
      }));
    });
  });
  
  describe('updateProjectStatus', () => {
    test('debe actualizar el estado del proyecto a EN_PROGRESO', async () => {
      // Configurar parámetros
      req.params.id = '1';
      req.body = {
        estado: 'EN_PROGRESO',
        notas: 'Iniciando proyecto'
      };
      
      // Mock proyecto
      const mockProject = {
        id: 1,
        nombre: 'Proyecto en Planificación',
        estado: 'PLANIFICACION',
        products: [],
        update: jest.fn().mockResolvedValue([1])
      };
      
      // Mock para búsqueda inicial y después de actualizar
      ProjectModel.findByPk
        .mockResolvedValueOnce(mockProject)
        .mockResolvedValueOnce({
          ...mockProject,
          estado: 'EN_PROGRESO'
        });
      
      // Llamar a la función
      await updateProjectStatus(req, res);
      
      // Verificaciones
      expect(db.transaction).toHaveBeenCalled();
      expect(ProjectModel.findByPk).toHaveBeenCalledWith('1', expect.objectContaining({
        include: expect.any(Array),
        transaction: mockTransaction
      }));
      
      expect(mockProject.update).toHaveBeenCalledWith(
        expect.objectContaining({
          estado: 'EN_PROGRESO',
          notas_cierre: 'Iniciando proyecto'
        }),
        expect.objectContaining({
          transaction: mockTransaction
        })
      );
      
      expect(mockTransactionCommit).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalled();
    });
    
    test('debe completar el proyecto y generar salida de inventario', async () => {
      // Configurar parámetros
      req.params.id = '1';
      req.body = {
        estado: 'COMPLETADO',
        notas: 'Proyecto completado exitosamente'
      };
      
      // Mock proyecto con productos pendientes
      const mockProject = {
        id: 1,
        nombre: 'Proyecto en Progreso',
        estado: 'EN_PROGRESO',
        products: [
          {
            id: 1,
            descripcion: 'Producto 1',
            cantidad: 20,
            cantidad_reservada: 5,
            precio: 100,
            decrement: jest.fn().mockResolvedValue(true),
            project_products: {
              id: 1,
              cantidad_requerida: 5,
              cantidad_entregada: 0,
              cantidad_reservada: 5,
              estado: 'RESERVADO',
              update: jest.fn().mockResolvedValue([1])
            }
          }
        ],
        update: jest.fn().mockResolvedValue([1])
      };
      
      ProjectModel.findByPk.mockResolvedValue(mockProject);
      
      // Mock para salida de inventario
      const mockInventoryOut = {
        id: 1,
        codigo: 'S240501001',
        total: 500
      };
      
      InventoryOutModel.create.mockResolvedValue(mockInventoryOut);
      InventoryOutProduct.create.mockResolvedValue({});
      
      // Llamar a la función
      await updateProjectStatus(req, res);
      
      // Verificaciones
      expect(db.transaction).toHaveBeenCalled();
      expect(ProjectModel.findByPk).toHaveBeenCalledWith('1', expect.objectContaining({
        include: expect.any(Array),
        transaction: mockTransaction
      }));
      
      expect(mockProject.update).toHaveBeenCalledWith(
        expect.objectContaining({
          estado: 'COMPLETADO',
          fecha_completado: expect.any(Date)
        }),
        expect.objectContaining({
          transaction: mockTransaction
        })
      );
      
      expect(InventoryOutModel.create).toHaveBeenCalled();
      expect(mockProject.products[0].project_products.update).toHaveBeenCalled();
      expect(mockTransactionCommit).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalled();
    });
    
    test('debe rechazar cambio de estado no válido', async () => {
      // Configurar parámetros
      req.params.id = '1';
      req.body = {
        estado: 'COMPLETADO', // No se puede pasar de PLANIFICACION a COMPLETADO directamente
        notas: 'Intento inválido'
      };
      
      // Mock proyecto en PLANIFICACION
      const mockProject = {
        id: 1,
        nombre: 'Proyecto en Planificación',
        estado: 'PLANIFICACION',
        products: []
      };
      
      ProjectModel.findByPk.mockResolvedValue(mockProject);
      
      // Llamar a la función
      await updateProjectStatus(req, res);
      
      // Verificaciones
      expect(mockTransactionRollback).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('No se puede cambiar')
      }));
    });
  });
});
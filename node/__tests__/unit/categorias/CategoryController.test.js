import { jest } from '@jest/globals';

// Simular el modelo CategoryModel
jest.unstable_mockModule('../../../models/CategoryModel.js', () => ({
  default: {
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn()
  }
}));

// Importar controladores después de simular
const controllers = await import('../../../controllers/CategoryController.js');
const { 
  getAllCategories, 
  getCategory, 
  createCategory, 
  updateCategory, 
  deleteCategory 
} = controllers;

const CategoryModelModule = await import('../../../models/CategoryModel.js');
const CategoryModel = CategoryModelModule.default;

// Suprimir logs de consola durante las pruebas
console.error = jest.fn();
console.log = jest.fn();

describe('CategoryController', () => {
  let req, res;
  
  beforeEach(() => {
    // Reiniciar mocks antes de cada prueba
    jest.clearAllMocks();
    
    // Configurar objetos simulados de solicitud y respuesta
    req = {
      body: {},
      params: {}
    };
    
    res = {
      json: jest.fn(() => res),
      status: jest.fn(() => res)
    };
  });

  describe('getAllCategories', () => {
    test('debería retornar todas las categorías', async () => {
      // Configurar categorías simuladas
      const mockCategories = [
        { id: 1, categoryname: 'Categoría 1', createdAt: new Date(), updatedAt: new Date() },
        { id: 2, categoryname: 'Categoría 2', createdAt: new Date(), updatedAt: new Date() }
      ];
      
      // Configurar mock para retornar las categorías
      CategoryModel.findAll.mockResolvedValue(mockCategories);
      
      // Llamar a la función del controlador
      await getAllCategories(req, res);
      
      // Aserciones
      expect(CategoryModel.findAll).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(mockCategories);
    });
    
    test('debería manejar error al obtener categorías', async () => {
      // Configurar mock para lanzar un error
      const error = new Error('Error de base de datos');
      CategoryModel.findAll.mockRejectedValue(error);
      
      // Llamar a la función del controlador
      await getAllCategories(req, res);
      
      // Aserciones
      expect(CategoryModel.findAll).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ message: error.message });
    });
  });

  describe('getCategory', () => {
    test('debería retornar una categoría por ID', async () => {
      // Configurar parámetros de solicitud
      req.params.id = '1';
      
      // Configurar categoría simulada
      const mockCategory = { 
        id: 1, 
        categoryname: 'Categoría 1', 
        createdAt: new Date(), 
        updatedAt: new Date() 
      };
      
      // Configurar mock para retornar la categoría
      CategoryModel.findAll.mockResolvedValue([mockCategory]);
      
      // Llamar a la función del controlador
      await getCategory(req, res);
      
      // Aserciones
      expect(CategoryModel.findAll).toHaveBeenCalledWith({
        where: { id: '1' }
      });
      expect(res.json).toHaveBeenCalledWith(mockCategory);
    });
    
    test('debería manejar error al obtener una categoría', async () => {
      // Configurar parámetros de solicitud
      req.params.id = '1';
      
      // Configurar mock para lanzar un error
      const error = new Error('Error de base de datos');
      CategoryModel.findAll.mockRejectedValue(error);
      
      // Llamar a la función del controlador
      await getCategory(req, res);
      
      // Aserciones
      expect(res.json).toHaveBeenCalledWith({ message: error.message });
    });
  });

  describe('createCategory', () => {
    test('debería crear una nueva categoría', async () => {
      // Configurar cuerpo de solicitud
      req.body = { categoryname: 'Nueva Categoría' };
      
      // Llamar a la función del controlador
      await createCategory(req, res);
      
      // Aserciones
      expect(CategoryModel.create).toHaveBeenCalledWith({ categoryname: 'Nueva Categoría' });
      expect(res.json).toHaveBeenCalledWith({ message: 'Categoria Creada' });
    });
    
    test('debería manejar error al crear una categoría', async () => {
      // Configurar cuerpo de solicitud
      req.body = { categoryname: 'Nueva Categoría' };
      
      // Configurar mock para lanzar un error
      const error = new Error('Error de base de datos');
      CategoryModel.create.mockRejectedValue(error);
      
      // Llamar a la función del controlador
      await createCategory(req, res);
      
      // Aserciones
      expect(res.json).toHaveBeenCalledWith({ message: error.message });
    });
  });

  describe('updateCategory', () => {
    test('debería actualizar una categoría', async () => {
      // Configurar parámetros y cuerpo de solicitud
      req.params.id = '1';
      req.body = { categoryname: 'Categoría Actualizada' };
      
      // Llamar a la función del controlador
      await updateCategory(req, res);
      
      // Aserciones
      expect(CategoryModel.update).toHaveBeenCalledWith(
        { categoryname: 'Categoría Actualizada' },
        { where: { id: '1' } }
      );
      expect(res.json).toHaveBeenCalledWith({ message: 'Categoria Actualizada' });
    });
    
    test('debería manejar error al actualizar una categoría', async () => {
      // Configurar parámetros y cuerpo de solicitud
      req.params.id = '1';
      req.body = { categoryname: 'Categoría Actualizada' };
      
      // Configurar mock para lanzar un error
      const error = new Error('Error de base de datos');
      CategoryModel.update.mockRejectedValue(error);
      
      // Llamar a la función del controlador
      await updateCategory(req, res);
      
      // Aserciones
      expect(res.json).toHaveBeenCalledWith({ message: error.message });
    });
  });

  describe('deleteCategory', () => {
    test('debería eliminar una categoría', async () => {
      // Configurar parámetros de solicitud
      req.params.id = '1';
      
      // Llamar a la función del controlador
      await deleteCategory(req, res);
      
      // Aserciones
      expect(CategoryModel.destroy).toHaveBeenCalledWith({
        where: { id: '1' }
      });
      expect(res.json).toHaveBeenCalledWith({ message: 'Categoria Eliminada' });
    });
    
    test('debería manejar error al eliminar una categoría', async () => {
      // Configurar parámetros de solicitud
      req.params.id = '1';
      
      // Configurar mock para lanzar un error
      const error = new Error('Error de base de datos');
      CategoryModel.destroy.mockRejectedValue(error);
      
      // Llamar a la función del controlador
      await deleteCategory(req, res);
      
      // Aserciones
      expect(res.json).toHaveBeenCalledWith({ message: error.message });
    });
  });
});
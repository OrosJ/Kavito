import { jest } from '@jest/globals';

// IMPORTANTE: Mock antes de importar los controladores
jest.unstable_mockModule('../../../models/ProductModel.js', () => ({
  default: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn()
  }
}));

jest.unstable_mockModule('../../../models/CategoryModel.js', () => ({
  default: {
    findByPk: jest.fn()
  }
}));

// Ahora importamos los controladores y modelos
const controllers = await import('../../../controllers/ProductController.js');
const { getAllProducts, getProduct, createProduct, updateProduct, deleteProduct } = controllers;

const ProductModelModule = await import('../../../models/ProductModel.js');
const CategoryModelModule = await import('../../../models/CategoryModel.js');

// Silenciar solo para pruebas
console.error = () => {};
console.log = () => {};
console.warn = () => {};

const ProductModel = ProductModelModule.default;
const CategoryModel = CategoryModelModule.default;

describe('ProductController', () => {
  let req, res;
  
  beforeEach(() => {
    // Reiniciar mocks antes de cada prueba
    jest.clearAllMocks();
    
    // Configurar req, res
    req = {
      params: {},
      body: {},
      file: null
    };
    
    res = {
      json: jest.fn(() => res),
      status: jest.fn(() => res)
    };
  });

  describe('getAllProducts', () => {
    test('debe retornar todos los productos', async () => {
      // Datos de prueba
      const mockProducts = [
        { 
          id: 1, 
          descripcion: 'Producto 1', 
          cantidad: 10,
          cantidad_reservada: 2,
          precio: 100, 
          image: 'image1.jpg',
          toJSON: () => ({ 
            id: 1, 
            descripcion: 'Producto 1', 
            cantidad: 10,
            cantidad_reservada: 2,
            precio: 100, 
            image: 'image1.jpg' 
          })
        },
        { 
          id: 2, 
          descripcion: 'Producto 2', 
          cantidad: 20,
          cantidad_reservada: 0,
          precio: 200, 
          image: 'image2.jpg',
          toJSON: () => ({ 
            id: 2, 
            descripcion: 'Producto 2', 
            cantidad: 20,
            cantidad_reservada: 0,
            precio: 200, 
            image: 'image2.jpg' 
          })
        }
      ];
      
      // Configurar mock para devolver datos
      ProductModel.findAll.mockResolvedValue(mockProducts);
      
      // Llamar a la función
      await getAllProducts(req, res);
      
      // Verificaciones
      expect(ProductModel.findAll).toHaveBeenCalled();
      expect(ProductModel.findAll).toHaveBeenCalledWith(expect.objectContaining({
        include: [expect.objectContaining({
          model: CategoryModel,
          attributes: ["categoryname"]
        })],
        attributes: expect.any(Object)
      }));
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
    });

    test('debe manejar errores correctamente', async () => {
      // Configurar mock para simular error
      const errorMessage = 'Error de base de datos';
      ProductModel.findAll.mockRejectedValue(new Error(errorMessage));
      
      // Llamar a la función
      await getAllProducts(req, res);
      
      // Verificaciones
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.any(String)
      }));
    });
  });

  describe('getProduct', () => {
    test('debe retornar un producto por ID', async () => {
      // Mock de datos
      const mockProduct = { 
        id: 1, 
        descripcion: 'Producto 1', 
        cantidad: 10, 
        precio: 100,
        categoria: 1,
        category: {
          categoryname: 'Herramientas'
        }
      };
      
      // Configurar request con ID
      req.params = { id: '1' };
      
      // Configurar mock
      ProductModel.findByPk.mockResolvedValue(mockProduct);
      
      // Llamar a la función
      await getProduct(req, res);
      
      // Verificaciones
      expect(ProductModel.findByPk).toHaveBeenCalledWith('1', expect.objectContaining({
        include: expect.any(Array)
      }));
      expect(res.json).toHaveBeenCalledWith(mockProduct);
    });

    test('debe manejar producto no encontrado', async () => {
      // Configurar request con ID
      req.params = { id: '999' };
      
      // Configurar mock para producto no encontrado
      ProductModel.findByPk.mockResolvedValue(null);
      
      // Llamar a la función
      await getProduct(req, res);
      
      // Verificaciones (ajusta según tu implementación)
      expect(ProductModel.findByPk).toHaveBeenCalledWith('999', expect.any(Object));
      expect(res.json).toHaveBeenCalled();
    });
  });

  describe('createProduct', () => {
    test('debe crear un producto correctamente', async () => {
      // Configurar datos de prueba
      req.body = {
        descripcion: 'Nuevo Producto',
        cantidad: 10,
        precio: 100,
        categoria: 1
      };
      req.file = {
        filename: 'nueva-imagen.jpg'
      };
      
      // Mock de la categoría
      CategoryModel.findByPk.mockResolvedValue({ id: 1, categoryname: 'Herramientas' });
      
      // Mock del producto creado
      const mockCreatedProduct = {
        id: 1,
        descripcion: 'Nuevo Producto',
        cantidad: 10,
        precio: 100,
        categoria: 1,
        image: 'nueva-imagen.jpg'
      };
      
      ProductModel.create.mockResolvedValue(mockCreatedProduct);
      
      // Llamar a la función
      await createProduct(req, res);
      
      // Verificaciones
      expect(CategoryModel.findByPk).toHaveBeenCalledWith(1);
      expect(ProductModel.create).toHaveBeenCalledWith(expect.objectContaining({
        descripcion: 'Nuevo Producto',
        cantidad: 10,
        precio: 100,
        categoria: 1,
        image: 'nueva-imagen.jpg'
      }));
      
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.any(String),
        product: mockCreatedProduct
      }));
    });

    test('debe rechazar producto sin categoría válida', async () => {
      // Configurar datos de prueba
      req.body = {
        descripcion: 'Nuevo Producto',
        cantidad: 10,
        precio: 100,
        categoria: 999 // ID de categoría que no existe
      };
      req.file = {
        filename: 'nueva-imagen.jpg'
      };
      
      // Mock de categoría no encontrada
      CategoryModel.findByPk.mockResolvedValue(null);
      
      // Llamar a la función
      await createProduct(req, res);
      
      // Verificaciones
      expect(CategoryModel.findByPk).toHaveBeenCalledWith(999);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('categoría')
      }));
    });
  });

  describe('updateProduct', () => {
    test('debe actualizar un producto correctamente', async () => {
      // Configurar datos de prueba
      req.params = { id: '1' };
      req.body = {
        descripcion: 'Producto Actualizado',
        cantidad: 15,
        precio: 150,
        categoria: 1
      };
      
      // Mock de la categoría
      CategoryModel.findByPk.mockResolvedValue({ id: 1, categoryname: 'Herramientas' });
      
      // Mock de actualización exitosa
      ProductModel.update.mockResolvedValue([1]); // Indica que se actualizó 1 registro
      
      // Llamar a la función
      await updateProduct(req, res);
      
      // Verificaciones
      expect(CategoryModel.findByPk).toHaveBeenCalledWith(1);
      expect(ProductModel.update).toHaveBeenCalledWith(
        expect.any(Object),
        { where: { id: '1' } }
      );
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Producto actualizado con éxito'
      }));
    });
    
    test('debe rechazar actualización con categoría inválida', async () => {
      // Configurar datos de prueba
      req.params = { id: '1' };
      req.body = {
        descripcion: 'Producto Actualizado',
        cantidad: 15,
        precio: 150,
        categoria: 999 // Categoría que no existe
      };
      
      // Mock de categoría no encontrada
      CategoryModel.findByPk.mockResolvedValue(null);
      
      // Llamar a la función
      await updateProduct(req, res);
      
      // Verificaciones
      expect(CategoryModel.findByPk).toHaveBeenCalledWith(999);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('categoría')
      }));
    });
  });

  describe('deleteProduct', () => {
    test('debe eliminar un producto correctamente', async () => {
      // Configurar datos de prueba
      req.params = { id: '1' };
      
      // Mock de eliminación exitosa
      ProductModel.destroy.mockResolvedValue(1); // Indica que se eliminó 1 registro
      
      // Llamar a la función
      await deleteProduct(req, res);
      
      // Verificaciones
      expect(ProductModel.destroy).toHaveBeenCalledWith({
        where: { id: '1' }
      });
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Producto Eliminado'
      }));
    });
    
    test('debe manejar error al eliminar producto', async () => {
      // Configurar datos de prueba
      req.params = { id: '1' };
      
      // Mock de error al eliminar
      ProductModel.destroy.mockRejectedValue(new Error('Error al eliminar'));
      
      // Llamar a la función
      await deleteProduct(req, res);
      
      // Verificaciones
      expect(ProductModel.destroy).toHaveBeenCalledWith({
        where: { id: '1' }
      });
      expect(res.json).toHaveBeenCalled();
    });
  });
});
// __tests__/integration/inventario/InvOutAPI.test.js
import request from 'supertest';
import app from '../../../app.js';
import db from '../../../database/db.js';
import ProductModel from '../../../models/ProductModel.js';
import InventoryOutModel from '../../../models/InvOutModel.js';
import CategoryModel from '../../../models/CategoryModel.js';

// Función para obtener token de autenticación
const getAuthToken = async () => {
  const response = await request(app)
    .post('/auth/login')
    .send({
      username: 'Administrador',
      password: 'admin123'
    });
  
  return response.body.token;
};

describe('API de Salidas de Inventario', () => {
  let token;
  let testProductId;
  let testInvOutId;
  
  // Configuración inicial
  beforeAll(async () => {
    try {
      // Obtener token para pruebas
      token = await getAuthToken();
      
      // Crear categoría de prueba si no existe
      const testCategory = await CategoryModel.findOrCreate({
        where: { categoryname: 'Categoría de Prueba' },
        defaults: { categoryname: 'Categoría de Prueba' }
      });
      
      const categoryId = testCategory[0].id;
      
      // Crear un producto de prueba con stock suficiente
      const testProduct = await ProductModel.create({
        descripcion: `Producto para Salidas ${Date.now()}`,
        cantidad: 1000, // Stock grande para todas las pruebas
        precio: 25.50,
        categoria: categoryId,
        image: 'test_image.jpg'
      });
      
      testProductId = testProduct.id;
      console.log(`Producto de prueba creado con ID: ${testProductId}`);
    } catch (error) {
      console.error('Error en la configuración inicial:', error);
    }
  });
  
  // Limpieza después de las pruebas
  afterAll(async () => {
    try {
      // Eliminar salida de prueba si existe
      if (testInvOutId) {
        await InventoryOutModel.destroy({
          where: { id: testInvOutId }
        });
        console.log(`Salida de prueba eliminada: ${testInvOutId}`);
      }
      
      // Eliminar producto de prueba
      if (testProductId) {
        await ProductModel.destroy({
          where: { id: testProductId }
        });
        console.log(`Producto de prueba eliminado: ${testProductId}`);
      }
      
      // Cerrar conexión
      await db.close();
    } catch (error) {
      console.error('Error en la limpieza final:', error);
    }
  });
  
  describe('GET /invouts', () => {
    test('debe listar todas las salidas de inventario', async () => {
      const response = await request(app)
        .get('/invouts');
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });
  
  describe('POST /invouts', () => {
    test('debe crear una nueva salida de inventario válida', async () => {
      // Solo si tenemos un producto de prueba
      if (!testProductId) {
        console.log('Saltando prueba: no hay producto de prueba');
        return;
      }
      
      // Verificar stock inicial
      const initialProduct = await ProductModel.findByPk(testProductId);
      const initialStock = initialProduct.cantidad;
      
      // Crear salida
      const salidaData = {
        productos: [
          { product_id: testProductId, cantidad: 50 }
        ],
        obs: 'Salida de prueba generada por test de integración'
      };
      
      const response = await request(app)
        .post('/invouts')
        .set('Authorization', `Bearer ${token}`)
        .send(salidaData);
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', 'Salida registrada con éxito.');
      expect(response.body).toHaveProperty('inventoryOut');
      expect(response.body.inventoryOut).toHaveProperty('id');
      
      // Guardar ID para limpieza y otras pruebas
      testInvOutId = response.body.inventoryOut.id;
      console.log(`Salida de prueba creada con ID: ${testInvOutId}`);
      
      // Verificar que el stock se haya actualizado correctamente
      const updatedProduct = await ProductModel.findByPk(testProductId);
      expect(updatedProduct.cantidad).toBe(initialStock - 50);
    });
    
    test('debe rechazar salida con cantidad excesiva', async () => {
      if (!testProductId) return;
      
      const producto = await ProductModel.findByPk(testProductId);
      const stockActual = producto.cantidad;
      
      // Intentar sacar más de lo disponible
      const salidaInvalida = {
        productos: [
          { product_id: testProductId, cantidad: stockActual + 100 }
        ],
        obs: 'Salida inválida con cantidad excesiva'
      };
      
      const response = await request(app)
        .post('/invouts')
        .set('Authorization', `Bearer ${token}`)
        .send(salidaInvalida);
      
      // Debería rechazar la operación
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('insuficiente');
    });
    
    test('debe rechazar salida sin autenticación', async () => {
      if (!testProductId) return;
      
      const salidaData = {
        productos: [
          { product_id: testProductId, cantidad: 10 }
        ],
        obs: 'Salida sin autenticación'
      };
      
      const response = await request(app)
        .post('/invouts')
        .send(salidaData);
      
      expect(response.status).toBe(401);
    });
    
    test('debe rechazar salida con datos incompletos', async () => {
      const salidaIncompleta = {
        // Sin productos
        obs: 'Salida incompleta'
      };
      
      const response = await request(app)
        .post('/invouts')
        .set('Authorization', `Bearer ${token}`)
        .send(salidaIncompleta);
      
      expect(response.status).toBe(400);
    });
  });
  
  describe('GET /invouts/:id', () => {
    test('debe obtener una salida específica por ID', async () => {
      // Solo si tenemos una salida de prueba
      if (!testInvOutId) {
        console.log('Saltando prueba: no hay salida de prueba');
        return;
      }
      
      const response = await request(app)
        .get(`/invouts/${testInvOutId}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', testInvOutId);
      expect(response.body).toHaveProperty('codigo');
      expect(response.body).toHaveProperty('productos');
      expect(Array.isArray(response.body.productos)).toBe(true);
    });
    
    test('debe retornar 404 para una salida inexistente', async () => {
      const response = await request(app)
        .get('/invouts/999999'); // ID que probablemente no existe
      
      expect(response.status).toBe(404);
    });
  });
   
  // Prueba adicional: Integración entre inventario y salidas
  describe('Integración Inventario-Salidas', () => {
    test('debe actualizar el inventario correctamente después de crear salidas', async () => {
      // Solo si no tenemos un ID de producto para pruebas
      if (!testProductId) {
        console.log('Saltando prueba: no se encontró un producto para pruebas');
        return;
      }
      
      const token = await getAuthToken();
      
      // 1. Verificar stock inicial
      const initialProductResponse = await request(app)
        .get(`/products/${testProductId}`);
      
      const initialStock = initialProductResponse.body.cantidad;
      
      // 2. Crear una salida de inventario
      const salidaData = {
        productos: [
          { product_id: testProductId, cantidad: 2 } // Sacar 2 unidades
        ],
        obs: 'Prueba de integración inventario-salidas'
      };
      
      const createResponse = await request(app)
        .post('/invouts')
        .set('Authorization', `Bearer ${token}`)
        .send(salidaData);
      
      expect(createResponse.status).toBe(201);
      
      // 3. Verificar que el stock se haya actualizado correctamente
      const updatedProductResponse = await request(app)
        .get(`/products/${testProductId}`);
      
      const updatedStock = updatedProductResponse.body.cantidad;
      
      // El stock debe haberse reducido en la cantidad de la salida
      expect(updatedStock).toBe(initialStock - 2);
      
      // No hacemos pruebas de eliminación, solo verificamos la salida y actualización de stock
    });
  });
});
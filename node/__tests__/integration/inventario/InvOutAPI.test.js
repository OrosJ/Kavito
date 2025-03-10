import request from 'supertest';
import app from '../../../app.js';
import db from '../../../database/db.js';
import InventoryOutModel from '../../../models/InvOutModel.js';
import ProductModel from '../../../models/ProductModel.js';
import { Op } from 'sequelize';

// obtener un token de autenticación
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
  let createdInvOutId;
  let testProductId;
  
  // Configuración antes de todas las pruebas
  beforeAll(async () => {
    try {
      // Obtener token para pruebas
      token = await getAuthToken();
      
      // Crear un producto de prueba o usar uno existente
      const existingProduct = await ProductModel.findOne({
        where: {
          cantidad: {
            [Op.gte]: 10 // Producto con al menos 10 unidades
          }
        }
      });
      
      if (existingProduct) {
        testProductId = existingProduct.id;
      } else {
        // Crear un producto nuevo para pruebas
        const newProduct = await ProductModel.create({
          descripcion: 'Producto para pruebas de salidas',
          cantidad: 50,
          precio: 100,
          categoria: 1 // Asegúrate de que esta categoría exista
        });
        testProductId = newProduct.id;
      }
    } catch (error) {
      console.error('Error en configuración de pruebas:', error);
    }
  });
  
  // Limpieza después de todas las pruebas
  afterAll(async () => {
    // Eliminar la salida creada durante pruebas si existe
    if (createdInvOutId) {
      try {
        await InventoryOutModel.destroy({
          where: { id: createdInvOutId }
        });
      } catch (error) {
        console.error('Error al limpiar la salida de prueba:', error);
      }
    }
    
    // Cerrar conexión de base de datos
    await db.close();
  });
  
  // Pruebas de integración
  describe('GET /invouts', () => {
    test('debe listar todas las salidas de inventario', async () => {
      const response = await request(app)
        .get('/invouts');
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });
  
  describe('POST /invouts', () => {
    test('debe crear una nueva salida de inventario', async () => {
      // Verificar que tenemos un ID de producto válido
      expect(testProductId).toBeDefined();
      
      const salidaData = {
        productos: [
          { product_id: testProductId, cantidad: 2 }
        ],
        obs: 'Salida creada por prueba de integración'
      };
      
      const response = await request(app)
        .post('/invouts')
        .set('Authorization', `Bearer ${token}`)
        .send(salidaData);
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', 'Salida registrada con éxito.');
      expect(response.body).toHaveProperty('inventoryOut');
      expect(response.body.inventoryOut).toHaveProperty('id');
      
      // Guardar ID para limpieza posterior
      createdInvOutId = response.body.inventoryOut.id;
    });
    
    test('debe rechazar salida sin productos', async () => {
      const salidaData = {
        productos: [],
        obs: 'Salida inválida sin productos'
      };
      
      const response = await request(app)
        .post('/invouts')
        .set('Authorization', `Bearer ${token}`)
        .send(salidaData);
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });
    
    test('debe rechazar salida con cantidad inválida', async () => {
      const salidaData = {
        productos: [
          { product_id: testProductId, cantidad: 0 } // Cantidad inválida
        ],
        obs: 'Salida inválida con cantidad cero'
      };
      
      const response = await request(app)
        .post('/invouts')
        .set('Authorization', `Bearer ${token}`)
        .send(salidaData);
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });
    
    test('debe rechazar salida sin token de autenticación', async () => {
      const salidaData = {
        productos: [
          { product_id: testProductId, cantidad: 1 }
        ],
        obs: 'Salida sin autenticación'
      };
      
      const response = await request(app)
        .post('/invouts')
        .send(salidaData);
      
      expect(response.status).toBe(401);
    });
  });
  
  describe('GET /invouts/:id', () => {
    test('debe obtener una salida específica por ID', async () => {
      // Solo si tenemos un ID de salida creada
      if (!createdInvOutId) {
        console.log('Saltando prueba: no se creó una salida previamente');
        return;
      }
      
      const response = await request(app)
        .get(`/invouts/${createdInvOutId}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', createdInvOutId);
      expect(response.body).toHaveProperty('codigo');
      expect(response.body).toHaveProperty('productos');
      expect(Array.isArray(response.body.productos)).toBe(true);
    });
    
    test('debe retornar 404 para ID de salida inexistente', async () => {
      const response = await request(app)
        .get('/invouts/9999999'); // ID que probablemente no existe
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Registro de salida no encontrado');
    });
  });
  
  describe('DELETE /invouts/:id', () => {
    test('debe eliminar una salida existente', async () => {
      // Solo si tenemos un ID de salida creada
      if (!createdInvOutId) {
        console.log('Saltando prueba: no se creó una salida previamente');
        return;
      }
      
      const response = await request(app)
        .delete(`/invouts/${createdInvOutId}`)
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Registro eliminado con éxito');
      
      // Marcar como eliminado para evitar limpieza posterior
      createdInvOutId = null;
    });
    
    test('debe retornar 404 al intentar eliminar una salida inexistente', async () => {
      const response = await request(app)
        .delete('/invouts/9999999') // ID que probablemente no existe
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Registro de salida no encontrado');
    });
  });
});
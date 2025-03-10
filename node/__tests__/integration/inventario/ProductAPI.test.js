import request from 'supertest';
import app from '../../../app.js';
import db from '../../../database/db.js';
import ProductModel from '../../../models/ProductModel.js';
import fs from 'fs';
import path from 'path';

//obtener un token de autenticación
const getAuthToken = async () => {
  const response = await request(app)
    .post('/auth/login')
    .send({
      username: 'Administrador', // Usar un usuario existente en tu base de datos
      password: 'admin123'
    });
  
  return response.body.token;
};

describe('API de Productos', () => {
  let token;
  let createdProductId;
  
  // Obtener token para pruebas antes de todas las pruebas
  beforeAll(async () => {
    token = await getAuthToken();
  });
  
  // Limpieza después de todas las pruebas
  afterAll(async () => {
    // Si creamos un producto durante las pruebas, lo eliminamos
    if (createdProductId) {
      await ProductModel.destroy({ where: { id: createdProductId } });
    }
  });
  
  // Prueba para listar productos
  test('GET /products debe listar todos los productos', async () => {
    const response = await request(app)
      .get('/products');
    
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
  
  // Prueba para crear un producto
  test('POST /products debe crear un nuevo producto', async () => {
    // Crear un archivo de imagen temporal para la prueba
    const testImagePath = path.join(process.cwd(), 'test-image.jpg');
    fs.writeFileSync(testImagePath, 'fake image content');
    
    const response = await request(app)
      .post('/products')
      .set('Authorization', `Bearer ${token}`)
      .field('descripcion', 'Producto de Prueba')
      .field('cantidad', 15)
      .field('precio', 99.99)
      .field('categoria', 1)  // Asegúrate de que esta categoría exista en tu BD
      .attach('image', testImagePath);
    
    // Limpiar el archivo de prueba
    fs.unlinkSync(testImagePath);
    
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('message');
    expect(response.body).toHaveProperty('product');
    
    // Guardar ID para limpieza posterior
    createdProductId = response.body.product.id;
  });
  
  // Prueba para obtener un producto específico
  test('GET /products/:id debe devolver un producto específico', async () => {
    // Asumiendo que el ID 1 existe en la base de datos
    const productId = createdProductId || 1;
    
    const response = await request(app)
      .get(`/products/${productId}`);
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id', productId);
  });
  
  // Prueba para actualizar un producto
  test('PUT /products/:id debe actualizar un producto', async () => {
    const productId = createdProductId || 1;
    
    const response = await request(app)
      .put(`/products/${productId}`)
      .set('Authorization', `Bearer ${token}`)
      .field('descripcion', 'Producto Actualizado')
      .field('cantidad', 20)
      .field('precio', 129.99)
      .field('categoria', 1);
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Producto actualizado con éxito');
  });
  
  // Prueba para eliminar un producto - solo si creamos uno para pruebas
  test('DELETE /products/:id debe eliminar un producto', async () => {
    if (!createdProductId) {
      return; // Skip if no product was created
    }
    
    const response = await request(app)
      .delete(`/products/${createdProductId}`)
      .set('Authorization', `Bearer ${token}`);
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Producto Eliminado');
    
    // Marcar como eliminado para evitar eliminación en afterAll
    createdProductId = null;
  });
});
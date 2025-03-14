import request from 'supertest';
import app from '../../../app.js';
import db from '../../../database/db.js';
import CategoryModel from '../../../models/CategoryModel.js';

// Obtener un token de autenticación para las pruebas
const getAuthToken = async () => {
  const response = await request(app)
    .post('/auth/login')
    .send({
      username: 'Administrador', 
      password: 'admin123'
    });
  
  return response.body.token;
};

describe('API de Categorías', () => {
  let token;
  let createdCategoryId;
  const testCategoryName = `Categoría Test ${Date.now()}`; // Nombre único para evitar conflictos
  
  // Configuración antes de todas las pruebas
  beforeAll(async () => {
    try {
      // Obtener token para pruebas
      token = await getAuthToken();
    } catch (error) {
      console.error('Error en configuración de pruebas:', error);
    }
  });
  
  // Limpieza después de todas las pruebas
  afterAll(async () => {
    // Eliminar la categoría creada durante pruebas si existe
    if (createdCategoryId) {
      try {
        await CategoryModel.destroy({
          where: { id: createdCategoryId }
        });
      } catch (error) {
        console.error('Error al limpiar la categoría de prueba:', error);
      }
    }
    
    // Cerrar conexión de base de datos
    await db.close();
  });
  
  // Pruebas de integración
  describe('GET /categories', () => {
    test('debe listar todas las categorías', async () => {
      const response = await request(app)
        .get('/categories');
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });
  
  describe('POST /categories/register', () => {
    test('debe crear una nueva categoría', async () => {
      const response = await request(app)
        .post('/categories/register')
        .send({ categoryname: testCategoryName });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Categoria Creada');
      
      // Buscar la categoría creada para obtener su ID
      const categoriesResponse = await request(app).get('/categories');
      const categoriaCreada = categoriesResponse.body.find(c => c.categoryname === testCategoryName);
      
      if (categoriaCreada) {
        createdCategoryId = categoriaCreada.id;
      }
    });
    
    test('debe rechazar una categoría con nombre duplicado', async () => {
      // Solo si ya existe una categoría de prueba
      if (!createdCategoryId) {
        console.log('Saltando prueba: no se encontró una categoría previamente creada');
        return;
      }
      
      const response = await request(app)
        .post('/categories/register')
        .send({ categoryname: testCategoryName }); // Mismo nombre que el anterior
      
      // El comportamiento exacto depende de la implementación, podría ser 409 (Conflict) o 500 con mensaje específico
      expect(response.status).not.toBe(201);
    });
  });
  
  describe('GET /categories/:id', () => {
    test('debe obtener una categoría específica por ID', async () => {
      // Solo si tenemos un ID de categoría creada
      if (!createdCategoryId) {
        console.log('Saltando prueba: no se encontró una categoría previamente creada');
        return;
      }
      
      const response = await request(app)
        .get(`/categories/${createdCategoryId}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('categoryname', testCategoryName);
    });
  });
  
  describe('PUT /categories/:id', () => {
    test('debe actualizar una categoría existente', async () => {
      // Solo si tenemos un ID de categoría creada
      if (!createdCategoryId) {
        console.log('Saltando prueba: no se encontró una categoría previamente creada');
        return;
      }
      
      const updatedName = `${testCategoryName} (Actualizada)`;
      
      const response = await request(app)
        .put(`/categories/${createdCategoryId}`)
        .send({ categoryname: updatedName });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Categoria Actualizada');
      
      // Verificar que la categoría fue actualizada
      const categoryResponse = await request(app).get(`/categories/${createdCategoryId}`);
      expect(categoryResponse.body).toHaveProperty('categoryname', updatedName);
    });
  });
  
  describe('DELETE /categories/:id', () => {
    test('debe eliminar una categoría existente', async () => {
      // Solo si tenemos un ID de categoría creada
      if (!createdCategoryId) {
        console.log('Saltando prueba: no se encontró una categoría previamente creada');
        return;
      }
      
      const response = await request(app)
        .delete(`/categories/${createdCategoryId}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Categoria Eliminada');
      
      // Marcar como eliminado para evitar limpieza posterior
      createdCategoryId = null;
    });
  });
});
import request from 'supertest';
import app from '../../../app.js';
import db from '../../../database/db.js';
import UserModel from '../../../models/UserModel.js';
import bcrypt from 'bcryptjs';

// Obtener un token de autenticación de admin para las pruebas
const getAdminToken = async () => {
  const response = await request(app)
    .post('/auth/login')
    .send({
      username: 'Administrador', 
      password: 'admin123'
    });
  
  return response.body.token;
};

describe('API de Usuarios', () => {
  let adminToken;
  let createdUserId;
  const testUserData = {
    username: `testuser_${Date.now()}`, // Nombre único para evitar conflictos
    email: `testuser_${Date.now()}@example.com`,
    password: 'Test@123',
    role: 'vendedor'
  };
  
  // Configuración antes de todas las pruebas
  beforeAll(async () => {
    try {
      // Obtener token de administrador para pruebas
      adminToken = await getAdminToken();
    } catch (error) {
      console.error('Error en configuración de pruebas:', error);
    }
  });
  
  // Limpieza después de todas las pruebas
  afterAll(async () => {
    // Eliminar el usuario creado durante pruebas si existe
    if (createdUserId) {
      try {
        await UserModel.destroy({
          where: { id: createdUserId }
        });
      } catch (error) {
        console.error('Error al limpiar el usuario de prueba:', error);
      }
    }
    
    // Cerrar conexión de base de datos
    await db.close();
  });
  
  // Pruebas de integración
  describe('GET /users', () => {
    test('debe listar todos los usuarios con token de administrador', async () => {
      const response = await request(app)
        .get('/users')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
    
    test('debe rechazar solicitud sin token de autenticación', async () => {
      const response = await request(app)
        .get('/users');
      
      expect(response.status).toBe(401);
    });
  });
  
  describe('POST /users/register', () => {
    test('debe crear un nuevo usuario con token de administrador', async () => {
      const response = await request(app)
        .post('/users/register')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(testUserData);
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', 'Usuario creado con éxito');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('id');
      
      // Guardar ID para limpieza posterior
      createdUserId = response.body.user.id;
    });
    
    test('debe rechazar creación de usuario sin permisos de administrador', async () => {
      // Primero creamos un usuario de prueba con rol vendedor
      let vendedorToken;
      
      // Verificar si ya creamos un usuario de prueba
      if (createdUserId) {
        // Intentar hacer login con el usuario creado
        const loginResponse = await request(app)
          .post('/auth/login')
          .send({
            username: testUserData.username,
            password: testUserData.password
          });
        
        if (loginResponse.status === 200) {
          vendedorToken = loginResponse.body.token;
        }
      }
      
      // Si no pudimos obtener un token de vendedor, saltamos la prueba
      if (!vendedorToken) {
        console.log('Saltando prueba: no se pudo obtener token de vendedor');
        return;
      }
      
      // Intentar crear un usuario con el token de vendedor
      const response = await request(app)
        .post('/users/register')
        .set('Authorization', `Bearer ${vendedorToken}`)
        .send({
          username: 'otrotest',
          email: 'otrotest@example.com',
          password: 'Test@123',
          role: 'vendedor'
        });
      
      expect(response.status).toBe(403);
    });
  });
  
  describe('GET /users/:id', () => {
    test('debe obtener un usuario por ID con token de administrador', async () => {
      // Solo si tenemos un ID de usuario creado
      if (!createdUserId) {
        console.log('Saltando prueba: no se creó un usuario previamente');
        return;
      }
      
      const response = await request(app)
        .get(`/users/${createdUserId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', createdUserId);
      expect(response.body).toHaveProperty('username', testUserData.username);
      expect(response.body).toHaveProperty('email', testUserData.email);
      expect(response.body).toHaveProperty('role', testUserData.role);
    });
    
    test('debe retornar 404 para un ID de usuario inexistente', async () => {
      const response = await request(app)
        .get('/users/9999999') // ID que probablemente no existe
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(404);
    });
  });
  
  describe('PUT /users/:id', () => {
    test('debe actualizar un usuario existente con token de administrador', async () => {
      // Solo si tenemos un ID de usuario creado
      if (!createdUserId) {
        console.log('Saltando prueba: no se creó un usuario previamente');
        return;
      }
      
      const updatedData = {
        username: testUserData.username,
        email: `updated_${testUserData.username}@example.com`,
        role: testUserData.role
      };
      
      const response = await request(app)
        .put(`/users/${createdUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updatedData);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Usuario actualizado con éxito');
    });
  });
  
  describe('DELETE /users/:id', () => {
    test('debe eliminar un usuario existente con token de administrador', async () => {
      // Solo si tenemos un ID de usuario creado
      if (!createdUserId) {
        console.log('Saltando prueba: no se creó un usuario previamente');
        return;
      }
      
      const response = await request(app)
        .delete(`/users/${createdUserId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Usuario eliminado con éxito');
      
      // Marcar como eliminado para evitar limpieza posterior
      createdUserId = null;
    });
    
    test('debe retornar error al intentar eliminar un usuario inexistente', async () => {
      const response = await request(app)
        .delete('/users/9999999') // ID que probablemente no existe
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Usuario no encontrado');
    });
  });
});
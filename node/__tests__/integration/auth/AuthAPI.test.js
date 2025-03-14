import request from 'supertest';
import app from '../../../app.js';
import db from '../../../database/db.js';
import UserModel from '../../../models/UserModel.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

describe('API de Autenticación', () => {
  let testUserId;
  const testUserData = {
    username: `testauth_${Date.now()}`, // Nombre único para evitar conflictos
    email: `testauth_${Date.now()}@example.com`,
    password: 'Test@123',
    role: 'vendedor'
  };
  
  // Crear un usuario de prueba antes de todas las pruebas
  beforeAll(async () => {
    try {
      // Encriptar la contraseña como lo hace el controlador real
      const hashedPassword = await bcrypt.hash(testUserData.password, 10);
      
      // Crear un usuario para pruebas
      const user = await UserModel.create({
        username: testUserData.username,
        email: testUserData.email,
        password: hashedPassword,
        role: testUserData.role
      });
      
      testUserId = user.id;
    } catch (error) {
      console.error('Error al crear usuario de prueba:', error);
    }
  });
  
  // Eliminar el usuario de prueba después de todas las pruebas
  afterAll(async () => {
    if (testUserId) {
      try {
        await UserModel.destroy({
          where: { id: testUserId }
        });
      } catch (error) {
        console.error('Error al limpiar usuario de prueba:', error);
      }
    }
    
    // Cerrar la conexión a la base de datos
    await db.close();
  });
  
  describe('POST /auth/login', () => {
    test('debe iniciar sesión correctamente con credenciales válidas', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          username: testUserData.username,
          password: testUserData.password
        });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      
      // Verificar que el token sea válido
      const token = response.body.token;
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      expect(decoded).toHaveProperty('userId');
      expect(decoded).toHaveProperty('username', testUserData.username);
      expect(decoded).toHaveProperty('role', testUserData.role);
    });
    
    test('debe rechazar el inicio de sesión con contraseña incorrecta', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          username: testUserData.username,
          password: 'ContraseñaIncorrecta'
        });
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('msg', 'Contraseña incorrecta');
    });
    
    test('debe rechazar el inicio de sesión con usuario inexistente', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          username: 'usuarioInexistente',
          password: 'cualquierContraseña'
        });
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('msg', 'Usuario no encontrado');
    });
  });
  
  describe('Verificación de token', () => {
    test('las rutas protegidas deben rechazar peticiones sin token', async () => {
      // Probar una ruta que sabemos que requiere autenticación
      const response = await request(app).get('/projects');
      
      expect(response.status).toBe(401);
    });
    
    test('las rutas protegidas deben aceptar peticiones con token válido', async () => {
      // Primero obtenemos un token válido
      const loginResponse = await request(app)
        .post('/auth/login')
        .send({
          username: testUserData.username,
          password: testUserData.password
        });
      
      const token = loginResponse.body.token;
      
      // Luego probamos la ruta protegida
      const response = await request(app)
        .get('/projects')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(200);
    });
    
    test('las rutas protegidas deben rechazar tokens inválidos', async () => {
      // Usar un token claramente inválido
      const invalidToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
      
      const response = await request(app)
        .get('/projects')
        .set('Authorization', `Bearer ${invalidToken}`);
      
      expect(response.status).toBe(403); // Forbidden o Unauthorized
    });
  });
});
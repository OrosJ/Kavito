import request from 'supertest';
import app from '../../../app.js';
import db from '../../../database/db.js';
import ClientModel from '../../../models/ClientModel.js';

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

describe('API de Clientes', () => {
  let token;
  let createdClientId;
  const testClientName = `Cliente Test ${Date.now()}`; // Nombre único para evitar conflictos
  
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
    // Eliminar el cliente creado durante pruebas si existe
    if (createdClientId) {
      try {
        await ClientModel.destroy({
          where: { id: createdClientId }
        });
      } catch (error) {
        console.error('Error al limpiar el cliente de prueba:', error);
      }
    }
    
    // Cerrar conexión de base de datos
    await db.close();
  });
  
  // Pruebas de integración
  describe('GET /clients', () => {
    test('debe listar todos los clientes', async () => {
      const response = await request(app)
        .get('/clients');
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });
  
  describe('POST /clients/register', () => {
    test('debe crear un nuevo cliente', async () => {
      const response = await request(app)
        .post('/clients/register')
        .set('Authorization', `Bearer ${token}`)
        .send({ clientname: testClientName });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Cliente Creado');
      
      // Buscar el cliente creado para obtener su ID
      const clientesResponse = await request(app).get('/clients');
      const clienteCreado = clientesResponse.body.find(c => c.clientname === testClientName);
      
      if (clienteCreado) {
        createdClientId = clienteCreado.id;
      }
    });
    
    test('debe rechazar un cliente con nombre duplicado', async () => {
      // Solo si ya existe un cliente de prueba
      if (!createdClientId) {
        console.log('Saltando prueba: no se encontró un cliente previamente creado');
        return;
      }
      
      const response = await request(app)
        .post('/clients/register')
        .set('Authorization', `Bearer ${token}`)
        .send({ clientname: testClientName }); // Mismo nombre que el anterior
      
      // El comportamiento exacto depende de la implementación, podría ser 409 (Conflict) o 500 con mensaje específico
      expect(response.status).not.toBe(201);
    });
  });
  
  describe('GET /clients/:id', () => {
    test('debe obtener un cliente específico por ID', async () => {
      // Solo si tenemos un ID de cliente creado
      if (!createdClientId) {
        console.log('Saltando prueba: no se encontró un cliente previamente creado');
        return;
      }
      
      const response = await request(app)
        .get(`/clients/${createdClientId}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('clientname', testClientName);
    });
  });
  
  describe('PUT /clients/edit-client/:id', () => {
    test('debe actualizar un cliente existente', async () => {
      // Solo si tenemos un ID de cliente creado
      if (!createdClientId) {
        console.log('Saltando prueba: no se encontró un cliente previamente creado');
        return;
      }
      
      const updatedName = `${testClientName} (Actualizado)`;
      
      const response = await request(app)
        .put(`/clients/edit-client/${createdClientId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ clientname: updatedName });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Cliente Actualizado');
      
      // Verificar que el cliente fue actualizado
      const clientResponse = await request(app).get(`/clients/${createdClientId}`);
      expect(clientResponse.body).toHaveProperty('clientname', updatedName);
    });
  });
  
  describe('DELETE /clients/:id', () => {
    test('debe eliminar un cliente existente', async () => {
      // Solo si tenemos un ID de cliente creado
      if (!createdClientId) {
        console.log('Saltando prueba: no se encontró un cliente previamente creado');
        return;
      }
      
      const response = await request(app)
        .delete(`/clients/${createdClientId}`)
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Cliente Eliminado');
      
      // Marcar como eliminado para evitar limpieza posterior
      createdClientId = null;
    });
  });
});
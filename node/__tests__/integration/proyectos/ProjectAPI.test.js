import request from 'supertest';
import app from '../../../app.js';
import db from '../../../database/db.js';
import ProjectModel from '../../../models/ProjectModel.js';
import ClientModel from '../../../models/ClientModel.js';
import { Op } from 'sequelize';

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

describe('API de Proyectos', () => {
  let token;
  let createdProjectId;
  let testClientId;
  
  // Configuración antes de todas las pruebas
  beforeAll(async () => {
    try {
      // Obtener token para pruebas
      token = await getAuthToken();
      
      // Buscar o crear un cliente para las pruebas
      const existingClient = await ClientModel.findOne();
      
      if (existingClient) {
        testClientId = existingClient.id;
      } else {
        // Crear un cliente nuevo para pruebas
        const newClient = await ClientModel.create({
          clientname: 'Cliente para pruebas de proyecto'
        });
        testClientId = newClient.id;
      }
    } catch (error) {
      console.error('Error en configuración de pruebas:', error);
    }
  });
  
  // Limpieza después de todas las pruebas
  afterAll(async () => {
    // Eliminar el proyecto creado durante pruebas si existe
    if (createdProjectId) {
      try {
        await ProjectModel.destroy({
          where: { id: createdProjectId }
        });
      } catch (error) {
        console.error('Error al limpiar el proyecto de prueba:', error);
      }
    }
    
    // Cerrar conexión de base de datos
    await db.close();
  });
  
  // Pruebas de integración
  describe('GET /projects', () => {
    test('debe listar todos los proyectos con autenticación', async () => {
      const response = await request(app)
        .get('/projects')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
    
    test('debe rechazar solicitud sin token de autenticación', async () => {
      const response = await request(app)
        .get('/projects');
      
      expect(response.status).toBe(401);
    });
  });
  
  describe('POST /projects', () => {
    test('debe crear un nuevo proyecto', async () => {
      // Verificar que tenemos un ID de cliente válido
      expect(testClientId).toBeDefined();
      
      // Generar fechas válidas para el proyecto
      const today = new Date();
      const futureDate = new Date();
      futureDate.setMonth(futureDate.getMonth() + 1); // Un mes en el futuro
      
      const proyectoData = {
        nombre: 'Proyecto de Prueba',
        descripcion: 'Proyecto creado por prueba de integración',
        fecha_inicio: today.toISOString().split('T')[0],
        fecha_entrega: futureDate.toISOString().split('T')[0],
        client_id: testClientId,
        productos: [
          // Opcional: añadir productos si se requieren para la creación
        ],
        prioridad: 'MEDIA'
      };
      
      const response = await request(app)
        .post('/projects')
        .set('Authorization', `Bearer ${token}`)
        .send(proyectoData);
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', 'Proyecto creado exitosamente');
      expect(response.body).toHaveProperty('project');
      expect(response.body.project).toHaveProperty('id');
      
      // Guardar ID para limpieza posterior
      createdProjectId = response.body.project.id;
    });
    
    test('debe rechazar proyecto con fechas inválidas', async () => {
      const today = new Date();
      const pastDate = new Date();
      pastDate.setMonth(pastDate.getMonth() - 1); // Un mes en el pasado
      
      const proyectoInvalido = {
        nombre: 'Proyecto Inválido',
        descripcion: 'Proyecto con fechas inválidas',
        fecha_inicio: today.toISOString().split('T')[0],
        fecha_entrega: pastDate.toISOString().split('T')[0], // Fecha anterior a inicio
        client_id: testClientId
      };
      
      const response = await request(app)
        .post('/projects')
        .set('Authorization', `Bearer ${token}`)
        .send(proyectoInvalido);
      
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('message');
    });
  });
  
  describe('GET /projects/:id', () => {
    test('debe obtener un proyecto específico por ID', async () => {
      // Solo si tenemos un ID de proyecto creado
      if (!createdProjectId) {
        console.log('Saltando prueba: no se creó un proyecto previamente');
        return;
      }
      
      const response = await request(app)
        .get(`/projects/${createdProjectId}`)
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', createdProjectId);
      expect(response.body).toHaveProperty('nombre');
      expect(response.body).toHaveProperty('client');
    });
    
    test('debe retornar 404 para ID de proyecto inexistente', async () => {
      const response = await request(app)
        .get('/projects/9999999') // ID que probablemente no existe
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Proyecto no encontrado');
    });
  });
  
  describe('PUT /projects/:id', () => {
    test('debe actualizar un proyecto existente', async () => {
      // Solo si tenemos un ID de proyecto creado
      if (!createdProjectId) {
        console.log('Saltando prueba: no se creó un proyecto previamente');
        return;
      }
      
      const updatedData = {
        nombre: 'Proyecto Actualizado',
        descripcion: 'Descripción actualizada por prueba',
      };
      
      const response = await request(app)
        .put(`/projects/${createdProjectId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updatedData);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Proyecto actualizado exitosamente');
    });
  });
  
  describe('PUT /projects/:id/status', () => {
    test('debe actualizar el estado de un proyecto', async () => {
      // Solo si tenemos un ID de proyecto creado
      if (!createdProjectId) {
        console.log('Saltando prueba: no se creó un proyecto previamente');
        return;
      }
      
      const statusData = {
        estado: 'EN_PROGRESO',
        notas: 'Iniciando el proyecto'
      };
      
      const response = await request(app)
        .put(`/projects/${createdProjectId}/status`)
        .set('Authorization', `Bearer ${token}`)
        .send(statusData);
      
      expect(response.status).toBe(200);
      expect(response.body.respuesta).toHaveProperty('message', 'Proyecto en_progreso exitosamente');
    });
  });
  
  describe('DELETE /projects/:id', () => {
    test('debe eliminar un proyecto existente', async () => {
      // Solo si tenemos un ID de proyecto creado
      if (!createdProjectId) {
        console.log('Saltando prueba: no se creó un proyecto previamente');
        return;
      }
      
      const response = await request(app)
        .delete(`/projects/${createdProjectId}`)
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Proyecto eliminado correctamente');
      
      // Marcar como eliminado para evitar limpieza posterior
      createdProjectId = null;
    });
    
    test('debe retornar 404 al intentar eliminar un proyecto inexistente', async () => {
      const response = await request(app)
        .delete('/projects/9999999') // ID que probablemente no existe
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Proyecto no encontrado');
    });
  });
});
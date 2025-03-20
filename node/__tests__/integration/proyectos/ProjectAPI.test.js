// __tests__/integration/proyectos/ProjectAPI.test.js
import request from 'supertest';
import app from '../../../app.js';
import db from '../../../database/db.js';
import ProjectModel from '../../../models/ProjectModel.js';
import ProductModel from '../../../models/ProductModel.js';
import ClientModel from '../../../models/ClientModel.js';
import { ProjectProduct } from '../../../models/ProjectProductModel.js';
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

describe('API de Proyectos', () => {
  let token;
  let testClientId;
  let testProductId;
  let testProjectId;
  
  // Configuración antes de todas las pruebas
  beforeAll(async () => {
    try {
      // Obtener token para pruebas
      token = await getAuthToken();
      
      // Crear un cliente de prueba
      const clientResponse = await ClientModel.findOrCreate({
        where: { clientname: 'Cliente de Prueba' },
        defaults: { clientname: 'Cliente de Prueba' }
      });
      testClientId = clientResponse[0].id;
      
      // Crear una categoría de prueba
      const categoryResponse = await CategoryModel.findOrCreate({
        where: { categoryname: 'Categoría para Proyectos' },
        defaults: { categoryname: 'Categoría para Proyectos' }
      });
      const categoryId = categoryResponse[0].id;
      
      // Crear un producto de prueba con stock suficiente
      const productResponse = await ProductModel.create({
        descripcion: `Producto para Proyectos ${Date.now()}`,
        cantidad: 1000,
        precio: 25.50,
        categoria: categoryId,
        image: 'test_image.jpg'
      });
      testProductId = productResponse.id;
      
      console.log(`Configuración inicial completada: Cliente ID=${testClientId}, Producto ID=${testProductId}`);
    } catch (error) {
      console.error('Error en la configuración inicial:', error);
    }
  });
  
  // Limpieza después de todas las pruebas
  afterAll(async () => {
    try {
      // Eliminar el proyecto de prueba si existe
      if (testProjectId) {
        await ProjectModel.destroy({
          where: { id: testProjectId }
        });
        console.log(`Proyecto de prueba eliminado: ${testProjectId}`);
      }
      
      // Eliminar el producto de prueba
      if (testProductId) {
        await ProductModel.destroy({
          where: { id: testProductId }
        });
        console.log(`Producto de prueba eliminado: ${testProductId}`);
      }
      
      // No eliminamos el cliente ya que podría estar siendo usado en otros tests
      
      // Cerrar la conexión a la base de datos
      await db.close();
    } catch (error) {
      console.error('Error en la limpieza final:', error);
    }
  });
  
  describe('GET /projects', () => {
    test('debe listar todos los proyectos con autenticación', async () => {
      const response = await request(app)
        .get('/projects')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
    
    test('debe rechazar solicitud sin autenticación', async () => {
      const response = await request(app)
        .get('/projects');
      
      expect(response.status).toBe(401);
    });
  });
  
  describe('POST /projects', () => {
    test('debe crear un proyecto con datos válidos', async () => {
      // Verificar que tenemos cliente y producto para las pruebas
      expect(testClientId).toBeDefined();
      expect(testProductId).toBeDefined();
      
      // Generar fechas válidas para el proyecto
      const today = new Date();
      const futureDate = new Date();
      futureDate.setMonth(futureDate.getMonth() + 1); // Un mes en el futuro
      
      const proyectoData = {
        nombre: `Proyecto de Prueba ${Date.now()}`,
        descripcion: 'Proyecto creado por prueba de integración',
        fecha_inicio: today.toISOString().split('T')[0],
        fecha_entrega: futureDate.toISOString().split('T')[0],
        client_id: testClientId,
        productos: [
          {
            product_id: testProductId,
            cantidad_requerida: 50,
            reservar: false // Sin reservar inicialmente
          }
        ],
        prioridad: 'MEDIA',
        direccion: 'Dirección de prueba'
      };
      
      const response = await request(app)
        .post('/projects')
        .set('Authorization', `Bearer ${token}`)
        .send(proyectoData);
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', 'Proyecto creado exitosamente');
      expect(response.body).toHaveProperty('project');
      expect(response.body.project).toHaveProperty('id');
      
      // Guardar ID para pruebas posteriores
      testProjectId = response.body.project.id;
      console.log(`Proyecto de prueba creado con ID: ${testProjectId}`);
      
      // Verificar que los productos fueron asignados correctamente
      expect(response.body.project).toHaveProperty('products');
      expect(response.body.project.products.length).toBeGreaterThan(0);
    });
    
    test('debe rechazar proyecto con fechas inválidas', async () => {
      const today = new Date();
      const pastDate = new Date();
      pastDate.setMonth(pastDate.getMonth() - 1); // Un mes en el pasado
      
      const proyectoInvalido = {
        nombre: 'Proyecto con Fechas Inválidas',
        descripcion: 'Este proyecto tiene fechas inválidas',
        fecha_inicio: today.toISOString().split('T')[0],
        fecha_entrega: pastDate.toISOString().split('T')[0], // Fecha anterior a inicio
        client_id: testClientId,
        productos: [{ product_id: testProductId, cantidad_requerida: 10 }]
      };
      
      const response = await request(app)
        .post('/projects')
        .set('Authorization', `Bearer ${token}`)
        .send(proyectoInvalido);
      
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('message');
    });
    
    test('debe rechazar proyecto sin autenticación', async () => {
      const today = new Date();
      const futureDate = new Date();
      futureDate.setMonth(futureDate.getMonth() + 1);
      
      const proyectoData = {
        nombre: 'Proyecto Sin Auth',
        descripcion: 'Intento de creación sin autenticación',
        fecha_inicio: today.toISOString().split('T')[0],
        fecha_entrega: futureDate.toISOString().split('T')[0],
        client_id: testClientId,
        productos: [{ product_id: testProductId, cantidad_requerida: 10 }]
      };
      
      const response = await request(app)
        .post('/projects')
        .send(proyectoData);
      
      expect(response.status).toBe(401);
    });
  });
  
  describe('GET /projects/:id', () => {
    test('debe obtener un proyecto específico por ID', async () => {
      // Solo si tenemos un ID de proyecto creado
      if (!testProjectId) {
        console.log('Saltando prueba: no se creó un proyecto previamente');
        return;
      }
      
      const response = await request(app)
        .get(`/projects/${testProjectId}`)
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', testProjectId);
      expect(response.body).toHaveProperty('nombre');
      expect(response.body).toHaveProperty('client');
      expect(response.body).toHaveProperty('products');
    });
    
    test('debe retornar 404 para ID de proyecto inexistente', async () => {
      const response = await request(app)
        .get('/projects/9999999') // ID que probablemente no existe
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Proyecto no encontrado');
    });
  });
  
  describe('PUT /projects/:id/status', () => {
    test('debe actualizar el estado de un proyecto', async () => {
      // Solo si tenemos un ID de proyecto creado
      if (!testProjectId) {
        console.log('Saltando prueba: no se creó un proyecto previamente');
        return;
      }
      
      const statusData = {
        estado: 'EN_PROGRESO',
        notas: 'Iniciando el proyecto desde pruebas de integración'
      };
      
      const response = await request(app)
        .put(`/projects/${testProjectId}/status`)
        .set('Authorization', `Bearer ${token}`)
        .send(statusData);
      
      expect(response.status).toBe(200);
      expect(response.body.respuesta).toHaveProperty('message', 'Proyecto en_progreso exitosamente');
      
      // Verificar el cambio de estado
      const updatedProject = await request(app)
        .get(`/projects/${testProjectId}`)
        .set('Authorization', `Bearer ${token}`);
      
      expect(updatedProject.body).toHaveProperty('estado', 'EN_PROGRESO');
    });
    
    test('debe rechazar cambio a estado inválido', async () => {
      if (!testProjectId) return;
      
      // Intentar cambiar a un estado no permitido directamente
      const invalidStatus = {
        estado: 'ESTADO_INVALIDO',
        notas: 'Este cambio debería ser rechazado'
      };
      
      const response = await request(app)
        .put(`/projects/${testProjectId}/status`)
        .set('Authorization', `Bearer ${token}`)
        .send(invalidStatus);
      
      expect(response.status).toBe(400);
    });
  });
  
  describe('Reserva y liberación de productos', () => {
    let projectProductId;
    
    // Obtener el ID de la relación proyecto-producto
    beforeAll(async () => {
      if (testProjectId && testProductId) {
        const projectProduct = await ProjectProduct.findOne({
          where: {
            projectId: testProjectId,
            productId: testProductId
          }
        });
        
        if (projectProduct) {
          projectProductId = projectProduct.id;
          console.log(`ProjectProduct ID: ${projectProductId}`);
        }
      }
    });
    
    test('debe reservar productos para un proyecto', async () => {
      if (!projectProductId) {
        console.log('Saltando prueba: no se encontró la relación proyecto-producto');
        return;
      }
      
      // Obtener stock inicial
      const initialProduct = await ProductModel.findByPk(testProductId);
      const initialStock = initialProduct.cantidad;
      const initialReserved = initialProduct.cantidad_reservada || 0;
      
      // Reservar 20 unidades
      const reserveData = { cantidad: 20 };
      
      const response = await request(app)
        .post(`/project-products/${projectProductId}/reserve`)
        .set('Authorization', `Bearer ${token}`)
        .send(reserveData);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Reserva realizada correctamente');
      
      // Verificar que se actualizó la cantidad reservada
      const updatedProduct = await ProductModel.findByPk(testProductId);
      expect(updatedProduct.cantidad_reservada).toBe(initialReserved + 20);
      
      // El stock total no debería cambiar con una reserva
      expect(updatedProduct.cantidad).toBe(initialStock);
      
      // También verificar que se actualizó en el proyecto
      const updatedProjectProduct = await ProjectProduct.findByPk(projectProductId);
      expect(updatedProjectProduct.cantidad_reservada).toBe(20);
    });
    
    test('debe liberar productos reservados', async () => {
      if (!projectProductId) return;
      
      // Verificar estado antes de liberar
      const productBeforeRelease = await ProductModel.findByPk(testProductId);
      const reservedBeforeRelease = productBeforeRelease.cantidad_reservada || 0;
      
      // Debe haber al menos algo reservado para esta prueba
      expect(reservedBeforeRelease).toBeGreaterThan(0);
      
      // Liberar reservas
      const response = await request(app)
        .put(`/project-products/${projectProductId}/release`)
        .set('Authorization', `Bearer ${token}`)
        .send({});
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Reserva liberada exitosamente');
      
      // Verificar que se actualizó la cantidad reservada
      const updatedProduct = await ProductModel.findByPk(testProductId);
      expect(updatedProduct.cantidad_reservada).toBe(reservedBeforeRelease - 20);
      
      // También verificar que se actualizó en el proyecto
      const updatedProjectProduct = await ProjectProduct.findByPk(projectProductId);
      expect(updatedProjectProduct.cantidad_reservada).toBe(0);
    });
  });
  
  describe('Entrega de productos', () => {
    let projectProductId;
    
    // Obtener nuevamente el ID de la relación proyecto-producto (por si acaso)
    beforeAll(async () => {
      if (testProjectId && testProductId) {
        const projectProduct = await ProjectProduct.findOne({
          where: {
            projectId: testProjectId,
            productId: testProductId
          }
        });
        
        if (projectProduct) {
          projectProductId = projectProduct.id;
        }
      }
    });
    
    test('debe entregar productos a un proyecto', async () => {
      if (!projectProductId) {
        console.log('Saltando prueba: no se encontró la relación proyecto-producto');
        return;
      }
      
      // Obtener stock inicial
      const initialProduct = await ProductModel.findByPk(testProductId);
      const initialStock = initialProduct.cantidad;
      
      // Entregar 15 unidades
      const deliveryData = { cantidad: 15 };
      
      const response = await request(app)
        .post(`/project-products/${projectProductId}/deliver-p`)
        .set('Authorization', `Bearer ${token}`)
        .send(deliveryData);
      
      expect(response.status).toBe(200);
      expect(response.body.respuesta).toHaveProperty('message', 'Entrega realizada correctamente');
      
      // Verificar que se actualizó el stock
      const updatedProduct = await ProductModel.findByPk(testProductId);
      expect(updatedProduct.cantidad).toBe(initialStock - 15);
      
      // Verificar que se actualizó la entrega en el proyecto
      const updatedProjectProduct = await ProjectProduct.findByPk(projectProductId);
      expect(updatedProjectProduct.cantidad_entregada).toBe(15);
    });
    
    test('debe rechazar entrega excesiva', async () => {
      if (!projectProductId) return;
      
      // Obtener datos actuales
      const projectProduct = await ProjectProduct.findByPk(projectProductId);
      const cantidadRequerida = projectProduct.cantidad_requerida;
      const cantidadEntregada = projectProduct.cantidad_entregada;
      const cantidadPendiente = cantidadRequerida - cantidadEntregada;
      
      // Intentar entregar más de lo pendiente
      const excesiveDelivery = { cantidad: cantidadPendiente + 10 };
      
      const response = await request(app)
        .post(`/project-products/${projectProductId}/deliver-p`)
        .set('Authorization', `Bearer ${token}`)
        .send(excesiveDelivery);
      
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('excede');
    });
  });
  
  describe('DELETE /projects/:id', () => {
    test('debe eliminar un proyecto y liberar reservas', async () => {
      // Solo si tenemos un ID de proyecto creado
      if (!testProjectId) {
        console.log('Saltando prueba: no se creó un proyecto previamente');
        return;
      }
      
      // Reservar algunas unidades antes de eliminar
      const projectProduct = await ProjectProduct.findOne({
        where: {
          projectId: testProjectId,
          productId: testProductId
        }
      });
      
      if (projectProduct) {
        // Reservar 10 unidades
        await request(app)
          .post(`/project-products/${projectProduct.id}/reserve`)
          .set('Authorization', `Bearer ${token}`)
          .send({ cantidad: 10 });
      }
      
      // Verificar estado del producto antes de eliminar
      const productBeforeDelete = await ProductModel.findByPk(testProductId);
      const reservedBeforeDelete = productBeforeDelete.cantidad_reservada || 0;
      
      // Debe haber algo reservado
      expect(reservedBeforeDelete).toBeGreaterThan(0);
      
      // Eliminar el proyecto
      const response = await request(app)
        .delete(`/projects/${testProjectId}`)
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Proyecto eliminado correctamente');
      
      // Verificar que las reservas fueron liberadas
      const productAfterDelete = await ProductModel.findByPk(testProductId);
      expect(productAfterDelete.cantidad_reservada).toBe(reservedBeforeDelete - 10);
      
      // Verificar que el proyecto ya no existe
      const projectResponse = await request(app)
        .get(`/projects/${testProjectId}`)
        .set('Authorization', `Bearer ${token}`);
      
      expect(projectResponse.status).toBe(404);
      
      // Marcar como eliminado para evitar limpieza posterior
      testProjectId = null;
    });
  });
});
import { jest } from '@jest/globals';

// Simular el modelo ClientModel
jest.unstable_mockModule('../../../models/ClientModel.js', () => ({
  default: {
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn()
  }
}));

// Importar controladores después de simular
const controllers = await import('../../../controllers/ClientController.js');
const { 
  getAllClients, 
  getClient, 
  createClient, 
  updateClient, 
  deleteClient 
} = controllers;

const ClientModelModule = await import('../../../models/ClientModel.js');
const ClientModel = ClientModelModule.default;

// Suprimir logs de consola durante las pruebas
console.error = jest.fn();
console.log = jest.fn();

describe('ClientController', () => {
  let req, res;
  
  beforeEach(() => {
    // Reiniciar mocks antes de cada prueba
    jest.clearAllMocks();
    
    // Configurar objetos simulados de solicitud y respuesta
    req = {
      body: {},
      params: {}
    };
    
    res = {
      json: jest.fn(() => res),
      status: jest.fn(() => res)
    };
  });

  describe('getAllClients', () => {
    test('debería retornar todos los clientes', async () => {
      // Configurar clientes simulados
      const mockClients = [
        { id: 1, clientname: 'Cliente 1', createdAt: new Date(), updatedAt: new Date() },
        { id: 2, clientname: 'Cliente 2', createdAt: new Date(), updatedAt: new Date() }
      ];
      
      // Configurar mock para retornar los clientes
      ClientModel.findAll.mockResolvedValue(mockClients);
      
      // Llamar a la función del controlador
      await getAllClients(req, res);
      
      // Aserciones
      expect(ClientModel.findAll).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(mockClients);
    });
    
    test('debería manejar error al obtener clientes', async () => {
      // Configurar mock para lanzar un error
      const error = new Error('Error de base de datos');
      ClientModel.findAll.mockRejectedValue(error);
      
      // Llamar a la función del controlador
      await getAllClients(req, res);
      
      // Aserciones
      expect(ClientModel.findAll).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ message: error.message });
    });
  });

  describe('getClient', () => {
    test('debería retornar un cliente por ID', async () => {
      // Configurar parámetros de solicitud
      req.params.id = '1';
      
      // Configurar cliente simulado
      const mockClient = { 
        id: 1, 
        clientname: 'Cliente 1', 
        createdAt: new Date(), 
        updatedAt: new Date() 
      };
      
      // Configurar mock para retornar el cliente
      ClientModel.findAll.mockResolvedValue([mockClient]);
      
      // Llamar a la función del controlador
      await getClient(req, res);
      
      // Aserciones
      expect(ClientModel.findAll).toHaveBeenCalledWith({
        where: { id: '1' }
      });
      expect(res.json).toHaveBeenCalledWith(mockClient);
    });
    
    test('debería manejar error al obtener un cliente', async () => {
      // Configurar parámetros de solicitud
      req.params.id = '1';
      
      // Configurar mock para lanzar un error
      const error = new Error('Error de base de datos');
      ClientModel.findAll.mockRejectedValue(error);
      
      // Llamar a la función del controlador
      await getClient(req, res);
      
      // Aserciones
      expect(res.json).toHaveBeenCalledWith({ message: error.message });
    });
  });

  describe('createClient', () => {
    test('debería crear un nuevo cliente', async () => {
      // Configurar cuerpo de solicitud
      req.body = { clientname: 'Nuevo Cliente' };
      
      // Llamar a la función del controlador
      await createClient(req, res);
      
      // Aserciones
      expect(ClientModel.create).toHaveBeenCalledWith({ clientname: 'Nuevo Cliente' });
      expect(res.json).toHaveBeenCalledWith({ message: 'Cliente Creado' });
    });
    
    test('debería manejar error al crear un cliente', async () => {
      // Configurar cuerpo de solicitud
      req.body = { clientname: 'Nuevo Cliente' };
      
      // Configurar mock para lanzar un error
      const error = new Error('Error de base de datos');
      ClientModel.create.mockRejectedValue(error);
      
      // Llamar a la función del controlador
      await createClient(req, res);
      
      // Aserciones
      expect(res.json).toHaveBeenCalledWith({ message: error.message });
    });
  });

  describe('updateClient', () => {
    test('debería actualizar un cliente', async () => {
      // Configurar parámetros y cuerpo de solicitud
      req.params.id = '1';
      req.body = { clientname: 'Cliente Actualizado' };
      
      // Llamar a la función del controlador
      await updateClient(req, res);
      
      // Aserciones
      expect(ClientModel.update).toHaveBeenCalledWith(
        { clientname: 'Cliente Actualizado' },
        { where: { id: '1' } }
      );
      expect(res.json).toHaveBeenCalledWith({ message: 'Cliente Actualizado' });
    });
    
    test('debería manejar error al actualizar un cliente', async () => {
      // Configurar parámetros y cuerpo de solicitud
      req.params.id = '1';
      req.body = { clientname: 'Cliente Actualizado' };
      
      // Configurar mock para lanzar un error
      const error = new Error('Error de base de datos');
      ClientModel.update.mockRejectedValue(error);
      
      // Llamar a la función del controlador
      await updateClient(req, res);
      
      // Aserciones
      expect(res.json).toHaveBeenCalledWith({ message: error.message });
    });
  });

  describe('deleteClient', () => {
    test('debería eliminar un cliente', async () => {
      // Configurar parámetros de solicitud
      req.params.id = '1';
      
      // Llamar a la función del controlador
      await deleteClient(req, res);
      
      // Aserciones
      expect(ClientModel.destroy).toHaveBeenCalledWith({
        where: { id: '1' }
      });
      expect(res.json).toHaveBeenCalledWith({ message: 'Cliente Eliminado' });
    });
    
    test('debería manejar error al eliminar un cliente', async () => {
      // Configurar parámetros de solicitud
      req.params.id = '1';
      
      // Configurar mock para lanzar un error
      const error = new Error('Error de base de datos');
      ClientModel.destroy.mockRejectedValue(error);
      
      // Llamar a la función del controlador
      await deleteClient(req, res);
      
      // Aserciones
      expect(res.json).toHaveBeenCalledWith({ message: error.message });
    });
  });
});
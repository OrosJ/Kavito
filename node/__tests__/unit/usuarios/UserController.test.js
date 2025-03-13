// Importamos Jest
import { jest } from '@jest/globals';

// Importamos los módulos reales
import * as UserController from '../../../controllers/UserController.js';
import UserModel from '../../../models/UserModel.js';
import bcryptjs from 'bcryptjs';
import jsonwebtoken from 'jsonwebtoken';

// Configuramos los mocks con spyOn
jest.spyOn(UserModel, 'create').mockImplementation(() => Promise.resolve({}));
jest.spyOn(UserModel, 'findAll').mockImplementation(() => Promise.resolve([]));
jest.spyOn(UserModel, 'findByPk').mockImplementation(() => Promise.resolve({}));
jest.spyOn(UserModel, 'update').mockImplementation(() => Promise.resolve([1]));
jest.spyOn(UserModel, 'destroy').mockImplementation(() => Promise.resolve(1));

jest.spyOn(bcryptjs, 'hash').mockImplementation(() => Promise.resolve('hashed_password'));
jest.spyOn(bcryptjs, 'compare').mockImplementation(() => Promise.resolve(true));

jest.spyOn(jsonwebtoken, 'sign').mockImplementation(() => 'token_de_prueba');
jest.spyOn(jsonwebtoken, 'verify').mockImplementation((token, secret, callback) => {
  if (token === 'token_valido' || token.includes('Bearer')) {
    callback(null, { id: 1, role: 'administrador' });
  } else {
    callback(new Error('Token inválido'), null);
  }
});

// Silenciamos logs de consola durante pruebas
console.error = jest.fn();
console.log = jest.fn();

describe('UserController', () => {
  let req, res, next;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    req = {
      body: {},
      params: {},
      header: jest.fn().mockReturnValue('Bearer token_valido'),
      user: { id: 1 }
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    
    next = jest.fn();
    
    // Configurar variables de entorno
    process.env.JWT_SECRET = 'clave_secreta_de_prueba';
    process.env.JWT_EXPIRY = '1h';
  });
  
  describe('createUser', () => {
    test('debería crear un nuevo usuario con los parámetros correctos', async () => {
      // Configuración
      req.body = {
        username: 'usuario1',
        email: 'usuario1@ejemplo.com',
        password: 'contraseña123',
        role: 'administrador'
      };
      
      const nuevoUsuario = { id: 1, ...req.body, password: 'hashed_password' };
      UserModel.create.mockResolvedValue(nuevoUsuario);
      
      // Ejecución
      await UserController.createUser(req, res);
      
      // Verificaciones
      expect(bcryptjs.hash).toHaveBeenCalledWith('contraseña123', 10);
      expect(UserModel.create).toHaveBeenCalledWith(expect.objectContaining({
        username: 'usuario1',
        email: 'usuario1@ejemplo.com',
        password: 'hashed_password',
        role: 'administrador'
      }));
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Usuario creado con éxito',
        user: expect.any(Object)
      }));
    });

    test('debería manejar errores al crear un usuario', async () => {
      // Configuración
      req.body = {
        username: 'usuario1',
        email: 'usuario1@ejemplo.com',
        password: 'contraseña123',
        role: 'administrador'
      };
      
      UserModel.create.mockRejectedValue(new Error('Error de creación'));
      
      // Ejecución
      await UserController.createUser(req, res);
      
      // Verificaciones
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Error al crear usuario'
      }));
    });
  });
  
  describe('getUsers', () => {
    test('debería llamar a getUsers y retornar usuarios', async () => {
      const mockUsuarios = [
        { id: 1, username: 'usuario1', email: 'usuario1@ejemplo.com', role: 'administrador' },
        { id: 2, username: 'usuario2', email: 'usuario2@ejemplo.com', role: 'vendedor' }
      ];
      
      UserModel.findAll.mockResolvedValue(mockUsuarios);
      
      await UserController.getUsers(req, res);
      
      expect(UserModel.findAll).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockUsuarios);
    });

    test('debería manejar errores al obtener usuarios', async () => {
      UserModel.findAll.mockRejectedValue(new Error('Error de base de datos'));
      
      await UserController.getUsers(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Error al obtener los usuarios'
      }));
    });
  });
  
  describe('getUser', () => {
    test('debería retornar un usuario específico', async () => {
      req.params = { id: '1' };
      
      const mockUsuario = { 
        id: 1, 
        username: 'usuario1', 
        email: 'usuario1@ejemplo.com', 
        role: 'administrador' 
      };
      
      UserModel.findByPk.mockResolvedValue(mockUsuario);
      
      await UserController.getUser(req, res);
      
      expect(UserModel.findByPk).toHaveBeenCalledWith('1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockUsuario);
    });

    test('debería retornar 404 si el usuario no se encuentra', async () => {
      req.params = { id: '999' };
      
      UserModel.findByPk.mockResolvedValue(null);
      
      await UserController.getUser(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Usuario no encontrado'
      }));
    });
  });
  
  describe('verifyToken', () => {
    test('debería verificar un token válido y llamar a next', () => {
      req.header.mockReturnValue('Bearer token_valido');
      
      UserController.verifyToken(req, res, next);
      
      expect(req.header).toHaveBeenCalledWith('Authorization');
      expect(jsonwebtoken.verify).toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
    });

    test('debería retornar 401 si no se proporciona token', () => {
      req.header.mockReturnValue(null);
      
      UserController.verifyToken(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Token no proporcionado'
      }));
      expect(next).not.toHaveBeenCalled();
    });
  });
});
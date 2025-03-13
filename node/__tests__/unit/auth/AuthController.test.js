// Importamos Jest
import { jest } from '@jest/globals';

// Importamos los módulos reales
import { loginUser } from '../../../controllers/AuthController.js';
import UserModel from '../../../models/UserModel.js';
import bcryptjs from 'bcryptjs';
import jsonwebtoken from 'jsonwebtoken';

// Configuramos los mocks con spyOn
jest.spyOn(UserModel, 'findOne').mockImplementation(() => Promise.resolve(null));
jest.spyOn(bcryptjs, 'compare').mockImplementation(() => Promise.resolve(true));
jest.spyOn(jsonwebtoken, 'sign').mockImplementation(() => 'token_de_prueba');

// Silenciamos logs de consola durante pruebas
console.error = jest.fn();
console.log = jest.fn();

describe('AuthController', () => {
  let req, res;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    req = {
      body: {}
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    
    // Configurar variables de entorno
    process.env.JWT_SECRET = 'clave_secreta_de_prueba';
    process.env.JWT_EXPIRES_IN = '1h';
  });
  
  describe('loginUser', () => {
    test('debería iniciar sesión exitosamente con credenciales correctas', async () => {
      req.body = {
        username: 'usuario_prueba',
        password: 'contraseña123'
      };
      
      const mockUsuario = {
        id: 1,
        username: 'usuario_prueba',
        password: 'hashed_password',
        role: 'administrador'
      };
      
      UserModel.findOne.mockResolvedValue(mockUsuario);
      bcryptjs.compare.mockResolvedValue(true);
      
      await loginUser(req, res);
      
      expect(UserModel.findOne).toHaveBeenCalledWith({ where: { username: 'usuario_prueba' } });
      expect(bcryptjs.compare).toHaveBeenCalledWith('contraseña123', 'hashed_password');
      expect(jsonwebtoken.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 1,
          username: 'usuario_prueba',
          role: 'administrador'
        }),
        'clave_secreta_de_prueba',
        expect.any(Object)
      );
      expect(res.json).toHaveBeenCalledWith({ token: 'token_de_prueba' });
    });

    test('debería retornar 400 si el usuario no se encuentra', async () => {
      req.body = {
        username: 'usuario_inexistente',
        password: 'contraseña123'
      };
      
      UserModel.findOne.mockResolvedValue(null);
      
      await loginUser(req, res);
      
      expect(UserModel.findOne).toHaveBeenCalledWith({ where: { username: 'usuario_inexistente' } });
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Usuario no encontrado' });
    });

    test('debería retornar 400 si la contraseña es incorrecta', async () => {
      req.body = {
        username: 'usuario_prueba',
        password: 'contraseña_incorrecta'
      };
      
      const mockUsuario = {
        id: 1,
        username: 'usuario_prueba',
        password: 'hashed_password',
        role: 'administrador'
      };
      
      UserModel.findOne.mockResolvedValue(mockUsuario);
      bcryptjs.compare.mockResolvedValue(false);
      
      await loginUser(req, res);
      
      expect(UserModel.findOne).toHaveBeenCalledWith({ where: { username: 'usuario_prueba' } });
      expect(bcryptjs.compare).toHaveBeenCalledWith('contraseña_incorrecta', 'hashed_password');
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Contraseña incorrecta' });
    });

    test('debería manejar errores del servidor durante el inicio de sesión', async () => {
      req.body = {
        username: 'usuario_prueba',
        password: 'contraseña123'
      };
      
      UserModel.findOne.mockRejectedValue(new Error('Error de base de datos'));
      
      await loginUser(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Error del servidor' });
    });
  });
});
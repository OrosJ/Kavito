// Importamos Jest
import { jest } from '@jest/globals';

// Importamos los módulos reales
import { authenticateToken, authorizeRoles } from '../../../middlewares/authMiddleware.js';
import jsonwebtoken from 'jsonwebtoken';

// Configuramos los mocks con spyOn
jest.spyOn(jsonwebtoken, 'verify').mockImplementation((token, secret, callback) => {
  if (token === 'token_valido') {
    callback(null, { id: 1, role: 'administrador' });
  } else {
    callback(new Error('Token inválido'), null);
  }
});

describe('Auth Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    req = {
      header: jest.fn(),
      user: null
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    
    next = jest.fn();
    
    // Configurar variables de entorno
    process.env.JWT_SECRET = 'clave_secreta_de_prueba';
  });
  
  describe('authenticateToken', () => {
    test('debería llamar a next() si el token es válido', () => {
      req.header.mockReturnValue('Bearer token_valido');
      
      jsonwebtoken.verify.mockImplementation((token, secret, callback) => {
        callback(null, { id: 1, role: 'administrador' });
      });
      
      authenticateToken(req, res, next);
      
      expect(req.header).toHaveBeenCalledWith('Authorization');
      expect(jsonwebtoken.verify).toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
    });

    test('debería retornar 401 si no se proporciona token', () => {
      req.header.mockReturnValue(undefined);
      
      authenticateToken(req, res, next);
      
      expect(req.header).toHaveBeenCalledWith('Authorization');
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Token no proporcionado' });
      expect(next).not.toHaveBeenCalled();
    });

    test('debería retornar 403 si el token es inválido', () => {
      req.header.mockReturnValue('Bearer token_invalido');
      
      jsonwebtoken.verify.mockImplementation((token, secret, callback) => {
        callback(new Error('Token inválido'), null);
      });
      
      authenticateToken(req, res, next);
      
      expect(req.header).toHaveBeenCalledWith('Authorization');
      expect(jsonwebtoken.verify).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Token no válido o expirado' });
      expect(next).not.toHaveBeenCalled();
    });
  });
  
  describe('authorizeRoles', () => {
    test('debería llamar a next() si el usuario tiene un rol permitido', () => {
      // Configurar middleware y usuario
      const middleware = authorizeRoles('administrador');
      req.user = { id: 1, role: 'administrador' };
      
      // Ejecutar middleware
      middleware(req, res, next);
      
      // Verificar
      expect(next).toHaveBeenCalled();
    });

    test('debería retornar 403 si el usuario tiene un rol no autorizado', () => {
      // Configurar middleware y usuario
      const middleware = authorizeRoles('administrador');
      req.user = { id: 1, role: 'vendedor' };
      
      // Ejecutar middleware
      middleware(req, res, next);
      
      // Verificar
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ 
        msg: 'No tienes permiso para acceder a este recurso' 
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('debería retornar 403 si no hay información de usuario', () => {
      // Configurar middleware sin usuario
      const middleware = authorizeRoles('administrador');
      req.user = null;
      
      // Ejecutar middleware
      middleware(req, res, next);
      
      // Verificar
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Acceso denegado' });
      expect(next).not.toHaveBeenCalled();
    });

    test('debería aceptar múltiples roles permitidos', () => {
      // Configurar middleware con múltiples roles
      const middleware = authorizeRoles('administrador', 'vendedor');
      req.user = { id: 1, role: 'vendedor' };
      
      // Ejecutar middleware
      middleware(req, res, next);
      
      // Verificar
      expect(next).toHaveBeenCalled();
    });
  });
});
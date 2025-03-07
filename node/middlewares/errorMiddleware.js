import { ValidationError, UniqueConstraintError, ForeignKeyConstraintError } from 'sequelize';

// Clase personalizada para errores de la API
export class ApiError extends Error {
  constructor(statusCode, message, isOperational = true, stack = '') {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational; // Errores operacionales vs programación
    this.success = false;
    
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

// Middleware para convertir errores a respuesta JSON
export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  
  // Log del error para fines de depuración
  console.error(`${req.method} ${req.path} - Error: `, {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    details: err
  });

  // Errores personalizados de nuestra API
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  }

  // Errores de Sequelize
  if (err instanceof ValidationError) {
    return res.status(400).json({
      success: false,
      message: 'Error de validación',
      errors: err.errors.map(e => ({ field: e.path, message: e.message }))
    });
  }

  if (err instanceof UniqueConstraintError) {
    return res.status(409).json({
      success: false,
      message: 'Ya existe un registro con esos datos',
      errors: err.errors.map(e => ({ field: e.path, message: e.message }))
    });
  }

  if (err instanceof ForeignKeyConstraintError) {
    return res.status(400).json({
      success: false,
      message: 'El registro al que intenta hacer referencia no existe',
      field: err.fields
    });
  }

  // Error de Multer para tamaño de archivo
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'El archivo es demasiado grande'
    });
  }

  // Error de JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Token inválido, por favor inicie sesión nuevamente'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Su sesión ha expirado, por favor inicie sesión nuevamente',
      expired: true
    });
  }

  // Error de tipo de archivo Multer
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      success: false,
      message: 'Tipo de archivo no soportado'
    });
  }

  // Error genérico para cualquier otro caso
  const statusCode = error.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: error.message || 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// Middleware para capturar rutas no existentes
export const notFound = (req, res, next) => {
  const error = new ApiError(404, `Ruta no encontrada - ${req.originalUrl}`);
  next(error);
};

// Helper para manejo de controladores asíncronos
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import db from '../database/db.js';
import { setupAssociations } from '../models/modelAssociations.js';
import UserModel from '../models/UserModel.js';
import bcrypt from 'bcryptjs';

process.env.DB_NAME = 'kavito_test';
process.env.DB_USER = 'root';
process.env.DB_PASSWORD = '';
process.env.DB_HOST = 'localhost';
process.env.JWT_SECRET = 'test_secret_key_123456789_abcdef_kavito_test';

// Cargar variables de entorno de prueba
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

dotenv.config({ 
  path: path.resolve(rootDir, '.env.test')
});

// Configurar asociaciones
setupAssociations();

// Función para inicializar la base de datos de pruebas
async function initTestDB() {
  try {
    console.log('Inicializando base de datos de pruebas:', process.env.DB_NAME);
    
    // Verificar conexión
    await db.authenticate();
    console.log('Conexión establecida correctamente.');
    
    // Sincronizar modelos con la base de datos
    await db.sync({ force: true });
    console.log('Tablas creadas exitosamente.');
    
    // Crear usuario administrador para pruebas
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await UserModel.create({
      username: 'Administrador',
      email: 'admin@test.com',
      password: hashedPassword,
      role: 'administrador'
    });
    console.log('Usuario administrador creado.');
    
    console.log('Base de datos de pruebas inicializada correctamente');
    process.exit(0);
  } catch (error) {
    console.error('Error al inicializar la base de datos de pruebas:', error);
    process.exit(1);
  }
}

initTestDB();
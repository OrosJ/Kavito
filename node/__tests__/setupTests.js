import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Determinar la ruta del directorio
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Cargar variables de entorno de prueba
dotenv.config({ 
  path: path.resolve(rootDir, '.env.test')
});

console.log('Configuración de pruebas cargada. Usando base de datos:', process.env.DB_NAME);
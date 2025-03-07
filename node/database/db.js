import dotenv from "dotenv";
import { Sequelize } from "sequelize";
import { fileURLToPath } from "url";
import path from "path";

// Obtener ruta del directorio actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// cargar variables de entorno
dotenv.config();

// Configuración de la base de datos desde variables de entorno
const dbName = process.env.DB_NAME?.trim();
const dbUser = process.env.DB_USER?.trim();
const dbPassword = process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : '';
const dbHost = process.env.DB_HOST?.trim();
const dbPort = process.env.DB_PORT?.trim() || "3306";

// no verificar si dbPassword está vacío, solo si las otras variables existen
if (!dbName || !dbUser || !dbHost) {
  console.error('Error: Variables de entorno para la base de datos no configuradas correctamente.');
  console.error('Por favor, configure las variables DB_NAME, DB_USER y DB_HOST en el archivo .env');
  console.error('DB_PASSWORD puede estar vacío si tu base de datos no requiere contraseña.');
  
  // En producción, salir para evitar conexiones inseguras
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
}

console.log(`Conectando a: ${dbHost}/${dbName} como usuario: ${dbUser}`);
if (dbPassword === '') {
  console.log('Nota: Usando conexión sin contraseña');
}

// Crear instancia de Sequelize con opciones
const db = new Sequelize(dbName, dbUser, dbPassword, {
  host: dbHost,
  port: dbPort,
  dialect: "mysql",
  logging: process.env.NODE_ENV === "development" ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  define: {
    timestamps: true, // Habilitar timestamps automáticos (createdAt, updatedAt)
    underscored: false, // No usar snake_case para nombres de columnas
    freezeTableName: false, // No forzar nombres de tablas a ser iguales a los modelos
    charset: "utf8",
    dialectOptions: {
      collate: "utf8_general_ci",
    },
  },
});

// probar la conexión a la base de datos
export const testConnection = async () => {
  try {
    await db.authenticate();
    console.log("Conexión a la base de datos establecida correctamente.");
    return true;
  } catch (error) {
    console.error("Error al conectar con la base de datos:", error.message);
    return false;
  }
};

export default db;

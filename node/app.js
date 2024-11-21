import express from "express";
import path from "path";
import cors from "cors";
import db from "./database/db.js";
import productRoutes from "./routes/routes.js";
import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import clientRoutes from "./routes/clientRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";

const app = express();

// Configuración general
const corsOptions = {
  origin: 'http://localhost:3000',  // Permitir solo solicitudes de este origen
  methods: ['GET', 'POST', 'PUT', 'DELETE'],  // Métodos HTTP permitidos
  allowedHeaders: ['Content-Type', 'Authorization'],  // Encabezados permitidos
};

// Usar la configuración de CORS
app.use(cors(corsOptions));

app.use(express.json());
// Determinar el directorio base
const __dirname = path.resolve();

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ruta para servir archivos estáticos
//console.log('Ruta estática configurada:', path.join(__dirname, 'uploads'));

// Rutas principales
app.use("/products", productRoutes);
app.use("/users", userRoutes);
app.use("/auth", authRoutes);
app.use("/clients", clientRoutes);
app.use("/categories", categoryRoutes);

app.use((req, res, next) => {
  res.setHeader(
      "Content-Security-Policy",
      "default-src 'self'; " +
      "img-src 'self' http://localhost:8000/uploads data:; " +
      "script-src 'self' 'unsafe-inline'; " +
      "style-src 'self' 'unsafe-inline';"
  );
  next();
});

// Prueba de conexión con la base de datos
try {
  await db.authenticate();
  console.log("Conexión exitosa a la Base de Datos");
} catch (error) {
  console.log(`Error de conexión: ${error}`);
}

// Iniciar el servidor
app.listen(8000, () => {
  console.log("Server running at http://localhost:8000/");
});

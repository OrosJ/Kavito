import express from 'express'
import cors from 'cors'
import db from './database/db.js'
import productRoutes from './routes/routes.js'
import userRoutes from './routes/userRoutes.js'
import authRoutes from './routes/authRoutes.js';
import clientRoutes from './routes/clientRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
const app = express()

app.use(cors ())
app.use(express.json())
app.use('/products', productRoutes)
app.use('/users', userRoutes);
app.use('/auth', authRoutes); 
app.use('/clients', clientRoutes); 
app.use('/categories', categoryRoutes); 

try {
    await db.authenticate()
    console.log('Conexion exitosa a la Base de Datos')
} catch (error) {
    console.log(`Error de conexion: ${error}`)
}


app.listen (8000, ()=>{
    console.log('Server up running in http://localhost:8000/')
})
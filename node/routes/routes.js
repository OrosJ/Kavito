import express from 'express'
import { createProduct, deleteProduct, getAllProducts, getProduct, updateProduct, uploadImage } from '../controllers/ProductController.js'
const router = express.Router()

router.get('/', getAllProducts)
router.get('/:id', getProduct)
// Ruta para crear un producto (con imagen)
router.post('/', uploadImage, createProduct);
// Ruta para actualizar un producto (con imagen)
router.put('/:id', uploadImage, updateProduct);
router.delete('/:id', deleteProduct)


export default router
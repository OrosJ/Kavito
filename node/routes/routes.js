import express from 'express'
import { createProduct, deleteProduct, getAllProducts, getProduct, updateProduct, uploadImage, getLowStockProducts } from '../controllers/ProductController.js'
import { authenticateToken } from '../middlewares/authenticateToken.js'

const router = express.Router()

router.get('/', getAllProducts)
router.get('/:id', getProduct)
// Ruta para crear un producto (con imagen)
router.post('/', authenticateToken, uploadImage, createProduct);
// Ruta para actualizar un producto (con imagen)
router.put('/:id',authenticateToken, uploadImage, updateProduct);
router.delete('/:id', authenticateToken, deleteProduct)
router.get('/low-stock', getLowStockProducts);

export default router
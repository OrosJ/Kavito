import express from 'express'
import { createCategory, updateCategory, getAllCategories, getCategory, deleteCategory } from '../controllers/CategoryController.js';

const router = express.Router()

router.get('/', getAllCategories)
router.get('/:id', getCategory)
router.post('/register', createCategory)
router.put('/:id', updateCategory)
router.delete('/:id', deleteCategory)

export default router
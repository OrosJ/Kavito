import express from 'express'
import { authenticateToken, authorizeRoles } from '../middlewares/authMiddleware.js';
import { createUser, loginUser, updateUser, getUsers, getUser, deleteUser, verifyToken } from '../controllers/UserController.js';

const router = express.Router()

router.post('/register', authenticateToken, authorizeRoles('administrador'), createUser);
router.put('/:id', authenticateToken, authorizeRoles('administrador'), updateUser)
router.post('/login', loginUser);
router.get('/', authenticateToken, authorizeRoles('administrador'), getUsers);
router.get('/:id', authenticateToken, authorizeRoles('administrador'), getUser);
router.delete('/:id', authenticateToken, authorizeRoles('administrador'), deleteUser);

export default router
import express from 'express'
import { authenticateToken } from '../middlewares/authenticateToken.js';
import { createUser, loginUser, updateUser, getUsers, getUser, deleteUser, verifyToken } from '../controllers/UserController.js';

const router = express.Router()

router.post('/register', createUser);
router.put('/:id', updateUser)
router.post('/login', loginUser);
router.get('/', authenticateToken, getUsers);
router.get('/:id', getUser);
router.delete('/:id', deleteUser);

export default router
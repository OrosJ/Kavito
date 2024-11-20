import express from 'express'
import { createUser, loginUser, updateUser, getUsers, getUser, deleteUser } from '../controllers/UserController.js';

const router = express.Router()

router.post('/register', createUser);
router.put('/:id', updateUser)
router.post('/login', loginUser);
router.get('/', getUsers);
router.get('/:id', getUser);
router.delete('/:id', deleteUser);

export default router
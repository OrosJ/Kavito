import express from 'express';
import { authenticateToken } from '../middlewares/authenticateToken.js';
import { 
    getInventoryHistory, 
    registerInventoryEntry,
    getInventoryStats
} from '../controllers/InventoryHistoryController.js';

const router = express.Router();

// Protección con autenticación
router.use(authenticateToken);

// Rutas para historial de inventario
router.get('/', getInventoryHistory);
router.post('/entrada', registerInventoryEntry);
router.get('/stats', getInventoryStats);

export default router;
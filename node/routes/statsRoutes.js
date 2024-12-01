import express from 'express';
import { authenticateToken } from '../middlewares/authenticateToken.js';
import { 
    getStats, 
    getInventoryMovements,
    getUpcomingDeliveries 
} from '../controllers/StatsController.js';

const router = express.Router();

// Ruta para obtener estadísticas del dashboard
router.get('/dashboard', authenticateToken, getStats);

// Ruta para obtener los movimientos de inventario
router.get('/inventory-movements', authenticateToken, getInventoryMovements);

// Ruta para obtener las próximas entregas
router.get('/upcoming-deliveries', authenticateToken, getUpcomingDeliveries);

export default router;
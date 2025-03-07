import express from 'express';
import { authenticateToken } from '../middlewares/authenticateToken.js';
import {
    getProjectProduct,
    updateProjectProduct,
    deliverProducts,
    getHistory,
    reserveAdditional,
    reserveProjectProduct,
    deliverProjectProduct,
    releaseReservation
} from '../controllers/ProjectProductController.js';

const router = express.Router();

// Proteger todas las rutas con autenticación
router.use(authenticateToken);

// Rutas para ProjectProduct
router.get('/:id', getProjectProduct);
router.put('/:id', updateProjectProduct);
router.post('/:id/deliver', deliverProducts);
router.get('/:id/history', getHistory);
router.post('/:id/reserve', reserveProjectProduct);
router.post('/:id/reserve', reserveAdditional);
router.post('/:id/deliver', deliverProjectProduct);
router.put('/:id/release', releaseReservation);



export default router;
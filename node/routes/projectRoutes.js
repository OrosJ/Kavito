import express from 'express';
import { authenticateToken } from '../middlewares/authenticateToken.js';
import { 
    createProject, 
    getProjects, 
    getProject, 
    updateProject, 
    deleteProject,
    assignProductToProject,
    getProjectsWithDeadlines,
    updateProjectStatus,
} from '../controllers/ProjectController.js';

const router = express.Router();

// Rutas básicas CRUD
router.get('/', authenticateToken, getProjects);
router.get('/:id', authenticateToken, getProject);
router.post('/', authenticateToken, createProject);
router.put('/:id', authenticateToken, updateProject);
router.delete('/:id', authenticateToken, deleteProject);
router.put('/:id/status', authenticateToken, updateProjectStatus);



// Rutas adicionales específicas de proyectos
router.get('/deadlines/upcoming', authenticateToken, getProjectsWithDeadlines);
router.post('/:id/assign-product', authenticateToken, assignProductToProject);

export default router;
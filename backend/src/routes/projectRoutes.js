import { Router } from 'express';
import projectController from '../controllers/projectController.js';

const router = Router();

router.post('/', projectController.createProject);
router.get('/', projectController.getAllProjects);
router.get('/:id', projectController.getProjectById);
router.post('/:id/funcs', projectController.addFeatureToProject);
router.post('/:id/prompt', projectController.generateScopeText);

export default router;
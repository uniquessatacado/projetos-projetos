import { Router } from 'express';
import featureController from '../controllers/featureController.js';

const router = Router();

router.delete('/:id', featureController.deleteFeature);

export default router;
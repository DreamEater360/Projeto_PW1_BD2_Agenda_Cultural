import { Router } from 'express';
import * as categoriaController from '../controllers/categoriaController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();


router.get('/', categoriaController.index);
router.post('/', authMiddleware, categoriaController.store);

export default router;
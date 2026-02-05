import { Router } from 'express';
import * as inscricaoController from '../controllers/inscricaoController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// POST /api/subscriptions -> Criar
router.post('/', authMiddleware, inscricaoController.store);

// GET /api/subscriptions/me -> Ver minhas inscrições
router.get('/me', authMiddleware, inscricaoController.index);

export default router;
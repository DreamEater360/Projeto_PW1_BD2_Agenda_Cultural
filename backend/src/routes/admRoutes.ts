import { Router } from 'express';
import * as admController from '../controllers/admController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { roleMiddleware } from '../middlewares/roleMiddleware';

const router = Router();

// Proteção global para todas as rotas de admin
router.use(authMiddleware);
router.use(roleMiddleware(['ADMINISTRADOR', 'GESTOR_PUBLICO']));

// Rotas de Moderação
router.get('/sugestoes', admController.getSuggestions);
router.patch('/sugestoes/:id/status', admController.updateSuggestion);

// Rotas de Relatório IA
router.post('/relatorios/gerar', admController.createReport);

export default router;
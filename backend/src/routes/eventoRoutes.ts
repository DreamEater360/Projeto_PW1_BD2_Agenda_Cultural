import { Router } from 'express';
import * as eventoController from '../controllers/eventoController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { upload } from '../config/multer';

const router = Router();

// 1. ROTAS FIXAS (Sempre primeiro)
router.get('/', eventoController.index);
router.get('/mine', authMiddleware, eventoController.indexByOrganizer); // <--- DEVE ESTAR AQUI

// 2. ROTAS DINÂMICAS (Sempre por último)
router.get('/:id', eventoController.show);

// 3. OUTRAS
router.post('/', authMiddleware, upload.single('foto'), eventoController.store);
router.patch('/:id/toggle', authMiddleware, eventoController.toggleStatus);
router.patch('/:id', authMiddleware, upload.single('foto'), eventoController.update);
router.delete('/:id', authMiddleware, eventoController.destroy);

export default router;
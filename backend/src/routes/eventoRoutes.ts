import { Router } from 'express';
import * as eventoController from '../controllers/eventoController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { upload } from '../config/multer';

const router = Router();

router.get('/', eventoController.index);
router.get('/mine', authMiddleware, eventoController.indexByOrganizer);

router.get('/:id', eventoController.show);

router.post('/', authMiddleware, upload.single('foto'), eventoController.store);
router.patch('/:id/toggle', authMiddleware, eventoController.toggleStatus);
router.patch('/:id', authMiddleware, upload.single('foto'), eventoController.update);
router.delete('/:id', authMiddleware, eventoController.destroy);

export default router;
import { Router } from 'express';
import * as authController from '../controllers/authController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);

// Rota protegida para alterar senha
router.patch('/update-password', authMiddleware, authController.updatePassword);

export default router;
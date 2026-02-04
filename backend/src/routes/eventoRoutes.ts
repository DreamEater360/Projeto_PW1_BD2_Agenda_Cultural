import { Router } from 'express';
import * as eventoController from '../controllers/eventoController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { upload } from '../config/multer';

const router = Router();

/**
 * ROTAS PÚBLICAS
 * Acessíveis por visitantes anônimos e cidadãos.
 */
router.get('/', eventoController.index);      // Listar na Galeria
router.get('/:id', eventoController.show);    // Ver no Modal

/**
 * ROTAS PROTEGIDAS
 * Exigem cabeçalho Authorization: Bearer TOKEN
 */

// Criar Evento (Apenas Organizadores/Admins conforme regra no Service)
router.post(
  '/', 
  authMiddleware, 
  upload.single('foto'), // Processa o upload da chave 'foto'
  eventoController.store
);

// Alternar entre Visível/Oculto (Toggle)
router.patch(
  '/:id/toggle', 
  authMiddleware, 
  eventoController.toggleStatus
);

export default router;
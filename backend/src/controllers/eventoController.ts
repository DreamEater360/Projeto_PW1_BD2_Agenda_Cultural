import { Request, Response } from 'express';
import * as eventoService from '../services/eventoService';
import { BadRequestError } from '../errors/apiError';

/**
 * Cria um novo evento.
 * Recebe multipart/form-data (campos + arquivo).
 */
export const store = async (req: Request, res: Response) => {
  // Pegamos os dados do usuário injetados pelo authMiddleware
  const usuario = {
    id: req.user!.id,
    papel: req.user!.papel
  };

  // Se o Multer salvou um arquivo, montamos a URL pública dele
  const foto_url = req.file 
    ? `http://localhost:3333/uploads/${req.file.filename}` 
    : undefined;

  // O Service cuida da validação Zod e da persistência poliglota
  const evento = await eventoService.create(req.body, usuario, foto_url);

  return res.status(201).json(evento);
};

/**
 * Lista apenas os eventos APROVADOS (Para a Galeria Pública).
 */
export const index = async (req: Request, res: Response) => {
  const eventos = await eventoService.listAllPublic();
  return res.json(eventos);
};

/**
 * Busca detalhes de um único evento pelo ID.
 */
export const show = async (req: Request, res: Response) => {
  const { id } = req.params;
  const suggestionId = Array.isArray(id) ? id[0] : id;
  
  if (!suggestionId) {
    throw new BadRequestError('ID da sugestão é obrigatório.');
  }
  const evento = await eventoService.getById(suggestionId);
  return res.json(evento);
};

/**
 * Alterna a visibilidade (Ativar/Ocultar).
 * Apenas o dono ou Admin pode realizar.
 */
export const toggleStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.id;
  const userRole = req.user!.papel;
  const suggestionId = Array.isArray(id) ? id[0] : id;
  
  if (!suggestionId) {
    throw new BadRequestError('ID da sugestão é obrigatório.');
  }

  const evento = await eventoService.toggleVisibility(suggestionId, userId, userRole);

  return res.json(evento);
};
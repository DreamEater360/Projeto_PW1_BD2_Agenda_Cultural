import { Request, Response } from 'express';
import * as inscricaoService from '../services/inscricaoService';
import { BadRequestError } from '../errors/apiError';

export const store = async (req: Request, res: Response) => {
  const { eventoId } = req.body;
  const userId = req.user?.id; // Pegamos do token via authMiddleware

  if (!userId) throw new BadRequestError('Usuário não autenticado.');
  if (!eventoId) throw new BadRequestError('ID do evento é obrigatório.');

  const resultado = await inscricaoService.criarInscricao(String(userId), String(eventoId));
  
  return res.status(201).json(resultado);
};

export const index = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  
  if (!userId) throw new BadRequestError('Usuário não identificado.');

  const eventos = await inscricaoService.listarMinhasInscricoes(String(userId));
  return res.json(eventos);
};
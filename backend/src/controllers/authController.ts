import { Request, Response } from 'express';
import * as authService from '../services/authService';
import { BadRequestError } from '../errors/apiError';

export const register = async (req: Request, res: Response) => {
  const usuario = await authService.register(req.body);
  return res.status(201).json(usuario);
};

export const login = async (req: Request, res: Response) => {
  const result = await authService.login(req.body);
  return res.json(result);
};

export const updatePassword = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { senhaAtual, novaSenha } = req.body;

  if (!userId) throw new BadRequestError('Usuário não identificado.');
  if (!senhaAtual || !novaSenha) throw new BadRequestError('Campos de senha são obrigatórios.');

  const result = await authService.updatePassword(String(userId), senhaAtual, novaSenha);
  return res.json(result);
};
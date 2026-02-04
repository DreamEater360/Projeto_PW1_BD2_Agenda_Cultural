import { Request, Response } from 'express';
import * as authService from '../services/authService';

export const register = async (req: Request, res: Response) => {
  const usuario = await authService.register(req.body);
  return res.status(201).json(usuario);
};

export const login = async (req: Request, res: Response) => {
  const result = await authService.login(req.body);
  return res.json(result);
};
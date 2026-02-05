import { Request, Response } from 'express';
import * as categoriaService from '../services/categoriaService'

export const store = async (req: any, res: any) => {
  const categoria = await categoriaService.create(req.body);
  return res.status(201).json(categoria);
};

export const index = async (req: any, res: any) => {
  const categorias = await categoriaService.listAll();
  return res.json(categorias);
};

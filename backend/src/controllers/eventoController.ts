import { Request, Response } from 'express';
import * as eventoService from '../services/eventoService';
import { BadRequestError } from '../errors/apiError';

export const indexByOrganizer = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id; 
    const eventos = await eventoService.listByOrganizer(userId);
    return res.json(eventos);
  } catch (error) {
    return res.status(500).json({ message: "Erro ao buscar seus eventos" });
  }
};

export const store = async (req: Request, res: Response) => {
  const usuario = { id: req.user!.id, papel: req.user!.papel };
  let foto_url = req.body.foto_url_externa || undefined;
  if (req.file) foto_url = `http://localhost:3333/uploads/${req.file.filename}`;
  const evento = await eventoService.create(req.body, usuario, foto_url);
  return res.status(201).json(evento);
};

export const index = async (req: Request, res: Response) => {
  const eventos = await eventoService.listAllPublic();
  return res.json(eventos);
};

export const toggleStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const eventId = Array.isArray(id) ? id[0] : id;
  const evento = await eventoService.toggleVisibility(eventId!, req.user!.id, req.user!.papel);
  return res.json(evento);
};

export const show = async (req: Request, res: Response) => {
  const { id } = req.params;
  const eventId = Array.isArray(id) ? id[0] : id;
  const evento = await eventoService.getById(eventId!);
  return res.json(evento);
};

export const update = async (req: Request, res: Response) => {
  const { id } = req.params;
  const eventId = Array.isArray(id) ? id[0] : id;
  const userId = req.user!.id;
  const evento = await eventoService.update(eventId, userId, req.body);
  return res.json(evento);
};

export const destroy = async (req: Request, res: Response) => {
  const { id } = req.params;
  const eventId = Array.isArray(id) ? id[0] : id;
  const userId = req.user!.id;
  const resultado = await eventoService.remove(eventId, userId);
  return res.json(resultado);
};
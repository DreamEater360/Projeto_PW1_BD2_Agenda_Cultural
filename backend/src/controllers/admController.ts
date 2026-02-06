import { Request, Response } from 'express';
import * as admService from '../services/admService';
import { BadRequestError } from '../errors/apiError';

export const getSuggestions = async (req: Request, res: Response) => {
  const data = await admService.listAllSuggestions();
  return res.json(data);
};

export const updateSuggestion = async (req: Request, res: Response) => {
  const { id } = req.params;
  const suggestionId = Array.isArray(id) ? id[0] : id;

  if (!suggestionId) {
    throw new BadRequestError('ID da sugestão é obrigatório.');
  }
  const data = await admService.updateSuggestionStatus(suggestionId, req.body);
  
  return res.json(data);
};

export const createReport = async (req: Request, res: Response) => {
  const autorId = req.user?.id;
  const { tipo } = req.body;

  if (!autorId) {
    throw new BadRequestError('Usuário não identificado.');
  }

  if (!tipo) {
    throw new BadRequestError('O tipo do relatório é obrigatório.');
  }

  const relatorio = await admService.generateAIReport(tipo, String(autorId));
  
  return res.status(201).json(relatorio);
};
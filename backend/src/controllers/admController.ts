import { Request, Response } from 'express';
import * as admService from '../services/admService';
import { BadRequestError } from '../errors/apiError';

export const getSuggestions = async (req: Request, res: Response) => {
  const data = await admService.listAllSuggestions();
  return res.json(data);
};

export const updateSuggestion = async (req: Request, res: Response) => {
  // 1. Pegamos o ID dos params
  const { id } = req.params;

  // 2. Garantimos que o ID é uma string única (resolve o erro TS2345)
  // Se for um array, pegamos a primeira posição. Se não existir, erro.
  const suggestionId = Array.isArray(id) ? id[0] : id;

  if (!suggestionId) {
    throw new BadRequestError('ID da sugestão é obrigatório.');
  }

  // 3. Passamos para o service agora com a tipagem correta
  const data = await admService.updateSuggestionStatus(suggestionId, req.body);
  
  return res.json(data);
};

export const createReport = async (req: Request, res: Response) => {
  // Pegamos o ID do usuário (vindo do Token decodificado)
  const autorId = req.user?.id;
  const { tipo } = req.body;

  if (!autorId) {
    throw new BadRequestError('Usuário não identificado.');
  }

  if (!tipo) {
    throw new BadRequestError('O tipo do relatório é obrigatório.');
  }

  // String(autorId) garante que o ID (mesmo que venha como objeto do Mongo) vire string para o Service
  const relatorio = await admService.generateAIReport(tipo, String(autorId));
  
  return res.status(201).json(relatorio);
};
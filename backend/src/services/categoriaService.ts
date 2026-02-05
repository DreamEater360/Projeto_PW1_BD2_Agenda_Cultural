import { z } from 'zod';
import { CategoriaModel } from '../models/Categoria';
import { BadRequestError } from '../errors/apiError';

// Validação simples
const categoriaSchema = z.object({
  nome: z.string().min(2, "Nome da categoria muito curto"),
  icone_url: z.string().optional()
});

export const create = async (data: any) => {
  const validatedData = categoriaSchema.parse(data);

  // Verifica se o nome já existe
  const exists = await CategoriaModel.findOne({ nome: validatedData.nome });
  if (exists) throw new BadRequestError('Esta categoria já existe.');

  return await CategoriaModel.create(validatedData);
};

export const listAll = async () => {
  return await CategoriaModel.find().sort({ nome: 1 });
};


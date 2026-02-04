import { z } from 'zod';
import mongoose from 'mongoose';
import { EventoModel } from '../models/Evento';
import { neo4jDriver } from '../config/neo4j';
import { BadRequestError, NotFoundError, ForbiddenError, ApiError } from '../errors/apiError';

const createEventoSchema = z.object({
  titulo: z.string().min(3).max(100),
  descricao: z.string().min(10).max(2000),
  data_inicio: z.string().transform((val) => new Date(val)),
  data_fim: z.string().optional().transform((val) => val ? new Date(val) : undefined),
  valor_ingresso: z.string().default('0').transform((val) => parseFloat(val)),
  categoria_id: z.string().min(1),
  nome_local: z.string().min(2),
  longitude: z.string().transform((val) => parseFloat(val)),
  latitude: z.string().transform((val) => parseFloat(val)),
});

export const create = async (data: unknown, usuario: { id: string, papel: string }, foto_url?: string) => {
  const validatedData = createEventoSchema.parse(data);

  // REGRA DE NEGÓCIO: Só Organizador e Admin publicam direto. Cidadão cria como PENDENTE.
  const statusInicial = (usuario.papel === 'ORGANIZADOR' || usuario.papel === 'ADMINISTRADOR') 
    ? 'APROVADO' 
    : 'PENDENTE';

  const evento = await EventoModel.create({
    titulo: validatedData.titulo,
    descricao: validatedData.descricao,
    data_inicio: validatedData.data_inicio,
    data_fim: validatedData.data_fim,
    valor_ingresso: validatedData.valor_ingresso,
    categoria_id: validatedData.categoria_id,
    organizador_id: usuario.id,
    foto_url: foto_url || '',
    status: statusInicial,
    localizacao: {
      type: 'Point',
      coordinates: [validatedData.longitude, validatedData.latitude],
      nome_local: validatedData.nome_local
    }
  });

  const session = neo4jDriver.session();
  try {
    await session.run(
      `MATCH (u:Usuario {mongoId: $uId})
       CREATE (e:Evento {mongoId: $eId, titulo: $titulo, data: $data})
       CREATE (u)-[:ANUNCIOU {em: datetime()}]->(e)`,
      {
        uId: usuario.id,
        eId: evento._id.toString(),
        titulo: evento.titulo,
        data: evento.data_inicio.toISOString()
      }
    );
  } catch (error) {
    await EventoModel.findByIdAndDelete(evento._id);
    throw new ApiError('Erro de sincronização poliglota.', 500);
  } finally {
    await session.close();
  }

  return evento;
};

export const listAllPublic = async () => {
  return await EventoModel.find({ status: 'APROVADO' })
    .populate('categoria_id')
    .populate('organizador_id', 'nome')
    .sort({ data_inicio: 1 });
};

export const listByOrganizer = async (userId: string) => {
  return await EventoModel.find({ organizador_id: new mongoose.Types.ObjectId(userId) })
    .populate('categoria_id')
    .sort({ createdAt: -1 });
};

export const getById = async (id: string) => {
  const evento = await EventoModel.findById(id).populate('categoria_id').populate('organizador_id', 'nome email');
  if (!evento) throw new NotFoundError('Evento não encontrado.');
  return evento;
};

export const toggleVisibility = async (eventoId: string, userId: string, userRole: string) => {
  const evento = await EventoModel.findById(eventoId);
  if (!evento) throw new NotFoundError('Evento não encontrado.');
  if (evento.organizador_id.toString() !== userId && userRole !== 'ADMINISTRADOR') throw new ForbiddenError('Sem permissão.');
  evento.status = evento.status === 'APROVADO' ? 'CANCELADO' : 'APROVADO';
  await evento.save();
  return evento;
};
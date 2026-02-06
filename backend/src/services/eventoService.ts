import { z } from 'zod';
import mongoose from 'mongoose';
import { EventoModel } from '../models/Evento';
import { neo4jDriver } from '../config/neo4j';
import { BadRequestError, NotFoundError, ForbiddenError, ApiError } from '../errors/apiError';

const eventoSchema = z.object({
  titulo: z.string()
    .min(3, "O título deve ter pelo menos 3 caracteres")
    .max(100, "Título muito longo"),
  descricao: z.string()
    .min(10, "A descrição deve ter pelo menos 10 caracteres")
    .max(2000, "Descrição muito longa"),
  data_inicio: z.string().transform((val) => new Date(val)),
  data_fim: z.string().optional().transform((val) => val ? new Date(val) : undefined),
  valor_ingresso: z.any().transform((val) => {
    const parsed = typeof val === 'string' ? parseFloat(val) : val;
    return isNaN(parsed) ? 0 : parsed;
  }),
  categoria_id: z.string().min(1, "Selecione uma categoria"),
  nome_local: z.string().min(2, "Informe o nome do local").optional(),
  longitude: z.any().transform((val) => parseFloat(val)).optional(),
  latitude: z.any().transform((val) => parseFloat(val)).optional(),
});

export const create = async (data: unknown, usuario: { id: string, papel: string }, foto_url?: string) => {
  const validatedData = eventoSchema.parse(data);

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
      coordinates: [validatedData.longitude || null , validatedData.latitude as any],
      nome_local: validatedData.nome_local
    }
  });

  const session = neo4jDriver.session();
  try {
    await session.run(
      `MATCH (u:Usuario {mongoId: $uId}) 
       CREATE (e:Evento {mongoId: $eId, titulo: $titulo, data: $data}) 
       CREATE (u)-[:ANUNCIOU]->(e)`,
      {
        uId: usuario.id,
        eId: evento._id.toString(),
        titulo: evento.titulo,
        data: evento.data_inicio.toISOString()
      }
    );
  } catch (error) {
    console.error("Erro Neo4j:", error);
  } finally {
    await session.close();
  }

  return evento;
};

export const update = async (eventoId: string, userId: string, data: any) => {
  const partialSchema = eventoSchema.partial();
  const validatedData = partialSchema.parse(data);

  const evento = await EventoModel.findById(eventoId);
  if (!evento) throw new NotFoundError('Evento não encontrado.');
  if (evento.organizador_id.toString() !== userId) throw new ForbiddenError('Sem permissão.');

  Object.assign(evento, validatedData);

  if (data.latitude && data.longitude) {
    evento.localizacao = {
      type: 'Point',
      coordinates: [parseFloat(data.longitude), parseFloat(data.latitude)],
      nome_local: data.nome_local || (evento.localizacao as any).nome_local
    };
  }

  await evento.save();
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

export const remove = async (eventoId: string, userId: string) => {
  const evento = await EventoModel.findById(eventoId);
  
  if (!evento) throw new NotFoundError('Evento não encontrado.');
  
  if (evento.organizador_id.toString() !== userId) {
    throw new ForbiddenError('Você não tem permissão para excluir este evento.');
  }

  await EventoModel.findByIdAndDelete(eventoId);

  const session = neo4jDriver.session();
  try {
    await session.run(
      'MATCH (e:Evento {mongoId: $id}) DETACH DELETE e',
      { id: eventoId }
    );
  } catch (error) {
    console.error("⚠️ [NEO4J]: Erro ao remover nó do evento:", error);
  } finally {
    await session.close();
  }

  return { message: "Evento removido com sucesso." };
};
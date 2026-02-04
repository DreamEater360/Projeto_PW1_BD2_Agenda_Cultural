import { EventoModel } from '../models/Evento';
import { neo4jDriver } from '../config/neo4j';
import { NotFoundError, ForbiddenError, BadRequestError } from '../errors/apiError';
import mongoose from 'mongoose';

export const listAllPublic = async () => {
  return await EventoModel.find({ status: 'APROVADO' })
    .populate('categoria_id')
    .populate('organizador_id', 'nome')
    .sort({ data_inicio: 1 });
};

// LISTAR MEUS EVENTOS (BLINDADO)
export const listByOrganizer = async (userId: string) => {
  // Se o ID não for um formato válido de ObjectId, o Mongo quebra e dá erro 500.
  // Essa trava evita isso.
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new BadRequestError('ID de usuário inválido para busca.');
  }

  return await EventoModel.find({ 
    organizador_id: new mongoose.Types.ObjectId(userId) 
  })
  .populate('categoria_id')
  .sort({ createdAt: -1 });
};

export const create = async (data: any, usuario: { id: string, papel: string }, foto_url?: string) => {
  const statusInicial = (usuario.papel === 'ORGANIZADOR' || usuario.papel === 'ADMINISTRADOR') 
    ? 'APROVADO' 
    : 'PENDENTE';

  const evento = await EventoModel.create({
    titulo: data.titulo,
    descricao: data.descricao,
    data_inicio: new Date(data.data_inicio),
    data_fim: data.data_fim ? new Date(data.data_fim) : undefined,
    valor_ingresso: Number(data.valor_ingresso) || 0,
    categoria_id: data.categoria_id,
    organizador_id: usuario.id,
    foto_url: foto_url || '',
    status: statusInicial,
    localizacao: {
      type: 'Point',
      coordinates: [Number(data.longitude), Number(data.latitude)],
      nome_local: data.nome_local
    }
  });

  const session = neo4jDriver.session();
  try {
    await session.run(
      'MATCH (u:Usuario {mongoId: $uId}) CREATE (e:Evento {mongoId: $eId, titulo: $titulo}) CREATE (u)-[:ANUNCIOU]->(e)',
      { uId: usuario.id, eId: evento._id.toString(), titulo: evento.titulo }
    );
  } catch (err) {
    console.warn("Neo4j falhou, mas evento salvo no Mongo.");
  } finally { await session.close(); }

  return evento;
};

export const toggleVisibility = async (eventoId: string, userId: string, userRole: string) => {
  const evento = await EventoModel.findById(eventoId);
  if (!evento) throw new NotFoundError('Evento não encontrado.');

  if (evento.organizador_id.toString() !== userId && userRole !== 'ADMINISTRADOR') {
    throw new ForbiddenError('Sem permissão.');
  }

  evento.status = evento.status === 'APROVADO' ? 'CANCELADO' : 'APROVADO';
  await evento.save();
  return evento;
};

export const getById = async (id: string) => {
  return await EventoModel.findById(id).populate('categoria_id').populate('organizador_id', 'nome email');
};
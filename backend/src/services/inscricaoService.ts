import { InscricaoModel } from '../models/Inscricao';
import { EventoModel } from '../models/Evento';
import { neo4jDriver } from '../config/neo4j';
import { BadRequestError, NotFoundError } from '../errors/apiError';

export const criarInscricao = async (userId: string, eventoId: string) => {
  const evento = await EventoModel.findById(eventoId);
  if (!evento) throw new NotFoundError('Evento não encontrado.');

  try {
    await InscricaoModel.create({ usuario_id: userId, evento_id: eventoId });
  } catch (error: any) {
    if (error.code === 11000) throw new BadRequestError('Você já está inscrito neste evento.');
    throw error;
  }

  const session = neo4jDriver.session();
  try {
    await session.run(
      `MATCH (u:Usuario {mongoId: $uId}), (e:Evento {mongoId: $eId})
       MERGE (u)-[r:INTERESSADO]->(e)
       SET r.confirmado_em = datetime()`,
      { uId: userId, eId: eventoId }
    );
  } catch (error) {
    console.error('⚠️ [NEO4J]: Erro ao criar relação de interesse:', error);
  } finally {
    await session.close();
  }

  return { message: "Presença confirmada com sucesso!" };
};

export const listarMinhasInscricoes = async (userId: string) => {
  const inscricoes = await InscricaoModel.find({ usuario_id: userId })
    .populate({
      path: 'evento_id',
      populate: { path: 'categoria_id' } 
    })
    .sort({ createdAt: -1 });

  return inscricoes.map(i => i.evento_id).filter(e => e !== null);
};
import { z } from 'zod';
import { EventoModel } from '../models/Evento';
import { neo4jDriver } from '../config/neo4j';
import { BadRequestError, NotFoundError, ForbiddenError } from '../errors/apiError';

// --- SCHEMAS DE VALIDAÇÃO COM ZOD ---

const createEventoSchema = z.object({
  titulo: z.string().min(3, "Título muito curto").max(100),
  descricao: z.string().min(10, "Descrição muito curta").max(2000),
  data_inicio: z.string().transform((val) => new Date(val)),
  data_fim: z.string().optional().transform((val) => val ? new Date(val) : undefined),
  valor_ingresso: z.string().default('0').transform((val) => parseFloat(val)),
  categoria_id: z.string().min(1, "Categoria é obrigatória"),
  nome_local: z.string().min(2, "Nome do local é obrigatório"),
  longitude: z.string().transform((val) => parseFloat(val)),
  latitude: z.string().transform((val) => parseFloat(val)),
});

// --- LÓGICA DE NEGÓCIO ---

/**
 * Cria um evento no MongoDB (GeoJSON) e o relacionamento no Neo4j.
 * REGRA: Se criado por Organizador/Admin, status é 'APROVADO'. Caso contrário, 'PENDENTE'.
 */
export const create = async (data: unknown, usuario: { id: string, papel: string }, foto_url?: string) => {
  // 1. Validação dos dados de entrada
  const validatedData = createEventoSchema.parse(data);

  // 2. Definição do status inicial baseado no papel (Requisito de autonomia)
  const statusInicial = (usuario.papel === 'ORGANIZADOR' || usuario.papel === 'ADMINISTRADOR') 
    ? 'APROVADO' 
    : 'PENDENTE';

  // 3. Persistência no MongoDB (Dados transacionais e espaciais)
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
      coordinates: [validatedData.longitude, validatedData.latitude], // GeoJSON: [lng, lat]
      nome_local: validatedData.nome_local
    }
  });

  // 4. Persistência no Neo4j (Modelagem de Grafos)
  const session = neo4jDriver.session();
  try {
    await session.run(
      `
      MATCH (u:Usuario {mongoId: $uId})
      CREATE (e:Evento {
        mongoId: $eId, 
        titulo: $titulo, 
        data: $data
      })
      CREATE (u)-[:ANUNCIOU {em: datetime()}]->(e)
      `,
      {
        uId: usuario.id,
        eId: evento._id.toString(),
        titulo: evento.titulo,
        data: evento.data_inicio.toISOString()
      }
    );
  } catch (error: any) {
    console.error('⚠️ [NEO4J]: Falha ao criar relação, mas dados salvos no Mongo.', error.message);
  } finally {
    await session.close();
  }

  return evento;
};

/**
 * Alterna a visibilidade do evento (Toggle).
 * REGRA: Apenas o dono (organizador) ou um administrador pode realizar esta ação.
 */
export const toggleVisibility = async (eventoId: string, userId: string, userRole: string) => {
  const evento = await EventoModel.findById(eventoId);

  if (!evento) throw new NotFoundError('Evento não encontrado.');

  // Validação de Propriedade/Permissão
  const isOwner = evento.organizador_id.toString() === userId;
  const isAdmin = userRole === 'ADMINISTRADOR';

  if (!isOwner && !isAdmin) {
    throw new ForbiddenError('Você não tem permissão para alterar este evento.');
  }

  // Alterna entre APROVADO (visível) e CANCELADO (oculto)
  const novoStatus = evento.status === 'APROVADO' ? 'CANCELADO' : 'APROVADO';
  
  evento.status = novoStatus;
  await evento.save();

  return evento;
};

/**
 * Lista todos os eventos aprovados para a galeria pública.
 */
export const listAllPublic = async () => {
  return await EventoModel.find({ status: 'APROVADO' })
    .populate('categoria_id')
    .populate('organizador_id', 'nome')
    .sort({ data_inicio: 1 });
};

/**
 * Busca detalhes de um evento específico.
 */
export const getById = async (id: string) => {
  const evento = await EventoModel.findById(id)
    .populate('categoria_id')
    .populate('organizador_id', 'nome email');

  if (!evento) throw new NotFoundError('Evento não encontrado.');
  return evento;
};
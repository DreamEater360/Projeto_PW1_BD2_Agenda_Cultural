import { EventoModel } from '../models/Evento';
import { RelatorioModel } from '../models/Relatorio';
import { UsuarioModel } from '../models/Usuario';
import { CategoriaModel } from '../models/Categoria';
import { BadRequestError } from '../errors/apiError';

export const listAllSuggestions = async () => {
  return await EventoModel.find({ status: 'PENDENTE' })
    .populate('organizador_id', 'nome email')
    .populate('categoria_id', 'nome')
    .sort({ createdAt: -1 });
};

export const updateSuggestionStatus = async (id: string, data: any) => {
  const { status } = data;
  const evento = await EventoModel.findByIdAndUpdate(id, { status }, { new: true });
  if (!evento) throw new Error('Evento não encontrado');
  return evento;
};

// GERAR RELATÓRIO ESTATÍSTICO 
export const generateAIReport = async (tipo: string, autorId: string) => {
  try {
    const [
      totalEventos, 
      totalUsuarios, 
      aprovados, 
      pendentes, 
      rejeitados,
      categorias
    ] = await Promise.all([
      EventoModel.countDocuments(),
      UsuarioModel.countDocuments(),
      EventoModel.countDocuments({ status: 'APROVADO' }),
      EventoModel.countDocuments({ status: 'PENDENTE' }),
      EventoModel.countDocuments({ status: 'REJEITADO' }),
      CategoriaModel.find({}, 'nome')
    ]);

    const relatorio = await RelatorioModel.create({
      tipo: tipo || "Relatório Estatístico de Gestão",
      autor: autorId,
      dados: {
        estatisticas: { 
          totalUsuarios, 
          totalEventos, 
          aprovados, 
          pendentes, 
          rejeitados,
          totalCategorias: categorias.length 
        },
        listaCategorias: categorias.map(c => c.nome),
        gerado_em: new Date()
      }
    });

    return relatorio;

  } catch (error: any) {
    console.error("❌ [ERRO RELATORIO]:", error.message);
    throw new BadRequestError(`Falha ao gerar relatório: ${error.message}`);
  }
};
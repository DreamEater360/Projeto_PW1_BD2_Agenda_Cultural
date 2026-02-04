import { EventoModel } from '../models/Evento';
import { RelatorioModel } from '../models/Relatorio';
import { UsuarioModel } from '../models/Usuario';
import { CategoriaModel } from '../models/Categoria';
import { geminiModel } from '../config/gemini';
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

// --- GERAR RELATÓRIO COM IA ---
export const generateAIReport = async (tipo: string, autorId: string) => {
  try {
    const [totalEventos, totalUsuarios, aprovados, categorias] = await Promise.all([
      EventoModel.countDocuments(),
      UsuarioModel.countDocuments(),
      EventoModel.countDocuments({ status: 'APROVADO' }),
      CategoriaModel.find({}, 'nome')
    ]);

    if (totalEventos === 0) {
      throw new BadRequestError("Crie pelo menos um evento antes de gerar o relatório.");
    }

    const nomesCategorias = categorias.map(c => c.nome).join(', ') || 'Geral';

    const prompt = `
      Atue como um Especialista em Gestão Cultural.
      Analise os dados da cidade:
      - Usuários: ${totalUsuarios}
      - Eventos totais: ${totalEventos}
      - Eventos aprovados: ${aprovados}
      - Categorias: ${nomesCategorias}
      
      Escreva uma análise de impacto curta (máximo 5 linhas) e dê uma dica de melhoria.
      Responda de forma profissional em Português.
    `;

    console.log("🤖 [IA]: Solicitando análise ao Gemini...");
    
    const result = await geminiModel.generateContent(prompt);
    const text = result.response.text();

    if (!text) throw new Error("A IA retornou uma resposta vazia.");

    const relatorio = await RelatorioModel.create({
      tipo,
      autor: autorId,
      dados: {
        estatisticas: { totalUsuarios, totalEventos, aprovados },
        analise_ia: text
      }
    });

    return relatorio;

  } catch (error: any) {
    console.error("❌ [ERRO IA]:", error.message);
    
    // Se o erro de 404 persistir, vamos dar uma mensagem mais clara
    if (error.message.includes('404')) {
      throw new BadRequestError("Erro de Conexão com a IA: O modelo flash pode estar instável. Tente editar 'backend/src/config/gemini.ts' e trocar o modelo para 'gemini-pro'.");
    }

    throw new BadRequestError(`Falha ao gerar relatório: ${error.message}`);
  }
};
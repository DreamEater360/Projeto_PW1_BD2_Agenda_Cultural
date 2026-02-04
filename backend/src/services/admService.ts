import { SugestaoModel } from '../models/Sugestao';
import { RelatorioModel } from '../models/Relatorio';
import { EventoModel } from '../models/Evento';
import { UsuarioModel } from '../models/Usuario';
import { geminiModel } from '../config/gemini';
import { NotFoundError, BadRequestError } from '../errors/apiError';
import { z } from 'zod';

export const listAllSuggestions = async () => {
  return await SugestaoModel.find().populate('autor', 'nome email');
};

export const updateSuggestionStatus = async (id: string, data: any) => {
  const { status } = data;
  const sugestao = await SugestaoModel.findByIdAndUpdate(id, { status }, { new: true });
  if (!sugestao) throw new NotFoundError('Sugestão não encontrada');
  return sugestao;
};

// --- GERAR RELATÓRIO COM GEMINI ---
export const generateAIReport = async (tipo: string, autorId: string) => {
  try {
    console.log("➡️ [RELATÓRIO]: Iniciando coleta de dados...");

    // 1. Coleta dados reais do MongoDB
    const [totalEventos, totalUsuarios, aprovados] = await Promise.all([
      EventoModel.countDocuments(),
      UsuarioModel.countDocuments(),
      EventoModel.countDocuments({ status: 'APROVADO' })
    ]);

    console.log(`📊 [DADOS]: Usuarios: ${totalUsuarios}, Eventos: ${totalEventos}`);

    // 2. Prepara o Prompt
    const prompt = `
      Atue como analista cultural da prefeitura.
      Dados atuais:
      - Total de usuários: ${totalUsuarios}
      - Total de eventos cadastrados: ${totalEventos}
      - Eventos já aprovados: ${aprovados}
      
      Escreva uma análise de impacto cultural curta (máximo 5 linhas) e dê uma dica de como melhorar a cultura local.
      Responda em português de forma profissional.
    `;

    console.log("🤖 [GEMINI]: Enviando prompt para a IA...");

    // 3. Chama o Gemini
    const result = await geminiModel.generateContent(prompt);
    const responseIA = result.response;
    const textoAnalise = responseIA.text();

    console.log("✅ [GEMINI]: Resposta recebida com sucesso!");

    // 4. Salva no MongoDB
    const relatorio = await RelatorioModel.create({
      tipo,
      autor: autorId,
      dados: {
        estatisticas: { totalUsuarios, totalEventos, aprovados },
        analise_ia: textoAnalise
      }
    });

    return relatorio;

  } catch (error: any) {
    console.error("❌ [ERRO RELATÓRIO]:", error.message);
    // Se for erro na chave da API, o Gemini avisa aqui
    throw new BadRequestError(`Falha ao gerar relatório: ${error.message}`);
  }
};
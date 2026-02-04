import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';

dotenv.config();

// O .env.example usa GOOGLE_API_KEY, mas alguns tutoriais usam GEMINI_API_KEY
// Vamos garantir que ele pegue qualquer um dos dois que você preencheu
const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || '';

if (!apiKey) {
  console.error("❌ [GEMINI]: Nenhuma chave de API encontrada no arquivo .env!");
}

const genAI = new GoogleGenerativeAI(apiKey);

/**
 * Identificadores sugeridos se um falhar:
 * 1. "gemini-1.5-flash" (Padrão)
 * 2. "gemini-1.5-flash-latest" (Mais estável para SDKs novos)
 * 3. "gemini-pro" (Legado/Compatível)
 */
export const geminiModel = genAI.getGenerativeModel({ model: "gemini-pro" });
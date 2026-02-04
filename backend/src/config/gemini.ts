import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Use o modelo flash 1.5 que é mais estável e rápido
export const geminiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Importação das conexões e middlewares
import { connectMongo } from './config/mongo';
import { connectNeo4j } from './config/neo4j';
import { errorMiddleware } from './middlewares/errorMiddleware';

// Importação das rotas
import authRoutes from './routes/authRoutes';
import eventoRoutes from './routes/eventoRoutes'
import categoriaRoutes from './routes/categoriaRoutes'
import admRoutes from './routes/admRoutes';

dotenv.config();

const app = express();

// --- MIDDLEWARES ---
app.use(cors());
app.use(express.json());

// --- ROTAS ---
// Endpoint de Autenticação
app.use('/api/auth', authRoutes);
app.use('/api/events', eventoRoutes)
app.use('/api/categorias', categoriaRoutes)
app.use('/api/adm', admRoutes)

// --- TRATAMENTO DE ERROS ---
// Deve ser sempre o último a ser registrado
app.use(errorMiddleware);

// --- INICIALIZAÇÃO ---
const start = async () => {
  try {
    // Garante a conexão com os dois bancos antes de abrir a porta
    await connectMongo();
    await connectNeo4j();

    const PORT = process.env.PORT || 3333;
    
    app.listen(PORT, () => {
      console.log('--------------------------------------------');
      console.log(`🚀 SERVIDOR OFICIAL RODANDO NA PORTA ${PORT}`);
      console.log(`✅ MongoDB Atlas: Online`);
      console.log(`✅ Neo4j AuraDB: Online`);
      console.log('--------------------------------------------');
    });
  } catch (error) {
    console.error('❌ Falha crítica no início do servidor:', error);
    process.exit(1);
  }
};

start();

export default app;
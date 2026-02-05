import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Importação das conexões e middlewares
import { connectMongo } from './config/mongo';
import { connectNeo4j } from './config/neo4j';
import { errorMiddleware } from './middlewares/errorMiddleware';

// Importação das rotas
import authRoutes from './routes/authRoutes';
import eventoRoutes from './routes/eventoRoutes'
import categoriaRoutes from './routes/categoriaRoutes'
import admRoutes from './routes/admRoutes';
import inscricaoRoutes from './routes/inscricaoRoutes';


dotenv.config();

const app = express();

// --- MIDDLEWARES ---
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.resolve(__dirname, '..', 'uploads')));

// --- ROTAS ---
// Endpoint de Autenticação
app.use('/api/auth', authRoutes);
app.use('/api/events', eventoRoutes)
app.use('/api/categorias', categoriaRoutes)
app.use('/api/adm', admRoutes)
app.use('/api/subscriptions', inscricaoRoutes)

// Rota de documentação
app.get("/docs", (req, res) => {
  const filePath = path.join(process.cwd(), "src/documention/documentacao-api.md");

  // Se o arquivo não existir, retorna erro amigável
  if (!fs.existsSync(filePath)) {
    return res.status(404).send("Arquivo de documentação não encontrado.");
  }

  // Envia um HTML básico que usa o componente zero-md para renderizar o Markdown lindamente
  res.setHeader("Content-Type", "text/html");
  res.send(`
    <!DOCTYPE html>
    <html lang="pt-br">
    <head>
      <meta charset="UTF-8">
      <title>API Documentation - Agenda Cultural</title>
      <script type="module" src="https://cdn.jsdelivr.net/gh/zerodevx/zero-md@2/dist/zero-md.min.js"></script>
      <style>
        body { background: #f8fafc; margin: 0; padding: 40px; font-family: sans-serif; display: flex; justify-content: center; }
        zero-md { 
          background: white; 
          padding: 40px; 
          border-radius: 20px; 
          box-shadow: 0 10px 30px rgba(0,0,0,0.05); 
          max-width: 900px;
          width: 100%;
        }
      </style>
    </head>
    <body>
      <!-- O truque: o zero-md lê o conteúdo Markdown da rota /docs/raw -->
      <zero-md src="/docs/raw"></zero-md>
    </body>
    </html>
  `);
});

// Rota auxiliar para entregar o texto puro do Markdown para o renderizador
app.get("/docs/raw", (req, res) => {
  const filePath = path.join(process.cwd(), "src/documention/documentacao-api.md");
  res.setHeader("Content-Type", "text/markdown; charset=utf-8");
  const content = fs.readFileSync(filePath, "utf-8");
  res.send(content);
});

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
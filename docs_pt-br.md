This file is a merged representation of the entire codebase, combined into a single document by Repomix.
The content has been processed where security check has been disabled.

# Resumo do Arquivo

## Propósito
Este arquivo contém a representação empacotada of the todo o repositório's contents.
It is foi projetado para ser facilmente consumido by AI systems for analysis, code review,
or other automated processes.

## Formato do Arquivo
O conteúdo está organizado da seguinte forma:
1. This summary section
2. Repository information
3. Directory structure
4. Arquivos do repositório (if enabled)
5. Multiple file entries, each consisting of:
  a. A header with the file path (## File: path/to/file)
  b. The full contents of the file in a code block

## Diretrizes de Uso
- Este arquivo deve ser tratado como somente leitura. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.

## Observações
- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this representação empacotada. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- A verificação de segurança foi desativada - content may contain sensitive information
- Os arquivos são ordenados by Git change count (files with more changes are at the bottom)

# Estrutura de Diretórios
```
Projeto_PW1_BD2_Agenda_Cultural-main/
  backend/
    src/
      config/
        mongo.ts
        multer.ts
        neo4j.ts
      controllers/
        admController.ts
        authController.ts
        categoriaController.ts
        eventoController.ts
        inscricaoController.ts
      errors/
        apiError.ts
      middlewares/
        authMiddleware.ts
        errorMiddleware.ts
        roleMiddleware.ts
      models/
        Categoria.ts
        Evento.ts
        Inscricao.ts
        Local.ts
        Relatorio.ts
        Usuario.ts
      routes/
        admRoutes.ts
        authRoutes.ts
        categoriaRoutes.ts
        eventoRoutes.ts
        inscricaoRoutes.ts
      services/
        admService.ts
        authService.ts
        categoriaService.ts
        eventoService.ts
        inscricaoService.ts
      types/
        express.d.ts
        ITokenPayload.ts
        Papel.ts
      app.ts
    .env.example
    .gitignore
    docker-compose.yml
    package.json
    tsconfig.json
  frontend/
    src/
      components/
        EventModal.tsx
        Footer.tsx
        Header.tsx
        MapPicker.tsx
      hooks/
        useCurrentLocation.ts
      pages/
        AdminPage.tsx
        CreateEventPage.tsx
        GalleryPage.tsx
        LoginPage.tsx
        OrganizerPage.tsx
        ProfilePage.tsx
        RegisterPage.tsx
      services/
        api.ts
      styles/
        admin.css
        forms.css
        gallery.css
        global.css
        login.css
        modal.css
      types/
        index.ts
      App.css
      App.tsx
      index.css
      main.tsx
    .gitignore
    eslint.config.js
    index.html
    package.json
    README.md
    tsconfig.app.json
    tsconfig.json
    tsconfig.node.json
    vite.config.ts
  .gitattributes
  LICENSE
  README.md
```

# Files

## File: Projeto_PW1_BD2_Agenda_Cultural-main/backend/src/config/mongo.ts
````typescript
import mongoose from 'mongoose';
import dns from 'node:dns';

dns.setServers(['8.8.8.8', '8.8.4.4']);

export const connectMongo = async () => {
  try {
    console.log('⏳ [MONGO]: Tentando conexão via SRV...');
    
    // Use a string CURTA (aquela com +srv) no seu .env
    await mongoose.connect(process.env.MONGO_URI!, {
      serverSelectionTimeoutMS: 20000,
      family: 4, // Força IPv4
    });

    console.log('✅ [MONGO]: CONECTADO NA NUVEM ATLAS!');
  } catch (error: any) {
    console.error('❌ [MONGO]: Erro na conexão!');
    console.error(error.message);
    
    // Se ainda der erro, vamos dar a dica final
    if(error.message.includes('querySrv')) {
       console.log('💡 [DICA]: O hack de DNS falhou. Tente usar uma VPN (como a do Opera ou Proton) apenas para testar.');
    }
    
    process.exit(1);
  }
};
````

## File: Projeto_PW1_BD2_Agenda_Cultural-main/backend/src/config/multer.ts
````typescript
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.resolve('uploads')),
  filename: (req, file, cb) => {
    const hash = crypto.randomBytes(6).toString('hex');
    cb(null, `${hash}-${file.originalname}`);
  }
});

export const upload = multer({ storage });
````

## File: Projeto_PW1_BD2_Agenda_Cultural-main/backend/src/config/neo4j.ts
````typescript
import neo4j, { Driver } from 'neo4j-driver';

export let neo4jDriver: Driver;

export const connectNeo4j = async () => {
  try {
    console.log('⏳ [NEO4J]: Tentando conectar ao AuraDB...');
    
    neo4jDriver = neo4j.driver(
      process.env.NEO4J_URI!,
      neo4j.auth.basic(process.env.NEO4J_USER!, process.env.NEO4J_PASSWORD!)
    );

    await neo4jDriver.verifyConnectivity();
    console.log('✅ [NEO4J]: Conectado com sucesso!');
  } catch (error: any) {
    console.error('❌ [NEO4J]: Falha na conexão!');
    console.error(error.message);
    process.exit(1);
  }
};
````

## File: Projeto_PW1_BD2_Agenda_Cultural-main/backend/src/controllers/admController.ts
````typescript
import { Request, Response } from 'express';
import * as admService from '../services/admService';
import { BadRequestError } from '../errors/apiError';

export const getSuggestions = async (req: Request, res: Response) => {
  const data = await admService.listAllSuggestions();
  return res.json(data);
};

export const updateSuggestion = async (req: Request, res: Response) => {
  // 1. Pegamos o ID dos params
  const { id } = req.params;

  // 2. Garantimos que o ID é uma string única (resolve o erro TS2345)
  // Se for um array, pegamos a primeira posição. Se não existir, erro.
  const suggestionId = Array.isArray(id) ? id[0] : id;

  if (!suggestionId) {
    throw new BadRequestError('ID da sugestão é obrigatório.');
  }

  // 3. Passamos para o service agora com a tipagem correta
  const data = await admService.updateSuggestionStatus(suggestionId, req.body);
  
  return res.json(data);
};

export const createReport = async (req: Request, res: Response) => {
  // Pegamos o ID do usuário (vindo do Token decodificado)
  const autorId = req.user?.id;
  const { tipo } = req.body;

  if (!autorId) {
    throw new BadRequestError('Usuário não identificado.');
  }

  if (!tipo) {
    throw new BadRequestError('O tipo do relatório é obrigatório.');
  }

  // String(autorId) garante que o ID (mesmo que venha como objeto do Mongo) vire string para o Service
  const relatorio = await admService.generateAIReport(tipo, String(autorId));
  
  return res.status(201).json(relatorio);
};
````

## File: Projeto_PW1_BD2_Agenda_Cultural-main/backend/src/controllers/authController.ts
````typescript
import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/authService';
import { BadRequestError } from '../errors/apiError';

export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Wrapper simples para evitar try/catch repetitivo
const catchAsync = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  fn(req, res, next).catch(next);
};

export const register = catchAsync(async (req: Request, res: Response) => {
  const usuario = await authService.register(req.body);
  return res.status(201).json(usuario);
});

export const login = catchAsync(async (req: Request, res: Response) => {
  const result = await authService.login(req.body);
  return res.json(result);
});

export const updatePassword = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { senhaAtual, novaSenha } = req.body;

  if (!userId) throw new BadRequestError('Usuário não identificado.');
  if (!senhaAtual || !novaSenha) throw new BadRequestError('Campos de senha são obrigatórios.');

  const result = await authService.updatePassword(String(userId), senhaAtual, novaSenha);
  return res.json(result);
});
````

## File: Projeto_PW1_BD2_Agenda_Cultural-main/backend/src/controllers/categoriaController.ts
````typescript
import { Request, Response } from 'express';
import * as categoriaService from '../services/categoriaService'

export const store = async (req: any, res: any) => {
  const categoria = await categoriaService.create(req.body);
  return res.status(201).json(categoria);
};

export const index = async (req: any, res: any) => {
  const categorias = await categoriaService.listAll();
  return res.json(categorias);
};
````

## File: Projeto_PW1_BD2_Agenda_Cultural-main/backend/src/controllers/eventoController.ts
````typescript
import { Request, Response } from 'express';
import * as eventoService from '../services/eventoService';
import { BadRequestError } from '../errors/apiError';

export const indexByOrganizer = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id; // ID vindo do Token
    const eventos = await eventoService.listByOrganizer(userId);
    return res.json(eventos);
  } catch (error) {
    return res.status(500).json({ message: "Erro ao buscar seus eventos" });
  }
};

export const store = async (req: Request, res: Response) => {
  const usuario = { id: req.user!.id, papel: req.user!.papel };
  let foto_url = req.body.foto_url_externa || undefined;
  if (req.file) foto_url = `http://localhost:3333/uploads/${req.file.filename}`;
  const evento = await eventoService.create(req.body, usuario, foto_url);
  return res.status(201).json(evento);
};

export const index = async (req: Request, res: Response) => {
  const eventos = await eventoService.listAllPublic();
  return res.json(eventos);
};

export const toggleStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const eventId = Array.isArray(id) ? id[0] : id;
  const evento = await eventoService.toggleVisibility(eventId!, req.user!.id, req.user!.papel);
  return res.json(evento);
};

export const show = async (req: Request, res: Response) => {
  const { id } = req.params;
  const eventId = Array.isArray(id) ? id[0] : id;
  const evento = await eventoService.getById(eventId!);
  return res.json(evento);
};

export const update = async (req: Request, res: Response) => {
  const { id } = req.params;
  const eventId = Array.isArray(id) ? id[0] : id;
  const userId = req.user!.id;
  const evento = await eventoService.update(eventId, userId, req.body);
  return res.json(evento);
};

export const destroy = async (req: Request, res: Response) => {
  const { id } = req.params;
  const eventId = Array.isArray(id) ? id[0] : id;
  const userId = req.user!.id;
  const resultado = await eventoService.remove(eventId, userId);
  return res.json(resultado);
};
````

## File: Projeto_PW1_BD2_Agenda_Cultural-main/backend/src/controllers/inscricaoController.ts
````typescript
import { Request, Response } from 'express';
import * as inscricaoService from '../services/inscricaoService';
import { BadRequestError } from '../errors/apiError';

export const store = async (req: Request, res: Response) => {
  const { eventoId } = req.body;
  const userId = req.user?.id; // Pegamos do token via authMiddleware

  if (!userId) throw new BadRequestError('Usuário não autenticado.');
  if (!eventoId) throw new BadRequestError('ID do evento é obrigatório.');

  const resultado = await inscricaoService.criarInscricao(String(userId), String(eventoId));
  
  return res.status(201).json(resultado);
};

export const index = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  
  if (!userId) throw new BadRequestError('Usuário não identificado.');

  const eventos = await inscricaoService.listarMinhasInscricoes(String(userId));
  return res.json(eventos);
};
````

## File: Projeto_PW1_BD2_Agenda_Cultural-main/backend/src/errors/apiError.ts
````typescript
// Classe base para erros
export class ApiError extends Error {
  public readonly statusCode: number

  constructor(message: string, statusCode: number) {
    super(message)
    this.statusCode = statusCode
  }
}

// Erros específicos que podemos reutilizar
export class NotFoundError extends ApiError {
  constructor(message: string) {
    super(message, 404)
  }
}

export class BadRequestError extends ApiError {
  constructor(message: string) {
    super(message, 400)
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message: string) {
    super(message, 401)
  }
}

export class ForbiddenError extends ApiError {
  constructor(message: string) {
    super(message, 403)
  }
}
````

## File: Projeto_PW1_BD2_Agenda_Cultural-main/backend/src/middlewares/authMiddleware.ts
````typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UnauthorizedError } from '../errors/apiError';
import { ITokenPayload } from '../types/ITokenPayload';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) throw new UnauthorizedError('Token não fornecido.');

  const [, token] = authHeader.split(' ');

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as ITokenPayload;
    
    req.user = {
      id: decoded.id,
      papel: decoded.papel
    };

    return next();
  } catch (err) {
    throw new UnauthorizedError('Token inválido.');
  }
};
````

## File: Projeto_PW1_BD2_Agenda_Cultural-main/backend/src/middlewares/errorMiddleware.ts
````typescript
import { Request, Response, NextFunction } from 'express'
import { ApiError } from '../errors/apiError'
import { ZodError } from 'zod'

export const errorMiddleware = (
  error: Error & Partial<ApiError>,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("❌ [ERRO]:", error);

  if (error instanceof ZodError) {
    return res.status(400).json({
      message: "Erro de validação nos dados enviados",
      // AQUI: Troque .errors por .issues
      errors: error.issues.map(err => ({
        campo: err.path.join('.'),
        mensagem: err.message
      }))
    });
  }

  // Captura erros conhecidos da API (404, 401, 403, etc)
  const statusCode = error.statusCode ?? 500
  const message = error.statusCode ? error.message : 'Erro interno no servidor'
  
  return res.status(statusCode).json({ 
    message,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
  })
}
````

## File: Projeto_PW1_BD2_Agenda_Cultural-main/backend/src/middlewares/roleMiddleware.ts
````typescript
import { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '../errors/apiError';

export const roleMiddleware = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user || !allowedRoles.includes(user.papel)) {
      throw new ForbiddenError('Acesso negado. Permissão insuficiente.');
    }

    next();
  };
};
````

## File: Projeto_PW1_BD2_Agenda_Cultural-main/backend/src/models/Categoria.ts
````typescript
import { Schema, model } from 'mongoose';

const CategoriaSchema = new Schema({
  nome: { type: String, required: true, unique: true },
  icone_url: { type: String }
}, { timestamps: true });

export const CategoriaModel = model('Categoria', CategoriaSchema);
````

## File: Projeto_PW1_BD2_Agenda_Cultural-main/backend/src/models/Evento.ts
````typescript
import { Schema, model } from 'mongoose';

const EventoSchema = new Schema({
  titulo: { type: String, required: true },
  descricao: { type: String, required: true },
  data_inicio: { type: Date, required: true },
  data_fim: { type: Date },
  foto_url: { type: String },
  valor_ingresso: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['PENDENTE', 'APROVADO', 'REJEITADO', 'CANCELADO'], 
    default: 'PENDENTE' 
  },
  
  categoria_id: { type: Schema.Types.ObjectId, ref: 'Categoria', required: true },
  organizador_id: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true },

  // REQUISITO: Objeto Espacial GeoJSON para localização
  localizacao: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
      required: true
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    },
    nome_local: { type: String, required: true }
  }
}, { timestamps: true });

// Índice vital para buscas geográficas e Leaflet
EventoSchema.index({ localizacao: '2dsphere' });

export const EventoModel = model('Evento', EventoSchema);
````

## File: Projeto_PW1_BD2_Agenda_Cultural-main/backend/src/models/Inscricao.ts
````typescript
import { Schema, model } from 'mongoose';

const InscricaoSchema = new Schema({
  usuario_id: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true },
  evento_id: { type: Schema.Types.ObjectId, ref: 'Evento', required: true },
}, { timestamps: true });

// Índice único para impedir que o mesmo cara se inscreva duas vezes
InscricaoSchema.index({ usuario_id: 1, evento_id: 1 }, { unique: true });

export const InscricaoModel = model('Inscricao', InscricaoSchema);
````

## File: Projeto_PW1_BD2_Agenda_Cultural-main/backend/src/models/Local.ts
````typescript
import { Schema, model } from 'mongoose';

const LocalSchema = new Schema({
  nome: { type: String, required: true },
  endereco_completo: { type: String },
  cidade: { type: String },
  cap_max: { type: Number },
  
  // REQUISITO: GeoJSON
  location: {
    type: {
      type: String, 
      enum: ['Point'], 
      default: 'Point',
      required: true
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  }
}, { timestamps: true });

// Índice para buscas no Leaflet
LocalSchema.index({ location: '2dsphere' });

export const LocalModel = model('Local', LocalSchema);
````

## File: Projeto_PW1_BD2_Agenda_Cultural-main/backend/src/models/Relatorio.ts
````typescript
import { Schema, model } from 'mongoose';

const RelatorioSchema = new Schema({
  tipo: { type: String, required: true }, // Ex: "Impacto Cultural Mensal"
  autor: { 
    type: Schema.Types.ObjectId, 
    ref: 'Usuario', 
    required: true 
  },
  // O tipo Mixed permite salvar o objeto JSON completo retornado pela lógica da IA
  dados: { type: Schema.Types.Mixed, required: true }, 
  gerado_em: { type: Date, default: Date.now }
});

export const RelatorioModel = model('Relatorio', RelatorioSchema);
````

## File: Projeto_PW1_BD2_Agenda_Cultural-main/backend/src/models/Usuario.ts
````typescript
import { Schema, model} from "mongoose";
import { Papel } from "../types/Papel";

export const UsuarioSchema = new Schema({
  nome: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  senha_hash: { type: String, required: true },
  papel: { 
    type: String, 
    enum: Object.values(Papel), 
    default: 'CIDADAO' 
  },
  ativo: { type: Boolean, default: true },

  // Campos de especialização do seu MER
  cnpj: { type: String },
  razao_social: { type: String },
  matricula_funcional: { type: String },
  secretaria: { type: String }
}, { 
  timestamps: true 
});

// Sanitização: Remove a senha ao converter para JSON (Front-end)
UsuarioSchema.set('toJSON', {
  // Tipamos o 'ret' como any para o TypeScript parar de reclamar
  transform: (_: any, ret: any) => {
    delete ret.senha_hash;
    return ret;
  }
});

// Sanitização: Remove a senha ao converter para objeto simples
UsuarioSchema.set('toObject', {
  transform: (_: any, ret: any) => {
    delete ret.senha_hash;
    return ret;
  }
});

export const UsuarioModel = model('Usuario', UsuarioSchema);
````

## File: Projeto_PW1_BD2_Agenda_Cultural-main/backend/src/routes/admRoutes.ts
````typescript
import { Router } from 'express';
import * as admController from '../controllers/admController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { roleMiddleware } from '../middlewares/roleMiddleware';

const router = Router();

// Proteção global para todas as rotas de admin
router.use(authMiddleware);
router.use(roleMiddleware(['ADMINISTRADOR', 'GESTOR_PUBLICO']));

// Rotas de Moderação
router.get('/sugestoes', admController.getSuggestions);
router.patch('/sugestoes/:id/status', admController.updateSuggestion);

// Rotas de Relatório IA
router.post('/relatorios/gerar', admController.createReport);

export default router;
````

## File: Projeto_PW1_BD2_Agenda_Cultural-main/backend/src/routes/authRoutes.ts
````typescript
import { Router } from 'express';
import * as authController from '../controllers/authController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);

// Rota protegida para alterar senha
router.patch('/update-password', authMiddleware, authController.updatePassword);

export default router;
````

## File: Projeto_PW1_BD2_Agenda_Cultural-main/backend/src/routes/categoriaRoutes.ts
````typescript
import { Router } from 'express';
import * as categoriaController from '../controllers/categoriaController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();


router.get('/', categoriaController.index);
router.post('/', authMiddleware, categoriaController.store);

export default router;
````

## File: Projeto_PW1_BD2_Agenda_Cultural-main/backend/src/routes/eventoRoutes.ts
````typescript
import { Router } from 'express';
import * as eventoController from '../controllers/eventoController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { upload } from '../config/multer';

const router = Router();

// 1. ROTAS FIXAS (Sempre primeiro)
router.get('/', eventoController.index);
router.get('/mine', authMiddleware, eventoController.indexByOrganizer); // <--- DEVE ESTAR AQUI

// 2. ROTAS DINÂMICAS (Sempre por último)
router.get('/:id', eventoController.show);

// 3. OUTRAS
router.post('/', authMiddleware, upload.single('foto'), eventoController.store);
router.patch('/:id/toggle', authMiddleware, eventoController.toggleStatus);
router.patch('/:id', authMiddleware, upload.single('foto'), eventoController.update);
router.delete('/:id', authMiddleware, eventoController.destroy);

export default router;
````

## File: Projeto_PW1_BD2_Agenda_Cultural-main/backend/src/routes/inscricaoRoutes.ts
````typescript
import { Router } from 'express';
import * as inscricaoController from '../controllers/inscricaoController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// POST /api/subscriptions -> Criar
router.post('/', authMiddleware, inscricaoController.store);

// GET /api/subscriptions/me -> Ver minhas inscrições
router.get('/me', authMiddleware, inscricaoController.index);

export default router;
````

## File: Projeto_PW1_BD2_Agenda_Cultural-main/backend/src/services/admService.ts
````typescript
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

// --- GERAR RELATÓRIO ESTATÍSTICO (Substituiu a IA) ---
export const generateAIReport = async (tipo: string, autorId: string) => {
  try {
    // Coleta dados reais do banco de dados de forma paralela
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

    // Salva o snapshot dos dados no banco (requisito de histórico de relatórios)
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
````

## File: Projeto_PW1_BD2_Agenda_Cultural-main/backend/src/services/authService.ts
````typescript
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { UsuarioModel } from '../models/Usuario';
import { neo4jDriver } from '../config/neo4j';
import { BadRequestError, UnauthorizedError, NotFoundError, ApiError } from '../errors/apiError';

const registerSchema = z.object({
  nome: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("E-mail inválido"),
  senha: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
  papel: z.string(),
  cnpj: z.string().optional(),
  razao_social: z.string().optional(),
}).refine((data) => {
  // REGRA: Se for Organizador, o CNPJ tem que existir e ter pelo menos 14 caracteres
  if (data.papel === 'ORGANIZADOR') {
    return data.cnpj && data.cnpj.replace(/\D/g, '').length === 14;
  }
  return true;
}, {
  message: "Para organizadores, o CNPJ deve ter 14 números",
  path: ["cnpj"] // O erro será focado no campo CNPJ
});

export const register = async (data: unknown) => {
  // O .parse() agora vai barrar CNPJs inválidos para Organizadores
  const validatedData = registerSchema.parse(data);

  const exists = await UsuarioModel.findOne({ email: validatedData.email });
  if (exists) throw new BadRequestError('E-mail já cadastrado.');

  const senha_hash = await bcrypt.hash(validatedData.senha, 10);
  
  // Removemos a senha do objeto antes de salvar
  const { senha, ...rest } = validatedData;

  // Criamos no MongoDB
  const usuario = await UsuarioModel.create({ ...rest, senha_hash });

  // Sincronização Neo4j
  const session = neo4jDriver.session();
  try {
    await session.run(
      'CREATE (u:Usuario {mongoId: $id, nome: $nome, papel: $papel})',
      { id: usuario._id.toString(), nome: usuario.nome, papel: usuario.papel }
    );
  } catch (error) {
    await UsuarioModel.findByIdAndDelete(usuario._id);
    throw new ApiError('Falha na sincronização poliglota.', 500);
  } finally {
    await session.close();
  }

  return usuario;
};

export const login = async (data: any) => {
  const { email, senha } = data;
  
  // 1. Busca usuário
  const usuario = await UsuarioModel.findOne({ email });

  // 2. Se não existe ou a senha não bate, lança o erro
  // O catchAsync no controller vai pegar esse throw e mandar pro errorMiddleware
  if (!usuario || !(await bcrypt.compare(senha, usuario.senha_hash))) {
    throw new UnauthorizedError('E-mail ou senha incorretos.');
  }

  const token = jwt.sign(
    { id: usuario._id, papel: usuario.papel },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '1d' }
  );

  return { user: usuario, token };
};

// --- NOVA FUNCIONALIDADE: ALTERAR SENHA ---
export const updatePassword = async (userId: string, senhaAtual: string, novaSenha: string) => {
  const usuario = await UsuarioModel.findById(userId);
  if (!usuario) throw new NotFoundError('Usuário não encontrado.');

  // Verifica se a senha atual está correta
  const senhaValida = await bcrypt.compare(senhaAtual, usuario.senha_hash);
  if (!senhaValida) throw new BadRequestError('Senha atual incorreta.');

  // Gera novo hash e salva
  usuario.senha_hash = await bcrypt.hash(novaSenha, 10);
  await usuario.save();

  return { message: "Senha atualizada com sucesso!" };
};
````

## File: Projeto_PW1_BD2_Agenda_Cultural-main/backend/src/services/categoriaService.ts
````typescript
import { z } from 'zod';
import { CategoriaModel } from '../models/Categoria';
import { BadRequestError } from '../errors/apiError';

// Validação simples
const categoriaSchema = z.object({
  nome: z.string().min(2, "Nome da categoria muito curto"),
  icone_url: z.string().optional()
});

export const create = async (data: any) => {
  const validatedData = categoriaSchema.parse(data);

  // Verifica se o nome já existe
  const exists = await CategoriaModel.findOne({ nome: validatedData.nome });
  if (exists) throw new BadRequestError('Esta categoria já existe.');

  return await CategoriaModel.create(validatedData);
};

export const listAll = async () => {
  return await CategoriaModel.find().sort({ nome: 1 });
};
````

## File: Projeto_PW1_BD2_Agenda_Cultural-main/backend/src/services/eventoService.ts
````typescript
import { z } from 'zod';
import mongoose from 'mongoose';
import { EventoModel } from '../models/Evento';
import { neo4jDriver } from '../config/neo4j';
import { BadRequestError, NotFoundError, ForbiddenError, ApiError } from '../errors/apiError';

// SCHEMA ÚNICO DE VALIDAÇÃO (Reutilizável)
const eventoSchema = z.object({
  titulo: z.string()
    .min(3, "O título deve ter pelo menos 3 caracteres")
    .max(100, "Título muito longo"),
  descricao: z.string()
    .min(10, "A descrição deve ter pelo menos 10 caracteres")
    .max(2000, "Descrição muito longa"),
  data_inicio: z.string().transform((val) => new Date(val)),
  data_fim: z.string().optional().transform((val) => val ? new Date(val) : undefined),
  valor_ingresso: z.any().transform((val) => {
    const parsed = typeof val === 'string' ? parseFloat(val) : val;
    return isNaN(parsed) ? 0 : parsed;
  }),
  categoria_id: z.string().min(1, "Selecione uma categoria"),
  nome_local: z.string().min(2, "Informe o nome do local"),
  longitude: z.any().transform((val) => parseFloat(val)),
  latitude: z.any().transform((val) => parseFloat(val)),
});

export const create = async (data: unknown, usuario: { id: string, papel: string }, foto_url?: string) => {
  // O .parse() joga um erro se os dados forem inválidos, que o errorMiddleware captura
  const validatedData = eventoSchema.parse(data);

  const statusInicial = (usuario.papel === 'ORGANIZADOR' || usuario.papel === 'ADMINISTRADOR') 
    ? 'APROVADO' 
    : 'PENDENTE';

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
      coordinates: [validatedData.longitude, validatedData.latitude],
      nome_local: validatedData.nome_local
    }
  });

  // Persistência Poliglota (Neo4j)
  const session = neo4jDriver.session();
  try {
    await session.run(
      `MATCH (u:Usuario {mongoId: $uId}) 
       CREATE (e:Evento {mongoId: $eId, titulo: $titulo, data: $data}) 
       CREATE (u)-[:ANUNCIOU]->(e)`,
      {
        uId: usuario.id,
        eId: evento._id.toString(),
        titulo: evento.titulo,
        data: evento.data_inicio.toISOString()
      }
    );
  } catch (error) {
    console.error("Erro Neo4j:", error);
  } finally {
    await session.close();
  }

  return evento;
};

export const update = async (eventoId: string, userId: string, data: any) => {
  const partialSchema = eventoSchema.partial();
  const validatedData = partialSchema.parse(data);

  const evento = await EventoModel.findById(eventoId);
  if (!evento) throw new NotFoundError('Evento não encontrado.');
  if (evento.organizador_id.toString() !== userId) throw new ForbiddenError('Sem permissão.');

  Object.assign(evento, validatedData);

  if (data.latitude && data.longitude) {
    evento.localizacao = {
      type: 'Point',
      coordinates: [parseFloat(data.longitude), parseFloat(data.latitude)],
      nome_local: data.nome_local || (evento.localizacao as any).nome_local
    };
  }

  await evento.save();
  return evento;
};

export const listAllPublic = async () => {
  return await EventoModel.find({ status: 'APROVADO' })
    .populate('categoria_id')
    .populate('organizador_id', 'nome')
    .sort({ data_inicio: 1 });
};

export const listByOrganizer = async (userId: string) => {
  return await EventoModel.find({ organizador_id: new mongoose.Types.ObjectId(userId) })
    .populate('categoria_id')
    .sort({ createdAt: -1 });
};

export const getById = async (id: string) => {
  const evento = await EventoModel.findById(id).populate('categoria_id').populate('organizador_id', 'nome email');
  if (!evento) throw new NotFoundError('Evento não encontrado.');
  return evento;
};

export const toggleVisibility = async (eventoId: string, userId: string, userRole: string) => {
  const evento = await EventoModel.findById(eventoId);
  if (!evento) throw new NotFoundError('Evento não encontrado.');
  if (evento.organizador_id.toString() !== userId && userRole !== 'ADMINISTRADOR') throw new ForbiddenError('Sem permissão.');
  evento.status = evento.status === 'APROVADO' ? 'CANCELADO' : 'APROVADO';
  await evento.save();
  return evento;
};

export const remove = async (eventoId: string, userId: string) => {
  // 1. Verificar se o evento existe e pertence ao organizador
  const evento = await EventoModel.findById(eventoId);
  
  if (!evento) throw new NotFoundError('Evento não encontrado.');
  
  if (evento.organizador_id.toString() !== userId) {
    throw new ForbiddenError('Você não tem permissão para excluir este evento.');
  }

  // 2. Deletar do MongoDB
  await EventoModel.findByIdAndDelete(eventoId);

  // 3. Deletar do Neo4j (Persistência Poliglota)
  const session = neo4jDriver.session();
  try {
    await session.run(
      'MATCH (e:Evento {mongoId: $id}) DETACH DELETE e',
      { id: eventoId }
    );
  } catch (error) {
    console.error("⚠️ [NEO4J]: Erro ao remover nó do evento:", error);
  } finally {
    await session.close();
  }

  return { message: "Evento removido com sucesso." };
};
````

## File: Projeto_PW1_BD2_Agenda_Cultural-main/backend/src/services/inscricaoService.ts
````typescript
import { InscricaoModel } from '../models/Inscricao';
import { EventoModel } from '../models/Evento';
import { neo4jDriver } from '../config/neo4j';
import { BadRequestError, NotFoundError } from '../errors/apiError';

export const criarInscricao = async (userId: string, eventoId: string) => {
  // 1. Validar se o evento existe
  const evento = await EventoModel.findById(eventoId);
  if (!evento) throw new NotFoundError('Evento não encontrado.');

  // 2. MongoDB: Salvar documento de inscrição
  try {
    await InscricaoModel.create({ usuario_id: userId, evento_id: eventoId });
  } catch (error: any) {
    if (error.code === 11000) throw new BadRequestError('Você já está inscrito neste evento.');
    throw error;
  }

  // 3. Neo4j: Criar relação entre os nós (Persistência Poliglota)
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
    // Não travamos o processo se o Neo4j falhar, mas logamos o erro.
  } finally {
    await session.close();
  }

  return { message: "Presença confirmada com sucesso!" };
};

export const listarMinhasInscricoes = async (userId: string) => {
  const inscricoes = await InscricaoModel.find({ usuario_id: userId })
    .populate({
      path: 'evento_id',
      populate: { path: 'categoria_id' } // Traz o nome da categoria junto
    })
    .sort({ createdAt: -1 });

  // Retornamos apenas os objetos de evento para facilitar o map no frontend
  return inscricoes.map(i => i.evento_id).filter(e => e !== null);
};
````

## File: Projeto_PW1_BD2_Agenda_Cultural-main/backend/src/types/express.d.ts
````typescript
import { ITokenPayload } from './ITokenPayload'

declare global {
  namespace Express {
    export interface Request {
      user?: ITokenPayload
    }
  }
}
````

## File: Projeto_PW1_BD2_Agenda_Cultural-main/backend/src/types/ITokenPayload.ts
````typescript
import type { Papel } from "./Papel"

export interface ITokenPayload {
  id: string
  papel: Papel
}
````

## File: Projeto_PW1_BD2_Agenda_Cultural-main/backend/src/types/Papel.ts
````typescript
// src/types/Papel.ts
export const Papel = {
  CIDADAO: 'CIDADAO',
  ORGANIZADOR: 'ORGANIZADOR',
  GESTOR_PUBLICO: 'GESTOR_PUBLICO',
  ADMINISTRADOR: 'ADMINISTRADOR',
  PARCEIRO_CULTURAL: 'PARCEIRO_CULTURAL',
} as const;

// Esta linha cria o "tipo" baseado nos valores da constante acima
export type Papel = typeof Papel[keyof typeof Papel];
````

## File: Projeto_PW1_BD2_Agenda_Cultural-main/backend/src/app.ts
````typescript
import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

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
````

## File: Projeto_PW1_BD2_Agenda_Cultural-main/backend/.env.example
````
PORT=A porta da sua api
JWT_SECRET=A senha do seu JWT

# MONGODB ATLAS
MONGO_PASSWORD=Sua senha do MogoDB
MONGO_USER=O nome de usuario do seu MongoDB
MONGO_URI=A url do seu MongoDB

# NEO4J AURADB
NEO4J_URI=A senha do seu Neo4j
NEO4J_USER=O nome usuario do seu Neo4j
NEO4J_PASSWORD=A senha do seu Neo4j
````

## File: Projeto_PW1_BD2_Agenda_Cultural-main/backend/.gitignore
````
node_modules
.env
````

## File: Projeto_PW1_BD2_Agenda_Cultural-main/backend/docker-compose.yml
````yaml
version: '3.8'

services:
  app:
    # Utiliza a imagem oficial do Node na versão exata solicitada
    image: node:22.19.0
    container_name: agenda_api
    
    # Define o diretório de trabalho dentro do container
    working_dir: /usr/app
    
    # Mapeia a porta da sua API (3333) para o seu computador
    ports:
      - "3333:3333"
    
    # Sincroniza os arquivos do seu PC com o container
    volumes:
      - .:/usr/app
      # Protege a pasta node_modules para não misturar arquivos do Windows com Linux
      - /usr/app/node_modules
    
    # Carrega suas variáveis de ambiente do arquivo .env
    env_file:
      - .env
    
    # Instala as dependências e inicia o projeto em modo de desenvolvimento
    command: sh -c "npm install && npm run dev"

    # Reinicia o container automaticamente se ele falhar
    restart: always
````

## File: Projeto_PW1_BD2_Agenda_Cultural-main/backend/package.json
````json
{
  "name": "backend",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "dev": "ts-node-dev --respawn --transpile-only src/app.ts",
    "build": "tsc"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "type": "commonjs",
  "dependencies": {
    "@google/generative-ai": "^0.24.1",
    "bcryptjs": "^3.0.3",
    "cors": "^2.8.6",
    "dotenv": "^17.2.3",
    "express": "^5.2.1",
    "jsonwebtoken": "^9.0.3",
    "mongoose": "^9.1.5",
    "multer": "^2.0.2",
    "neo4j-driver": "^6.0.1",
    "zod": "^4.3.6"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.6",
    "@types/cors": "^2.8.19",
    "@types/express": "^5.0.6",
    "@types/jsonwebtoken": "^9.0.10",
    "@types/multer": "^2.0.0",
    "@types/node": "^25.2.0",
    "ts-node-dev": "^2.0.0",
    "typescript": "^5.9.3"
  }
}
````

## File: Projeto_PW1_BD2_Agenda_Cultural-main/backend/tsconfig.json
````json
{
  "compilerOptions": {
    /* Configurações de Compilação */
    "target": "ES2020",                                  
    "module": "CommonJS",                                
    "moduleResolution": "node",
    "rootDir": "./src",                                  
    "outDir": "./dist",                                  
    
    /* Interoperabilidade (Importante para bcrypt e jwt) */
    "esModuleInterop": true,                             
    "forceConsistentCasingInFileNames": true,            
    
    /* Rigor do TypeScript */
    "strict": true,                                      
    "skipLibCheck": true,                                
    
    /* Caminhos de Tipagem (O segredo para o req.user funcionar) */
    "typeRoots": [
      "./node_modules/@types",
      "./src/@types"
    ]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
````

## File: Projeto_PW1_BD2_Agenda_Cultural-main/frontend/src/components/EventModal.tsx
````typescript
import React, { useState } from 'react';
import { X, Calendar, MapPin, Ticket, Heart } from 'lucide-react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import api from '../services/api';
import '../styles/modal.css';

interface EventModalProps {
  evento: any;
  onClose: () => void;
}

export function EventModal({ evento, onClose }: EventModalProps) {
  const [loading, setLoading] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  if (!evento) return null;

  // --- TRATAMENTO DE COORDENADAS ---
  const coordinates = evento.localizacao?.coordinates;
  const hasCoords = Array.isArray(coordinates) && coordinates.length === 2;
  const position: [number, number] = hasCoords 
    ? [coordinates[1], coordinates[0]] 
    : [-6.7612, -38.5623];

  async function handleInscricao() {
    if (!user) return alert("Você precisa estar logado!");
    setLoading(true);
    try {
      const response = await api.post('/subscriptions', { eventoId: evento._id });
      alert(response.data.message);
    } catch (err: any) {
      alert(err.response?.data?.message || "Erro ao processar inscrição.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        
        {/* Botão de fechar sobre a foto */}
        
        <img 
          src={evento.foto_url || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=500&q=80'} 
          className="modal-header-img" 
          alt={evento.titulo} 
        />

        <div className="modal-info-section">
          <h2>{evento.titulo}</h2>
          <p className="modal-description">{evento.descricao}</p>

          <div className="details-grid">
            <div className="detail-box">
              <Calendar size={18} color="#6b21a8" />
              <div>
                <small>DATA</small>
                <p>{new Date(evento.data_inicio).toLocaleDateString('pt-BR')}</p>
              </div>
            </div>
            <div className="detail-box">
              <Ticket size={18} color="#6b21a8" />
              <div>
                <small>VALOR</small>
                <p>{evento.valor_ingresso > 0 ? `R$ ${evento.valor_ingresso.toFixed(2)}` : 'Gratuito'}</p>
              </div>
            </div>
          </div>

          <div style={{display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '14px', marginBottom: '15px'}}>
            <MapPin size={16} color="#6b21a8" />
            <span>{evento.localizacao?.nome_local}</span>
          </div>

          <div className="modal-map-container">
            <MapContainer center={position} zoom={15} style={{ height: '100%', width: '100%' }} zoomControl={false}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={position} />
            </MapContainer>
          </div>

          {/* --- FILTRO DO BOTÃO DE INSCRIÇÃO --- */}
          {/* O botão só aparece se o status for exatamente 'APROVADO' */}
          {evento.status === 'APROVADO' ? (
            <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
              <button className="interest-btn" onClick={handleInscricao} disabled={loading}>
                {loading ? 'Processando...' : 'Confirmar Presença'}
              </button>
              
            </div>
          ) : (
            <div style={{ marginTop: '20px', padding: '15px', background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '16px', textAlign: 'center' }}>
               <p style={{ margin: 0, color: '#92400e', fontSize: '14px', fontWeight: '600' }}>
                 {evento.status === 'PENDENTE' 
                   ? '⚠️ Este evento é uma sugestão e aguarda aprovação da prefeitura.' 
                   : '🚫 Este evento não está disponível para inscrições no momento.'}
               </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
````

## File: Projeto_PW1_BD2_Agenda_Cultural-main/frontend/src/components/Footer.tsx
````typescript
export function Footer() {
  return (
    <footer className="main-footer">
      <div className="footer-content">
        {/* <h3 style={{ color: 'var(--purple)', margin: '0 0 10px 0' }}>Agenda Cultural</h3> */}
        <p>© 2026 Agenda Cultural. Todos os direitos reservados.</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '5px', marginTop: '5px' }}>
          <a href="#" style={{ color: 'var(--gray)', textDecoration: 'none', fontSize: '13px' }}>Sobre</a>
          <a href="#" style={{ color: 'var(--gray)', textDecoration: 'none', fontSize: '13px' }}>Privacidade</a>
          <a href="#" style={{ color: 'var(--gray)', textDecoration: 'none', fontSize: '13px' }}>Contato</a>
        </div>
      </div>
    </footer>
  );
}
````

## File: Projeto_PW1_BD2_Agenda_Cultural-main/frontend/src/components/Header.tsx
````typescript
import { Search, MapPin, LogOut, UserCircle } from 'lucide-react'; // Ícone novo
import { useNavigate } from 'react-router-dom';
import { useCurrentLocation } from '../hooks/useCurrentLocation';

export function Header({ busca, setBusca }: any) {
  const navigate = useNavigate();
  const { city } = useCurrentLocation();
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <header className="main-header">
      <div className="brand-section">
        <h1 onClick={() => navigate('/events')} style={{cursor: 'pointer'}}>Agenda Cultural</h1>
        <div className="location-tag">
          <MapPin size={14} />
          <span>{city}</span>
        </div>
      </div>

      <div className="search-bar-header">
        <Search className="search-icon" size={18} />
        <input 
          type="text" 
          placeholder="Buscar eventos..." 
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      <div className="user-section">
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            {/* ÍCONE DE PERFIL CLICÁVEL */}
            <div 
              onClick={() => navigate('/perfil')}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px', 
                cursor: 'pointer',
                padding: '5px 12px',
                borderRadius: '20px',
                transition: '0.2s'
              }}
              className="profile-trigger"
            >
              <UserCircle size={32} color="var(--purple)" />
            </div>

            <button onClick={handleLogout} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', marginTop: '6.5px' }}>
              <LogOut size={20} />
            </button>
          </div>
        ) : (
          <button className="btn-purple" onClick={() => navigate('/')}>Entrar</button>
        )}
      </div>
    </header>
  );
}
````

## File: Projeto_PW1_BD2_Agenda_Cultural-main/frontend/src/components/MapPicker.tsx
````typescript
import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Ícone padrão do Leaflet (correção para o Vite)
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

interface MapPickerProps {
  onLocationSelect: (lat: number, lng: number) => void;
  targetCoords?: { lat: number, lng: number } | null;
}

// Componente auxiliar para mover a câmera do mapa
function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  map.flyTo(center, 15); // Efeito de deslizar até o local
  return null;
}

export function MapPicker({ onLocationSelect, targetCoords }: MapPickerProps) {
  const [position, setPosition] = useState<[number, number] | null>(null);

  // Se receber coordenadas externas (da busca), atualiza o marcador
  useEffect(() => {
    if (targetCoords) {
      setPosition([targetCoords.lat, targetCoords.lng]);
    }
  }, [targetCoords]);

  function LocationMarker() {
    useMapEvents({
      click(e) {
        setPosition([e.latlng.lat, e.latlng.lng]);
        onLocationSelect(e.latlng.lat, e.latlng.lng);
      },
    });

    return position === null ? null : <Marker position={position} />;
  }

  return (
    <MapContainer 
      center={[-6.7612, -38.5623]} 
      zoom={15} 
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {targetCoords && <ChangeView center={[targetCoords.lat, targetCoords.lng]} />}
      <LocationMarker />
    </MapContainer>
  );
}
````

## File: Projeto_PW1_BD2_Agenda_Cultural-main/frontend/src/hooks/useCurrentLocation.ts
````typescript
import { useState, useEffect } from 'react';

export function useCurrentLocation() {
  const [location, setLocation] = useState({
    city: 'Carregando local...',
    coords: { lat: -6.7612, lng: -38.5623 }, // Padrão Cajazeiras
    loading: true
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocation(prev => ({ ...prev, city: 'Cajazeiras, PB', loading: false }));
      return;
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;

      try {
        // Reverse Geocoding: Coordenadas -> Nome da Cidade
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
        );
        const data = await res.json();
        
        // Tenta pegar a cidade ou vila ou município
        const city = data.address.city || data.address.town || data.address.village || data.address.municipality || 'Local desconhecido';
        const state = data.address.state || '';

        setLocation({
          city: `${city}${state ? ', ' + state : ''}`,
          coords: { lat: latitude, lng: longitude },
          loading: false
        });
      } catch {
        setLocation(prev => ({ ...prev, city: 'Cajazeiras, PB', loading: false }));
      }
    }, () => {
      // Se o usuário negar a permissão
      setLocation(prev => ({ ...prev, city: 'Cajazeiras, PB', loading: false }));
    });
  }, []);

  return location;
}
````

## File: Projeto_PW1_BD2_Agenda_Cultural-main/frontend/src/pages/AdminPage.tsx
````typescript
import { useEffect, useState } from 'react';
import api from '../services/api';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { EventModal } from '../components/EventModal';
import { 
  Check, 
  X, 
  Sparkles, 
  LayoutDashboard, 
  MapPin, 
  Tag, 
  Eye, 
  FileText, 
  AlertCircle,
  Loader2,
  Users,
  CalendarCheck
} from 'lucide-react';
import '../styles/admin.css';

export function AdminPage() {
  const [tab, setTab] = useState<'moderacao' | 'relatorios'>('moderacao');
  const [sugestoes, setSugestoes] = useState<any[]>([]);
  const [relatorioData, setRelatorioData] = useState<any>(null);
  const [loadingIA, setLoadingIA] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [eventoSelecionado, setEventoSelecionado] = useState<any>(null);

  useEffect(() => {
    if (tab === 'moderacao') fetchSuggestions();
  }, [tab]);

  async function fetchSuggestions() {
    setLoadingData(true);
    try {
      const res = await api.get('/adm/sugestoes');
      setSugestoes(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingData(false);
    }
  }

  async function handleModeration(id: string, status: 'APROVADO' | 'REJEITADO') {
    try {
      await api.patch(`/adm/sugestoes/${id}/status`, { status });
      setSugestoes(prev => prev.filter(s => s._id !== id));
      alert(status === 'APROVADO' ? "Evento publicado!" : "Sugestão rejeitada.");
    } catch (err) {
      alert("Erro na moderação.");
    }
  }

  async function gerarRelatorioEstatistico() {
    setLoadingIA(true);
    try {
      const response = await api.post('/adm/relatorios/gerar', { 
        tipo: "Análise de Impacto Cultural" 
      });
      setRelatorioData(response.data.dados);
    } catch (err: any) {
      alert("Falha ao processar dados do sistema.");
    } finally {
      setLoadingIA(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header busca="" setBusca={() => {}} />

      <main className="admin-container" style={{ flex: 1, padding: '40px 20px' }}>
        <div className="admin-grid">
          
          <aside className="admin-sidebar">
            <div className={`sidebar-item ${tab === 'moderacao' ? 'active' : ''}`} onClick={() => setTab('moderacao')}>
              <LayoutDashboard size={20} /> Moderação
            </div>
            <div className={`sidebar-item ${tab === 'relatorios' ? 'active' : ''}`} onClick={() => setTab('relatorios')}>
              <FileText size={20} /> Relatórios
            </div>
          </aside>

          <section className="admin-content-area">
            
            {tab === 'moderacao' && (
              <div className="moderation-card">
                <div style={{ textAlign: 'left', marginBottom: '30px' }}>
                  <h2 style={{ margin: 0, fontSize: '28px', color: '#1e293b' }}>Moderação de Eventos</h2>
                  <p style={{ color: '#64748b', marginTop: '5px' }}>Valide as propostas enviadas pelos cidadãos.</p>
                </div>

                {loadingData ? (
                  <div style={{ padding: '40px', textAlign: 'center' }}>
                    <Loader2 className="spinner" size={40} color="var(--purple)" />
                  </div>
                ) : sugestoes.length === 0 ? (
                  <div className="empty-state">
                    <AlertCircle size={48} color="#cbd5e1" />
                    <p>Sem pendências no momento.</p>
                  </div>
                ) : (
                  <div className="suggestions-list">
                    {sugestoes.map(s => (
                      <div key={s._id} className="admin-suggestion-item">
                        <div className="suggestion-info">
                          <h4>{s.titulo}</h4>
                          <div className="suggestion-meta">
                            <span><MapPin size={14} /> {s.localizacao?.nome_local}</span>
                            <span><Tag size={14} /> {s.categoria_id?.nome}</span>
                          </div>
                        </div>
                        <div className="suggestion-actions">
                          <button className="btn-icon view" onClick={() => setEventoSelecionado(s)}><Eye size={20} /></button>
                          <button className="btn-icon approve" onClick={() => handleModeration(s._id, 'APROVADO')}><Check size={20} /></button>
                          <button className="btn-icon reject" onClick={() => handleModeration(s._id, 'REJEITADO')}><X size={20} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === 'relatorios' && (
              <div className="moderation-card">
                <div style={{ textAlign: 'left', marginBottom: '30px' }}>
                  <h2 style={{ margin: 0, fontSize: '28px', color: '#1e293b' }}>Dados do Sistema</h2>
                  <p style={{ color: '#64748b', marginTop: '5px' }}>Indicadores reais de engajamento e eventos.</p>
                </div>

                <button className="btn-main" onClick={gerarRelatorioEstatistico} disabled={loadingIA} style={{ width: 'auto', padding: '15px 30px' }}>
                  {loadingIA ? <><Loader2 className="spinner" size={20} /> Coletando...</> : "Gerar Relatório Atualizado"}
                </button>

                {relatorioData && (
                  <div style={{ marginTop: '30px' }}>
                    <div className="stats-grid">
                      <div className="stat-card">
                        <Users size={20} color="var(--purple)" />
                        <small>USUÁRIOS</small>
                        <h3>{relatorioData.estatisticas.totalUsuarios}</h3>
                      </div>
                      <div className="stat-card">
                        <CalendarCheck size={20} color="var(--purple)" />
                        <small>EVENTOS</small>
                        <h3>{relatorioData.estatisticas.totalEventos}</h3>
                      </div>
                      <div className="stat-card">
                        <Check size={20} color="#22c55e" />
                        <small>APROVADOS</small>
                        <h3 style={{color: '#22c55e'}}>{relatorioData.estatisticas.aprovados}</h3>
                      </div>
                      <div className="stat-card">
                        <AlertCircle size={20} color="#f59e0b" />
                        <small>PENDENTES</small>
                        <h3 style={{color: '#f59e0b'}}>{relatorioData.estatisticas.pendentes}</h3>
                      </div>
                    </div>

                    
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </main>
      <Footer />
      {eventoSelecionado && <EventModal evento={eventoSelecionado} onClose={() => setEventoSelecionado(null)} />}
    </div>
  );
}
````

## File: Projeto_PW1_BD2_Agenda_Cultural-main/frontend/src/pages/CreateEventPage.tsx
````typescript
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { MapPicker } from '../components/MapPicker';
import { Search, Calendar, Clock, Send, Loader2, MapPin } from 'lucide-react';
import { useCurrentLocation } from '../hooks/useCurrentLocation';
import '../styles/forms.css';

export function CreateEventPage() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const { city, coords: gpsCoords, loading: loadingGps } = useCurrentLocation();
  
  const [categorias, setCategorias] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);
  
  const [foto, setFoto] = useState<File | null>(null);
  const [fotoUrlExterna, setFotoUrlExterna] = useState('');
  const [usarLinkExterno, setUsarLinkExterno] = useState(false);
  
  const [nomeLocal, setNomeLocal] = useState('');
  const [coords, setCoords] = useState<{ lat: number, lng: number } | null>(null);
  const [dataInicio, setDataInicio] = useState('');
  const [horaInicio, setHoraInicio] = useState('');
  
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    valor_ingresso: '0',
    categoria_id: ''
  });

  const isCidadao = user?.papel === 'CIDADAO';

  // Seta a localização inicial baseada no GPS do navegador
  useEffect(() => {
    if (!loadingGps && gpsCoords) {
      setCoords(gpsCoords);
      setNomeLocal(city);
    }
  }, [loadingGps, gpsCoords, city]);

  useEffect(() => {
    api.get('/categorias').then(res => setCategorias(res.data));
  }, []);

  // --- FUNÇÃO DE BUSCA POR NOME (Reverse Geocoding) ---
  async function buscarNoMapa() {
    if (!nomeLocal.trim()) return;
    
    setLoadingSearch(true);
    try {
      // Usamos a API do OpenStreetMap para buscar as coordenadas pelo nome
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(nomeLocal)}`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const result = data[0];
        const newCoords = {
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon)
        };
        setCoords(newCoords);
        // Opcional: Atualiza o nome com o endereço completo retornado pela API
        // setNomeLocal(result.display_name); 
      } else {
        alert("Local não encontrado. Tente adicionar o nome da cidade (ex: Praça Matriz, Sousa).");
      }
    } catch (error) {
      alert("Erro ao pesquisar localização no serviço de mapas.");
    } finally {
      setLoadingSearch(false);
    }
  }

  // Permite dar 'Enter' no campo de busca
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      buscarNoMapa();
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!coords) return alert("Selecione o local no mapa!");

    setLoading(true);
    try {
      const data = new FormData();
      const inicioCompleto = `${dataInicio}T${horaInicio}`;

      data.append('titulo', formData.titulo);
      data.append('descricao', formData.descricao);
      data.append('data_inicio', inicioCompleto);
      data.append('valor_ingresso', formData.valor_ingresso);
      data.append('categoria_id', formData.categoria_id);
      data.append('nome_local', nomeLocal);
      data.append('latitude', String(coords.lat));
      data.append('longitude', String(coords.lng));

      if (usarLinkExterno) {
        data.append('foto_url_externa', fotoUrlExterna);
      } else if (foto) {
        data.append('foto', foto);
      }

      await api.post('/events', data);
      alert(isCidadao ? "Sugestão enviada para análise!" : "Evento publicado!");
      navigate('/events');
    } catch (err: any) {
      const erros = err.response?.data?.errors 
        ? err.response.data.errors.map((e: any) => e.mensagem).join('\n')
        : "Erro ao publicar.";
      alert(erros);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header busca="" setBusca={() => {}} />

      <main style={{ flex: 1, padding: '40px 20px' }}>
        <div className="form-container">
          <h2 style={{ color: 'var(--purple)', textAlign: 'left', marginBottom: '30px' }}>
            {isCidadao ? 'Sugerir Evento' : 'Anunciar Novo Evento'}
          </h2>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>TÍTULO</label>
              <input type="text" required minLength={3} onChange={e => setFormData({...formData, titulo: e.target.value})} />
            </div>

            <div className="form-group">
              <label>DESCRIÇÃO</label>
              <textarea required minLength={10} onChange={e => setFormData({...formData, descricao: e.target.value})} />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>DATA</label>
                <input type="date" required onChange={e => setDataInicio(e.target.value)} />
              </div>
              <div className="form-group">
                <label>HORA</label>
                <input type="time" required onChange={e => setHoraInicio(e.target.value)} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>CATEGORIA</label>
                <select required onChange={e => setFormData({...formData, categoria_id: e.target.value})}>
                  <option value="">Selecione...</option>
                  {categorias.map(cat => <option key={cat._id} value={cat._id}>{cat.nome}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>VALOR (R$)</label>
                <input type="number" step="0.01" min="0" onChange={e => setFormData({...formData, valor_ingresso: e.target.value})} />
              </div>
            </div>

            {/* SEÇÃO DE LOCALIZAÇÃO REFORMULADA */}
            <div className="form-group">
              <label>ONDE VAI SER? (NOME DO LOCAL)</label>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <MapPin size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input 
                    type="text" 
                    placeholder="Ex: Praça do Coreto, Cajazeiras" 
                    style={{ paddingLeft: '45px' }}
                    value={nomeLocal} 
                    required
                    onKeyDown={handleKeyPress}
                    onChange={e => setNomeLocal(e.target.value)} 
                  />
                </div>
                <button 
                  type="button" 
                  onClick={buscarNoMapa} 
                  disabled={loadingSearch}
                  className="btn-purple" 
                  style={{ width: '60px',marginTop: '10px', borderRadius: '16px', display: 'flex', justifyContent: 'base-line', alignItems: 'center' }}
                >
                   {loadingSearch ? <Loader2 className="spinner" size={20} /> : <Search size={20} />}
                </button>
              </div>

              <div className="map-picker-container">
                <MapPicker targetCoords={coords} onLocationSelect={(lat, lng) => setCoords({ lat, lng })} />
              </div>
              <p style={{ fontSize: '12px', color: '#64748b', marginTop: '8px', textAlign: 'left' }}>
                💡 <b>Dica:</b> Digite o nome do local e clique na lupa. Você também pode clicar diretamente no mapa para ajustar o ponto.
              </p>
            </div>

            <button className="btn-main" type="submit" disabled={loading} style={{ marginTop: '30px' }}>
              {loading ? <Loader2 className="spinner" /> : <><Send size={18}/> {isCidadao ? 'Enviar Sugestão' : 'Publicar Evento'}</>}
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
````

## File: Projeto_PW1_BD2_Agenda_Cultural-main/frontend/src/pages/GalleryPage.tsx
````typescript
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { EventModal } from '../components/EventModal';
import { LayoutDashboard, ShieldCheck, ArrowRight, Sparkles, Calendar, MapPin, PlusCircle } from 'lucide-react';
import '../styles/gallery.css';

export function GalleryPage() {
  const [eventos, setEventos] = useState<any[]>([]);
  const [busca, setBusca] = useState('');
  const [filtroCat, setFiltroCat] = useState('Todos');
  const [eventoSelecionado, setEventoSelecionado] = useState<any>(null);

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const categorias = ['Todos', 'Música', 'Teatro', 'Arte', 'Cinema', 'Danças'];

  useEffect(() => {
    api.get('/events').then(res => setEventos(res.data)).catch(() => {});
  }, []);

  const eventosFiltrados = eventos.filter(ev => 
    ev.titulo?.toLowerCase().includes(busca.toLowerCase()) &&
    (filtroCat === 'Todos' || ev.categoria_id?.nome === filtroCat)
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header busca={busca} setBusca={setBusca} />

      <main className="gallery-container" style={{ flex: 1 }}>
        <div className="categories-bar">
          {categorias.map(cat => (
            <button key={cat} className={`category-pill ${filtroCat === cat ? 'active' : ''}`} onClick={() => setFiltroCat(cat)}>{cat}</button>
          ))}
        </div>

        {/* DASHBOARD ADMIN/GESTOR */}
        {(user?.papel === 'ADMINISTRADOR' || user?.papel === 'GESTOR_PUBLICO') && (
          <div className="admin-shortcut-card" style={{ border: '2px solid #0f172a', background: '#f8fafc' }}>
            <div style={{ textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a' }}>
                <ShieldCheck size={24} /> <h3 style={{margin: 0}}>Painel de Gestão Pública</h3>
              </div>
              <p style={{margin: '5px 0 0 0', color: '#64748b'}}>Moderação e Relatórios de Impacto IA.</p>
            </div>
            <button className="btn-main" style={{ background: '#0f172a', width: 'auto', padding: '12px 20px' }} onClick={() => navigate('/admin')}>
              Acessar Dashboard <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* DASHBOARD ORGANIZADOR */}
        {user?.papel === 'ORGANIZADOR' && (
          <div className="admin-shortcut-card">
            <div style={{ textAlign: 'left' }}>
              <h3 style={{margin: 0, color: 'var(--purple)'}}>Olá, Organizador!</h3>
              <p style={{margin: '5px 0 0 0', color: '#64748b'}}>Gerencie seus eventos cadastrados.</p>
            </div>
            <button className="btn-main" style={{ width: 'auto', padding: '12px 20px' }} onClick={() => navigate('/org')}>
              <LayoutDashboard size={18} style={{marginRight: '8px'}}/> Meu Painel
            </button>
          </div>
        )}

        <h2 style={{ textAlign: 'left', margin: '40px 0 20px 0', color: '#1e293b' }}>Eventos em Destaque</h2>

        <div className="event-grid">
          {eventosFiltrados.length === 0 && <p style={{color: '#64748b'}}>Nenhum evento encontrado.</p>}
          {eventosFiltrados.map(ev => (
            <div key={ev._id} className="card-event">
              <div className="card-image-wrapper">
                <img src={ev.foto_url || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=500&q=80'} alt="" />
                <div className="badge-category">{ev.categoria_id?.nome}</div>
              </div>
              <div className="card-content">
                <h3 className="event-title">{ev.titulo}</h3>
                <div className="event-info-row"><Calendar size={14}/> {new Date(ev.data_inicio).toLocaleDateString('pt-BR')}</div>
                <div className="event-info-row"><MapPin size={14}/> {ev.localizacao?.nome_local}</div>
                <button className="btn-details" style={{marginTop: '15px'}} onClick={() => setEventoSelecionado(ev)}>Ver Detalhes</button>
              </div>
            </div>
          ))}
        </div>

        {/* --- BOTÃO DE SUGESTÃO PARA CIDADÃO NO FINAL DA PÁGINA --- */}
        {user?.papel === 'CIDADAO' && (
          <div style={{ marginTop: '60px', padding: '40px', background: 'white', borderRadius: '32px', textAlign: 'center', border: '2px dashed #e2e8f0' }}>
            <Sparkles size={40} color="var(--purple)" style={{ marginBottom: '15px' }} />
            <h3 style={{ color: '#1e293b', margin: '0 0 10px 0' }}>Sentiu falta de algum evento?</h3>
            <p style={{ color: '#64748b', marginBottom: '25px' }}>Sugira uma atividade cultural para sua cidade e ajude a prefeitura a melhorar a agenda local!</p>
            <button className="btn-main" style={{ width: 'auto', padding: '15px 40px' }} onClick={() => navigate('/org/anunciar')}>
               <PlusCircle size={20} style={{marginRight: '8px'}} /> Sugerir Novo Evento
            </button>
          </div>
        )}
      </main>

      <Footer />
      {eventoSelecionado && <EventModal evento={eventoSelecionado} onClose={() => setEventoSelecionado(null)} />}
    </div>
  );
}
````

## File: Projeto_PW1_BD2_Agenda_Cultural-main/frontend/src/pages/LoginPage.tsx
````typescript
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../styles/global.css';
import '../styles/login.css'

export function LoginPage() {

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const navigate = useNavigate();
  

  async function handleLogin(e: any) {
    e.preventDefault();
    try {
      const { data } = await api.post('/auth/login', { email, senha });
      
      // SALVA NO NAVEGADOR
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      navigate('/events'); // Vai para a galeria
    } catch (err: any) {
      alert(err.response?.data?.message || "E-mail ou senha incorretos");
    }
  }

  return (
    <div className="auth-container">
      <div className="card">
        <h1>Agenda Cultural</h1>
        <form onSubmit={handleLogin}>
          <input type="email" placeholder="E-mail" required onChange={e => setEmail(e.target.value)} />
          <input type="password" placeholder="Senha" required onChange={e => setSenha(e.target.value)} />
          <button className="btn-main" type="submit">Entrar</button>
        </form>
        <button className="btn-secondary" onClick={() => navigate('/events')}>Entrar como Anônimo</button>
        <button className='btn-resg' onClick={() => navigate('/register')}>Criar Conta</button>
      </div>
    </div>
  );
}
````

## File: Projeto_PW1_BD2_Agenda_Cultural-main/frontend/src/pages/OrganizerPage.tsx
````typescript
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { MapPicker } from '../components/MapPicker';
import { 
  Plus, Eye, EyeOff, Edit3, Calendar, 
  MapPin, Trash2, Loader2, Clock, Tag, Search 
} from 'lucide-react';
import '../styles/gallery.css';
import '../styles/forms.css'; // Reutilizando estilos de formulário

export function OrganizerPage() {
  const [eventos, setEventos] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [editando, setEditando] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const navigate = useNavigate();

  // Estados auxiliares para data/hora separados (para o input HTML)
  const [dataEdit, setDataEdit] = useState('');
  const [horaEdit, setHoraEdit] = useState('');
  const [coordsEdit, setCoordsEdit] = useState<{ lat: number, lng: number } | null>(null);

  useEffect(() => {
    api.get('/events/mine').then(res => setEventos(res.data));
    api.get('/categorias').then(res => setCategorias(res.data));
  }, []);

  // Quando clicar em editar, preparamos os estados auxiliares
  function abrirEdicao(ev: any) {
    const dataObj = new Date(ev.data_inicio);
    setEditando({ ...ev });
    setDataEdit(dataObj.toISOString().split('T')[0]);
    setHoraEdit(dataObj.toTimeString().substring(0, 5));
    setCoordsEdit({
      lat: ev.localizacao.coordinates[1],
      lng: ev.localizacao.coordinates[0]
    });
  }

  async function handleSalvarEdicao(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        titulo: editando.titulo,
        descricao: editando.descricao,
        valor_ingresso: editando.valor_ingresso,
        data_inicio: `${dataEdit}T${horaEdit}`, // Remonta a data/hora
        categoria_id: editando.categoria_id._id || editando.categoria_id,
        nome_local: editando.localizacao.nome_local,
        latitude: coordsEdit?.lat,
        longitude: coordsEdit?.lng
      };

      const res = await api.patch(`/events/${editando._id}`, payload);
      setEventos(prev => prev.map(ev => ev._id === editando._id ? res.data : ev));
      setEditando(null);
      alert("Evento atualizado com sucesso! ✨");
    } catch (err: any) {
      alert("Erro ao atualizar. Verifique os campos.");
    } finally {
      setLoading(false);
    }
  }

  async function buscarNoMapa() {
    if (!editando.localizacao.nome_local) return;
    setLoadingSearch(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(editando.localizacao.nome_local)}`);
      const data = await res.json();
      if (data && data.length > 0) {
        setCoordsEdit({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) });
      }
    } finally {
      setLoadingSearch(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Excluir permanentemente este evento?")) return;
    try {
      await api.delete(`/events/${id}`);
      setEventos(prev => prev.filter(ev => ev._id !== id));
      setEditando(null);
    } catch (err) { alert("Erro ao excluir."); }
  }

  async function handleToggleVisibility(id: string) {
    try {
      const response = await api.patch(`/events/${id}/toggle`);
      setEventos(prev => prev.map(ev => ev._id === id ? { ...ev, status: response.data.status } : ev));
    } catch (err) { alert("Erro ao mudar status"); }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header busca="" setBusca={() => {}} />

      <main className="gallery-container">
        <div style={{ background: 'white', padding: '30px', borderRadius: '24px', marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #f1f5f9' }}>
          <div style={{textAlign: 'left'}}>
            <h2 style={{ margin: 0, color: 'var(--purple)' }}>Meus Eventos</h2>
            <p style={{ margin: 0, color: '#64748b' }}>Gerencie suas publicações.</p>
          </div>
          <button className="btn-main" style={{ width: 'auto', padding: '15px 25px' }} onClick={() => navigate('/org/anunciar')}>
            <Plus size={20} /> Anunciar Novo
          </button>
        </div>

        <div className="event-grid">
          {eventos.map(ev => (
            <div key={ev._id} className="card-event" style={{ opacity: ev.status === 'APROVADO' ? 1 : 0.6 }}>
              <div className="card-image-wrapper">
                <img src={ev.foto_url || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=500&q=80'} alt="" />
                <div style={{ position: 'absolute', top: 10, left: 10, background: ev.status === 'APROVADO' ? '#22c55e' : '#ef4444', color: 'white', padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold' }}>
                  {ev.status === 'APROVADO' ? 'Visível' : 'Oculto'}
                </div>
              </div>
              <div className="card-content">
                <h3 className="event-title">{ev.titulo}</h3>
                <div className="event-info-row"><Calendar size={14} /> {new Date(ev.data_inicio).toLocaleDateString('pt-BR')}</div>
                <button onClick={() => abrirEdicao(ev)} className="btn-details" style={{marginTop: '15px'}}>Editar Evento</button>
              </div>
            </div>
          ))}
        </div>

        {/* MODAL DE EDIÇÃO COMPLETO */}
        {editando && (
          <div className="modal-overlay" onClick={() => setEditando(null)}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{padding: '30px', maxWidth: '700px'}}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: 0, fontSize: '24px' }}>Editar Evento</h2>
                <button onClick={() => handleDelete(editando._id)} className="btn-icon reject"><Trash2 size={20} /></button>
              </div>

              <form onSubmit={handleSalvarEdicao} className="edit-form-grid">
                <div className="form-group">
                  <label>TÍTULO</label>
                  <input type="text" required minLength={3} value={editando.titulo} onChange={e => setEditando({...editando, titulo: e.target.value})} />
                </div>

                <div className="form-group">
                  <label>DESCRIÇÃO</label>
                  <textarea required minLength={10} value={editando.descricao} onChange={e => setEditando({...editando, descricao: e.target.value})} />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label><Calendar size={14}/> DATA</label>
                    <input type="date" required value={dataEdit} onChange={e => setDataEdit(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label><Clock size={14}/> HORA</label>
                    <input type="time" required value={horaEdit} onChange={e => setHoraEdit(e.target.value)} />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label><Tag size={14}/> CATEGORIA</label>
                    <select value={editando.categoria_id._id || editando.categoria_id} onChange={e => setEditando({...editando, categoria_id: e.target.value})}>
                      {categorias.map(c => <option key={c._id} value={c._id}>{c.nome}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>VALOR (R$)</label>
                    <input type="number" step="0.01" value={editando.valor_ingresso} onChange={e => setEditando({...editando, valor_ingresso: e.target.value})} />
                  </div>
                </div>

                <div className="form-group">
                  <label>LOCALIZAÇÃO</label>
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                    <input 
                      type="text" 
                      value={editando.localizacao.nome_local} 
                      onChange={e => setEditando({...editando, localizacao: {...editando.localizacao, nome_local: e.target.value}})} 
                    />
                    <button type="button" onClick={buscarNoMapa} className="btn-purple" style={{width: '50px', display: 'flex', justifyContent: 'center'}}>
                      {loadingSearch ? <Loader2 className="spinner" size={18}/> : <Search size={18}/>}
                    </button>
                  </div>
                  <div style={{height: '200px', borderRadius: '16px', overflow: 'hidden', border: '1px solid #ddd'}}>
                    <MapPicker targetCoords={coordsEdit} onLocationSelect={(lat, lng) => setCoordsEdit({lat, lng})} />
                  </div>
                </div>

                <div style={{display: 'flex', gap: '10px', marginTop: '20px'}}>
                  <button type="submit" className="btn-main" disabled={loading} style={{flex: 2}}>
                    {loading ? <Loader2 className="spinner" /> : "Salvar Alterações"}
                  </button>
                  <button type="button" className="btn-secondary" style={{flex: 1}} onClick={() => setEditando(null)}>Cancelar</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
````

## File: Projeto_PW1_BD2_Agenda_Cultural-main/frontend/src/pages/ProfilePage.tsx
````typescript
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { User, Mail, Shield, Lock, Save, ArrowLeft, Calendar, MapPin } from 'lucide-react';
import '../styles/global.css';
import '../styles/gallery.css';

export function ProfilePage() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  
  const [minhasInscricoes, setMinhasInscricoes] = useState<any[]>([]);
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  // Carrega as inscrições ao abrir a página
  useEffect(() => {
    api.get('/subscriptions/me')
      .then(res => setMinhasInscricoes(res.data))
      .catch(() => console.error("Erro ao carregar inscrições"));
  }, []);

  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault();
    if (novaSenha !== confirmarSenha) return alert("As senhas não coincidem!");

    try {
      await api.patch('/auth/update-password', { senhaAtual, novaSenha });
      alert("Senha atualizada com sucesso! ✅");
      setSenhaAtual(''); setNovaSenha(''); setConfirmarSenha('');
    } catch (err: any) {
      alert(err.response?.data?.message || "Erro ao atualizar senha.");
    }
  }

  if (!user) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header busca="" setBusca={() => {}} />

      <main className="container" style={{ flex: 1, padding: '40px 20px' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'var(--gray)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '20px' }}>
          <ArrowLeft size={18} /> Voltar
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' }}>
          
          {/* LADO ESQUERDO: PERFIL E SENHA */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            <div className="card">
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div style={{ background: '#fdf8f9', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px auto', border: '2px solid var(--purple)' }}>
                  <User size={40} color="var(--purple)" />
                </div>
                <h2 style={{ margin: 0, fontSize: '22px' }}>{user.nome}</h2>
                <span style={{ fontSize: '12px', color: 'var(--gray)' }}>{user.papel}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', background: '#f8fafc', borderRadius: '12px', marginBottom: '10px' }}>
                <Mail size={16} color="#64748b" />
                <span style={{ fontSize: '13px', color: 'var(--text)' }}>{user.email}</span>
              </div>
            </div>

            <div className="card">
              <h3 style={{ fontSize: '16px', color: 'var(--purple)', marginBottom: '15px' }}><Lock size={18} /> Alterar Senha</h3>
              <form onSubmit={handleUpdatePassword}>
                <input type="password" placeholder="Senha Atual" value={senhaAtual} onChange={e => setSenhaAtual(e.target.value)} required />
                <input type="password" placeholder="Nova Senha" value={novaSenha} onChange={e => setNovaSenha(e.target.value)} required />
                <input type="password" placeholder="Confirmar Nova Senha" value={confirmarSenha} onChange={e => setConfirmarSenha(e.target.value)} required />
                <button className="btn-main" type="submit" style={{width: '100%', borderRadius: '12px'}}>Salvar Senha</button>
              </form>
            </div>
          </div>

          {/* LADO DIREITO: MINHA AGENDA (INSCRIÇÕES) */}
          <div style={{ textAlign: 'left' }}>
            <h2 style={{ textAlign: 'left', fontSize: '24px', color: 'var(--purple)', marginBottom: '10px', marginTop: '0' }}>Minha Agenda</h2>
            
            {minhasInscricoes.length === 0 ? (
              
              <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
                <p style={{ color: 'var(--gray)' }}>Você ainda não confirmou presença em nenhum evento.</p>
                <button className="btn-secondary" onClick={() => navigate('/events')}>Explorar Eventos</button>
              </div>
            ) : (
              <div className="event-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                {minhasInscricoes.map(ev => (
                  <div key={ev._id} className="card-event">
                    <div className="card-image-wrapper">
                      <img src={ev.foto_url || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=500&q=80'} alt="" />
                      <div className="badge-category">{ev.categoria_id?.nome}</div>
                    </div>
                    <div className="card-content">
                      <h3 className="event-title" style={{fontSize: '16px'}}>{ev.titulo}</h3>
                      <div className="event-info-row"><Calendar size={14}/> {new Date(ev.data_inicio).toLocaleDateString('pt-BR')}</div>
                      <div className="event-info-row"><MapPin size={14}/> {ev.localizacao?.nome_local}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
````

## File: Projeto_PW1_BD2_Agenda_Cultural-main/frontend/src/pages/RegisterPage.tsx
````typescript
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../styles/global.css';
import '../styles/login.css'

export function RegisterPage() {
  const [papel, setPapel] = useState('CIDADAO');
  const [formData, setFormData] = useState({ nome: '', email: '', senha: '', cnpj: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleRegister(e: any) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/register', { ...formData, papel });
      alert("Conta criada com sucesso! 🎉");
      navigate('/');
    } catch (err: any) {
      // TRATAMENTO PARA ERROS DE VALIDAÇÃO (ZOD)
      if (err.response?.status === 400 && err.response.data.errors) {
        const msg = err.response.data.errors.join('\n');
        alert("Erro no cadastro:\n" + msg);
      } else {
        alert(err.response?.data?.message || "Erro ao criar conta");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <div className="card">
        <h2>Criar Conta</h2>
        <div className="role-selector">
          <button className={`role-btn ${papel === 'CIDADAO' ? 'active' : ''}`} onClick={() => setPapel('CIDADAO')}>Cidadão</button>
          <button className={`role-btn ${papel === 'ORGANIZADOR' ? 'active' : ''}`} onClick={() => setPapel('ORGANIZADOR')}>Organizador</button>
        </div>

        <form onSubmit={handleRegister}>
          <input 
            type="text" 
            placeholder="Nome Completo (mín. 3 letras)" 
            required 
            minLength={3} // Bloqueio no navegador
            onChange={e => setFormData({...formData, nome: e.target.value})} 
          />
          
          <input 
            type="email" 
            placeholder="E-mail" 
            required 
            onChange={e => setFormData({...formData, email: e.target.value})} 
          />

          {papel === 'ORGANIZADOR' && (
            <div className="form-group" style={{ width: '100%' }}>
              <input 
                type="text" 
                placeholder="CNPJ (Somente 14 números)" 
                required={papel === 'ORGANIZADOR'} 
                minLength={14}
                maxLength={14}
                pattern="\d{14}" // Só permite números
                title="O CNPJ deve conter exatamente 14 números"
                value={formData.cnpj}
                onChange={e => {
                  // Remove tudo que não for número enquanto o usuário digita
                  const apenasNumeros = e.target.value.replace(/\D/g, '');
                  setFormData({...formData, cnpj: apenasNumeros});
                }} 
              />
            </div>
          )}

          <input 
            type="password" 
            placeholder="Senha (mín. 6 caracteres)" 
            required 
            minLength={6} // Bloqueio no navegador
            onChange={e => setFormData({...formData, senha: e.target.value})} 
          />

          <button className="btn-main" type="submit" disabled={loading}>
            {loading ? "Processando..." : "Finalizar Registro"}
          </button>
          
          <button type="button" className='btn-resg' onClick={() => navigate('/')}>
            Já tem uma conta?
          </button>
        </form>
      </div>
    </div>
  );
}
````

## File: Projeto_PW1_BD2_Agenda_Cultural-main/frontend/src/services/api.ts
````typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3333/api',
});

// Interceptor para garantir que o TOKEN vá em todas as chamadas
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // Verifique se o nome é 'token' mesmo
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
````

## File: Projeto_PW1_BD2_Agenda_Cultural-main/frontend/src/styles/admin.css
````css
/* Layout Principal */
.admin-container {
  max-width: 100%;
  margin: 40px ;
  padding: 20px;

  min-height: 70vh;
}

.admin-grid {
  display: grid;
  width: 100%;
  grid-template-columns: 280px 1fr;
  gap: 30px;
  align-items: start;
}

/* Sidebar - Corrigindo a invisibilidade */
.admin-sidebar {
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: #fff;
  padding: 20px;
  border-radius: 24px;
  border: 1px solid #f1f5f9;
}

.sidebar-item {
  padding: 15px 20px;
  border-radius: 16px;
  cursor: pointer;
  font-weight: 700;
  color: #64748b !important; /* Força a cor cinza */
  transition: 0.3s;
  display: flex;
  align-items: center;
  gap: 12px;
  text-align: left;
}

.sidebar-item:hover {
  background: #f8fafc;
  color: var(--purple) !important;
}

.sidebar-item.active {
  background: var(--purple);
  color: white !important; /* Texto branco apenas quando ativo */
}

/* Área de Conteúdo */
.admin-content-area {
  min-width: 0; /* Evita que o grid quebre com conteúdos largos */
}

.moderation-card {
  background: white;
  border-radius: 32px;
  padding: 40px;
  border: 1px solid #f1f5f9;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

/* Lista de Sugestões */
.admin-suggestion-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #f1f5f9;
}

.suggestion-info h4 {
  margin: 0;
  color: #1e293b;
  font-size: 18px;
  text-align: left;
}

/* Stats Cards (Relatório) */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.stat-card {
  background: #f8fafc;
  padding: 20px;
  border-radius: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 1px solid #e2e8f0;
}

.stat-card h3 {
  margin: 10px 0 0 0;
  font-size: 24px;
  color: #1e293b;
}

.stat-card small {
  color: #94a3b8;
  font-weight: 800;
  font-size: 10px;
}

.empty-state {
  padding: 60px 0;
  color: #94a3b8;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.suggestion-actions {
  display: flex;
  justify-content: space-between;
}
````

## File: Projeto_PW1_BD2_Agenda_Cultural-main/frontend/src/styles/forms.css
````css
.form-container {
  max-width: 800px;
  margin: 10px auto;
  background: white;
  padding: 40px;
  border-radius: 32px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.05);
}

.form-group {
  width: 90%;
  margin-bottom: 10px;
}

.form-group label { 
  font-weight: 700;
  margin-bottom: 8px;
  color: var(--text);
  font-size: 14px;
}

.form-row {
  display: grid;
  width: 90%;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

textarea {
  width: 100%;
  margin-top: 10px;
  padding: 15px;
  border-radius: 16px;
  border: 1px solid #eee;
  background: #f8fafc;
  min-height: 120px;
  font-family: inherit;
  resize: vertical;
  color: var(--text);
}

select, input{
  color: var(--text);
  margin-top: 10px;
  width: 100%;
  padding: 15px;
  border-radius: 16px;
  border: 1px solid #eee;
  background: #f8fafc;
  cursor: pointer;
}

.map-picker-container {
  height: 300px;
  width: 100%;
  border-radius: 24px;
  overflow: hidden;
  margin-top: 10px;
  border: 2px solid #f1f5f9;
}

.file-input-wrapper {
  background: #f8fafc;
  border: 2px dashed #e2e8f0;
  padding: 20px;
  border-radius: 16px;
  text-align: center;
}

.file-input-wrapper:hover {
  border-color: var(--purple);
  background: #fdf8f9;
}

.input-link {
  border: 2px solid #f1f5f9;
  background: #fff;
  transition: 0.3s;
}

.input-link:focus {
  border-color: var(--purple);
  box-shadow: 0 0 0 4px rgba(107, 33, 168, 0.1);
}
````

## File: Projeto_PW1_BD2_Agenda_Cultural-main/frontend/src/styles/gallery.css
````css
.gallery-container {
  width: 100%;
  min-height: 100vh;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0px;
}


.categories-bar {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding: 10px 0 30px 0;
}

.category-pill {
  background: white;
  border: 1px solid #e2e8f0;
  padding: 8px 20px;
  border-radius: 50px;
  color: #64748b;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
}

.category-pill.active {
  background: #6b21a8;
  color: white;
  border-color: #6b21a8;
}

/* Card Visual */
.event-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 25px;
}

.card-event {
  background: white;
  border-radius: 24px;
  overflow: hidden;
  border: 1px solid #f1f5f9;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
  transition: 0.3s;
}

.card-event:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
}

.card-image-wrapper {
  height: 180px;
  position: relative;
}

.card-image-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.badge-category {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(255, 255, 255, 0.9);
  padding: 4px 12px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 800;
  color: #6b21a8;
}

.card-content {
  padding: 20px;
  text-align: left;
}

.event-title {
  color: #1e293b !important; /* Força cor escura */
  font-size: 18px;
  margin: 0 0 12px 0;
  font-weight: 700;
}

.event-info-row {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #64748b;
  font-size: 13px;
  margin-bottom: 6px;
}

.card-footer {
  margin-top: 20px;
}

.btn-details {
  width: 100%;
  background: #6b21a8;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 14px;
  font-weight: 700;
  cursor: pointer;
}

/* Atalho para o painel */
.admin-shortcut-card {
  width: 50%;
  background: white;
  border: 2px solid #6b21a8;
  padding: 20px 30px;
  border-radius: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
}


.admin-shortcut-card h3 { color: #6b21a8; margin: 0; }
.admin-shortcut-card p { color: #64748b; margin: 5px 0 0 0; font-size: 14px; }
````

## File: Projeto_PW1_BD2_Agenda_Cultural-main/frontend/src/styles/global.css
````css
:root {
  --purple: #6b21a8;
  --bg: #fdf8f9;
  --white: #ffffff;
  --text: #05051f;
  --gray: #94a3b8;
  --radius: 32px;
}

/* 1. Garante que o HTML e o Body ocupem a tela toda */
html, body, #root {
  margin: 0;
  padding: 0;
  width: 100%;
  min-height: 100vh;
  background-color: var(--bg); /* O fundo rosado agora é global */
  display: flex;
  flex-direction: column;
}

/* Container para as telas de Login/Registro */
.auth-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

/* Container da Galeria - Centraliza o conteúdo no meio da página */
.gallery-container {
  width: 100vw;
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  box-sizing: border-box;
}

/* 3. Garante que o card tenha um tamanho bom mas não suma */
.card {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: var(--white);
  border-radius: var(--radius);
  box-shadow: 0 10px 40px rgba(0,0,0,0.05);
  padding: 40px;
  width: 100%;
  max-width: 500px; /* Impede que o card fique largo demais em telas grandes */
  box-sizing: border-box;
}

h1, h2 { color: var(--purple); text-align: center; margin-bottom: 20px; font-size: 40px; }
p.subtitle { text-align: center; color: var(--gray); margin-bottom: 30px; font-size: 14px; }

.input-group { margin-bottom: 15px; }

input {
  color: #05051f;
  width: 100%;
  padding: 14px 20px;
  border-radius: 16px;
  border: 1px solid #ffffff;
  background: #f8fafc;
  box-sizing: border-box;
  font-size: 16px;
  transition: 0.3s;
  margin-top: 10px;
}

input:focus { outline: none; border-color: var(--purple); background: #fff; }

.btn-main {
  background: var(--purple);
  color: rgb(255, 255, 255);
  border: none;
  padding: 16px;
  border-radius: var(--radius);
  font-weight: bold;
  font-size: 16px;
  width: 80%;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(107, 33, 168, 0.3);
  margin-top: 15px;
}

.btn-main:hover {
  background-color: #480d78;
}

.btn-resg {
  background: white;
  color: var(--purple);
  border: none;
  padding: 16px;
  font-weight: bold;
  font-size: 16px;
  width: 100%;
  cursor: pointer;
  margin-top: 10px;
}

.btn-secondary {
  background: #f1f5f9;
  color: #64748b;
  border: none;
  padding: 14px;
  border-radius: var(--radius);
  width: 80%;
  cursor: pointer;
  margin-top: 10px;
  font-weight: 600;
}

.btn-secondary:hover {
  background-color: #e6eaed;
}

.role-selector {
  display: flex;
  background: #f1f5f9;
  padding: 5px;
  border-radius: 20px;
  margin-bottom: 25px;
}

.role-btn {
  flex: 1;
  border: none;
  padding: 10px;
  border-radius: 16px;
  cursor: pointer;
  font-weight: bold;
  color: #94a3b8;
  background: transparent;
}

.role-btn.active {
  background: white;
  color: var(--purple);
  box-shadow: 0 4px 10px rgba(0,0,0,0.05);
}


/* Header */
.main-header {
  background: white;
  padding: 15px 5%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: 0 4px 20px rgba(0,0,0,0.03);
  gap: 20px;
}

.brand-section h1 {
  margin: 0;
  font-size: 22px;
  color: var(--purple);
}

.location-tag {
  display: flex;
  align-items: center;
  gap: 5px;
  color: var(--gray);
  font-size: 13px;
}

.search-bar-header {
  flex: 1;
  max-width: 500px;
  position: relative;
}

.search-bar-header input {
  margin: 0;
  padding: 12px 20px 12px 45px;
  border-radius: 50px;
  background: #f3f4f6;
}

.search-icon {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
}

/* Footer */
.main-footer {
  background: white;
  padding: 10px 5%;
  margin-top: 20px;
  border-top: 1px solid #f1f5f9;
  text-align: center;
}

.footer-content p {
  color: var(--gray);
  font-size: 14px;
}
````

## File: Projeto_PW1_BD2_Agenda_Cultural-main/frontend/src/styles/login.css
````css
form {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}
````

## File: Projeto_PW1_BD2_Agenda_Cultural-main/frontend/src/styles/modal.css
````css
/* Overlay com desfoque no fundo */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
}

/* Container do Modal */
.modal-content {
  background: white;
  width: 100%;
  max-width: 550px;
  max-height: 90vh;
  border-radius: 12.5px;
  overflow-y: auto; /* Permite rolar o conteúdo */
  position: relative;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

/* --- ESTILIZAÇÃO DA BARRA DE ROLAGEM (Scrollbar) --- */
.modal-content::-webkit-scrollbar {
  width: 6px;
}

.modal-content::-webkit-scrollbar-track {
  background: transparent;
}

.modal-content::-webkit-scrollbar-thumb {
  background: #e2e8f0; /* Cor da barrinha */
  border-radius: 10px;
}

.modal-content::-webkit-scrollbar-thumb:hover {
  background: #cbd5e1;
}

/* Botão de Fechar discreto sobre a foto */
.modal-close-btn {
  position: absolute;
  top: 15px;
  right: 15px;
  background: rgba(252, 2, 2, 0.3); /* Fundo escuro transparente */
  color: white;
  border: none;
  width: 35px;
  height: 35px;
  border-radius: 50%;
  cursor: pointer;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: 0.2s;
}

.modal-close-btn:hover {
  background: rgba(0, 0, 0, 0.6);
  transform: scale(1.1);
}

/* Imagem de topo */
.modal-header-img {
  width: 100%;
  height: 250px;
  object-fit: cover;
  display: block;
}

.modal-info-section {
  padding: 24px;
}

/* Título e Descrição */
.modal-info-section h2 {
  text-align: left;
  margin: 0 0 8px 0;
  font-size: 26px;
  color: #1e293b;
}

.modal-description {
  color: #64748b;
  font-size: 15px;
  line-height: 1.6;
  margin-bottom: 20px;
}

/* Grid de Informações */
.details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 20px;
}

.detail-box {
  background: #f8fafc;
  padding: 12px 16px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.detail-box small {
  display: block;
  color: #94a3b8;
  font-weight: 700;
  font-size: 10px;
  letter-spacing: 0.5px;
}

.detail-box p {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #334155;
}

/* Seção do Mapa */
.modal-map-container {
  height: 220px; /* Mapa maior e mais importante */
  width: 100%;
  border-radius: 20px;
  overflow: hidden;
  margin: 15px 0;
  border: 1px solid #f1f5f9;
}

/* Botão de Inscrição */
.interest-btn {
  background: #6b21a8;
  color: white;
  border: none;
  padding: 16px;
  border-radius: 18px;
  font-weight: 700;
  font-size: 16px;
  width: 100%;
  cursor: pointer;
  transition: 0.3s;
  box-shadow: 0 10px 15px -3px rgba(107, 33, 168, 0.2);
}

.interest-btn:hover {
  background: #581c87;
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(107, 33, 168, 0.4);
}
````

## File: Projeto_PW1_BD2_Agenda_Cultural-main/frontend/src/types/index.ts
````typescript
export type Role = 'ANONIMO' | 'CIDADAO' | 'ORGANIZADOR' | 'GESTOR' | 'ADMIN';

export interface User {
  id?: string;
  nome: string;
  email: string;
  papel: Role;
  token?: string;
}

export interface Evento {
  id: string;
  titulo: string;
  descricao: string;
  data: string;
  local: string;
  latitude: number;
  longitude: number;
  foto_url?: string;
  categoria: string;
  valor: number;
}
````

## File: Projeto_PW1_BD2_Agenda_Cultural-main/frontend/src/App.css
````css
:root {
  --brand-purple: #6b21a8;
  --bg-light: #fdf8f9;
  --text-dark: #05051f;
  --radius: 32px;
}

body {
  margin: 0;
  font-family: 'Inter', sans-serif;
  background-color: var(--bg-light);
  color: var(--text-dark);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

/* Estilo para Cards e Containers Brancos */
.card-base {
  background: white;
  border-radius: var(--radius);
  box-shadow: 0 10px 25px rgba(0,0,0,0.05);
  padding: 30px;
}

/* Inputs arredondados */
input {
  width: 100%;
  padding: 15px;
  margin: 10px 0;
  border-radius: 16px;
  border: 1px solid #eee;
  background: #f9f9f9;
  box-sizing: border-box;
}

/* Botão Roxo Arredondado */
.btn-primary {
  background: var(--brand-purple);
  color: white;
  padding: 15px 30px;
  border: none;
  border-radius: var(--radius);
  font-weight: bold;
  cursor: pointer;
  width: 100%;
  transition: opacity 0.2s;
}

.btn-primary:hover { opacity: 0.9; }

.btn-ghost {
  background: #eee;
  color: #666;
  border-radius: var(--radius);
  padding: 15px;
  width: 100%;
  border: none;
  cursor: pointer;
}
````

## File: Projeto_PW1_BD2_Agenda_Cultural-main/frontend/src/App.tsx
````typescript
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GalleryPage } from './pages/GalleryPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage'
import { CreateEventPage } from './pages/CreateEventPage';
import './styles/global.css';
import { OrganizerPage } from './pages/OrganizerPage';
import { AdminPage } from './pages/AdminPage';
import { ProfilePage } from './pages/ProfilePage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/register" element={<RegisterPage/>} />
        <Route path="/" element={<LoginPage />} />
        <Route path="/events" element={<GalleryPage />} />
        <Route path="/org/anunciar" element={<CreateEventPage />} />
        <Route path="/org" element={<OrganizerPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path='/perfil' element={<ProfilePage />} />
      </Routes>
    </BrowserRouter>
  );
}
````

## File: Projeto_PW1_BD2_Agenda_Cultural-main/frontend/src/index.css
````css
:root {
  font-family: system-ui, Avenir, Helvetica, Arial, sans-serif;
  line-height: 1.5;
  font-weight: 400;

  color-scheme: light dark;
  color: rgba(255, 255, 255, 0.87);
  background-color: #242424;

  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

a {
  font-weight: 500;
  color: #646cff;
  text-decoration: inherit;
}
a:hover {
  color: #535bf2;
}

body {
  margin: 0;
  display: flex;
  place-items: center;
  min-width: 320px;
  min-height: 100vh;
}

h1 {
  font-size: 3.2em;
  line-height: 1.1;
}

button {
  border-radius: 8px;
  border: 1px solid transparent;
  padding: 0.6em 1.2em;
  font-size: 1em;
  font-weight: 500;
  font-family: inherit;
  background-color: #1a1a1a;
  cursor: pointer;
  transition: border-color 0.25s;
}
button:hover {
  border-color: #646cff;
}
button:focus,
button:focus-visible {
  outline: 4px auto -webkit-focus-ring-color;
}

@media (prefers-color-scheme: light) {
  :root {
    color: #213547;
    background-color: #ffffff;
  }
  a:hover {
    color: #747bff;
  }
  button {
    background-color: #f9f9f9;
  }
}
````

## File: Projeto_PW1_BD2_Agenda_Cultural-main/frontend/src/main.tsx
````typescript
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
````

## File: Projeto_PW1_BD2_Agenda_Cultural-main/frontend/.gitignore
````
# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

node_modules
dist
dist-ssr
*.local

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?
````

## File: Projeto_PW1_BD2_Agenda_Cultural-main/frontend/eslint.config.js
````javascript
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
  },
])
````

## File: Projeto_PW1_BD2_Agenda_Cultural-main/frontend/index.html
````html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>frontend</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
````

## File: Projeto_PW1_BD2_Agenda_Cultural-main/frontend/package.json
````json
{
  "name": "frontend",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": {
    "axios": "^1.13.4",
    "leaflet": "^1.9.4",
    "lucide-react": "^0.563.0",
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "react-leaflet": "^5.0.0",
    "react-router-dom": "^7.13.0"
  },
  "devDependencies": {
    "@eslint/js": "^9.39.1",
    "@types/leaflet": "^1.9.21",
    "@types/node": "^24.10.1",
    "@types/react": "^19.2.5",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^5.1.1",
    "autoprefixer": "^10.4.24",
    "eslint": "^9.39.1",
    "eslint-plugin-react-hooks": "^7.0.1",
    "eslint-plugin-react-refresh": "^0.4.24",
    "globals": "^16.5.0",
    "postcss": "^8.5.6",
    "tailwindcss": "^4.1.18",
    "typescript": "~5.9.3",
    "typescript-eslint": "^8.46.4",
    "vite": "^7.2.4"
  }
}
````

## File: Projeto_PW1_BD2_Agenda_Cultural-main/frontend/README.md
````markdown
# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
````

## File: Projeto_PW1_BD2_Agenda_Cultural-main/frontend/tsconfig.app.json
````json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "types": ["vite/client"],
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true
  },
  "include": ["src"]
}
````

## File: Projeto_PW1_BD2_Agenda_Cultural-main/frontend/tsconfig.json
````json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
````

## File: Projeto_PW1_BD2_Agenda_Cultural-main/frontend/tsconfig.node.json
````json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.node.tsbuildinfo",
    "target": "ES2023",
    "lib": ["ES2023"],
    "module": "ESNext",
    "types": ["node"],
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true
  },
  "include": ["vite.config.ts"]
}
````

## File: Projeto_PW1_BD2_Agenda_Cultural-main/frontend/vite.config.ts
````typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
})
````

## File: Projeto_PW1_BD2_Agenda_Cultural-main/.gitattributes
````
# Auto detect text files and perform LF normalization
* text=auto
````

## File: Projeto_PW1_BD2_Agenda_Cultural-main/LICENSE
````
MIT License

Copyright (c) 2026 Francisco Erlyson Pamplona

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
````

## File: Projeto_PW1_BD2_Agenda_Cultural-main/README.md
````markdown
# 🎭 Agenda Cultural Local

Este projeto é uma aplicação web completa para gestão de eventos culturais, desenvolvida para as disciplinas de **Programação Web 1** e **Banco de Dados 2** (ADS - IFPB). A plataforma permite que cidadãos sugiram eventos, organizadores publiquem atividades e gestores públicos moderem o conteúdo e visualizem relatórios estatísticos.

## 🚀 Tecnologias Principais

- **Frontend:** React + TypeScript, Vite, Leaflet (Mapas), Lucide React.
- **Backend:** Node.js + TypeScript, Express, Zod (Validação), Multer (Uploads).
- **Bancos de Dados (Persistência Poliglota):**
  - **MongoDB Atlas:** Banco primário para dados transacionais e geoespaciais (GeoJSON).
  - **Neo4j AuraDB:** Banco secundário para modelagem de grafos e relacionamentos.
- **DevOps:** Docker & Docker Compose.

---

## 📋 Pré-requisitos

Antes de começar, você precisará ter instalado:
- [Git](https://git-scm.com/)
- [Node.js v22+](https://nodejs.org/)
- [Docker](https://www.docker.com/) (opcional, mas recomendado)

### Contas na Nuvem necessárias:
1. **MongoDB Atlas:** Crie um cluster gratuito e obtenha a string de conexão.
2. **Neo4j AuraDB:** Crie uma instância gratuita "Blank Sandbox" e guarde a URI, usuário e senha.

---

## 🛠️ Configuração do Ambiente

### 1. Clonar o Repositório
```bash
git clone https://github.com/DreamEater360/Projeto_PW1_BD2_Agenda_Cultural.git
```

### 2. Variáveis de Ambiente (.env)

Crie um arquivo `.env` dentro da pasta `backend/` seguindo o modelo abaixo:

```env
PORT=3333
JWT_SECRET=sua_chave_secreta_aqui

# MONGODB ATLAS
MONGO_URI=mongodb+srv://USUARIO:SENHA@cluster.mongodb.net/agenda_cultural?retryWrites=true&w=majority

# NEO4J AURADB
NEO4J_URI=neo4j+s://xxxxxxxx.databases.neo4j.io
NEO4J_USER=neo4j
NEO4J_PASSWORD=sua_senha_do_neo4j
```

---

## 🐳 Rodando com Docker (Recomendado)

O Docker subirá o backend automaticamente. O frontend deve ser iniciado manualmente para facilitar o desenvolvimento.

1. Dentro do diretorio backend, suba o container do backend:
```bash
docker-compose up -d
```

2. Entre na pasta do backend e inicie o servidor:
```bash
cd backend
npm install
npm run dev
```

3. Entre na pasta do frontend e inicie a interface:
```bash
cd frontend
npm install
npm run dev
```

O sistema estará disponível em:
- **Frontend:** `http://localhost:5173`
- **Backend (API):** `http://localhost:3333`

---

## 🔑 Perfis de Acesso para Teste

Para testar as diferentes funcionalidades, crie contas com os seguintes papéis:

1. **Cidadão (`CIDADAO`):**
   - Pode visualizar eventos no mapa.
   - Pode **sugerir** novos eventos (ficam como PENDENTE).
   - Pode confirmar presença em eventos aprovados.

2. **Organizador (`ORGANIZADOR`):**
   - Requer CNPJ de 14 dígitos no cadastro.
   - Pode publicar eventos diretamente.
   - Possui painel exclusivo para **Editar, Ocultar ou Excluir** seus próprios eventos.

3. **Administrador/Gestor (`ADMINISTRADOR`):**
   - Acesso ao **Painel de Moderação**: Aprova ou Rejeita sugestões de cidadãos.
   - Acesso ao **Painel de Relatórios**: Visualiza estatísticas reais de usuários, eventos e categorias.

---

## 📍 Funcionalidades Geoespaciais

- O sistema utiliza a API **Nominatim** para buscar coordenadas a partir do nome do local digitado.
- Os dados são salvos no MongoDB usando o formato **GeoJSON Point**, permitindo buscas por proximidade no futuro.
- A visualização é feita via **Leaflet**, com marcadores interativos e seletor de mapa na criação de eventos.

---

## 🛡️ Segurança e Validação

- **Blindagem de Crash:** O servidor possui um middleware global de tratamento de erros que captura falhas assíncronas e de validação sem derrubar o processo.
- **Validação com Zod:** Todos os inputs (Título, Descrição, CNPJ, Coordenadas) são validados no servidor.
- **Integridade Poliglota:** Operações de cadastro e exclusão são sincronizadas entre MongoDB e Neo4j. Se uma falha crítica ocorrer no banco primário, a operação é revertida.

---
**ADS IFPB - Campus Cajazeiras**  
*Desenvolvido por: Francisco Erlyson Pamplona, Samuel Videres e Anderson Lorran.*
````
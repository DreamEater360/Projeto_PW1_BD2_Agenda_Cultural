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
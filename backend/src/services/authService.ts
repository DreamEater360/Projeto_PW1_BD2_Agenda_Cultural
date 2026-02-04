import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { UsuarioModel } from '../models/Usuario';
import { neo4jDriver } from '../config/neo4j';
import { BadRequestError, UnauthorizedError, NotFoundError, ApiError } from '../errors/apiError';

const registerSchema = z.object({
  nome: z.string().min(3),
  email: z.string().email(),
  senha: z.string().min(6),
  papel: z.string(),
  cnpj: z.string().optional(),
  razao_social: z.string().optional(),
});

export const register = async (data: unknown) => {
  const validatedData = registerSchema.parse(data);

  const exists = await UsuarioModel.findOne({ email: validatedData.email });
  if (exists) throw new BadRequestError('E-mail já cadastrado.');

  const senha_hash = await bcrypt.hash(validatedData.senha, 10);
  const { senha, ...rest } = validatedData;

  // 1. Persistência no MongoDB
  const usuario = await UsuarioModel.create({ ...rest, senha_hash });

  // 2. Persistência no Neo4j com Lógica de Rollback
  const session = neo4jDriver.session();
  try {
    await session.run(
      'CREATE (u:Usuario {mongoId: $id, nome: $nome, papel: $papel})',
      { id: usuario._id.toString(), nome: usuario.nome, papel: usuario.papel }
    );
  } catch (error) {
    // ROLLBACK: Se o Neo4j falhar, removemos do MongoDB para manter a consistência
    await UsuarioModel.findByIdAndDelete(usuario._id);
    console.error("❌ Erro Neo4j - Cadastro desfeito no MongoDB:", error);
    throw new ApiError('Falha na integridade dos bancos (Neo4j). Tente novamente.', 500);
  } finally {
    await session.close();
  }

  return usuario;
};

export const login = async (data: any) => {
  const { email, senha } = data;
  const usuario = await UsuarioModel.findOne({ email });

  if (!usuario || !(await bcrypt.compare(senha, usuario.senha_hash))) {
    throw new UnauthorizedError('Credenciais inválidas.');
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
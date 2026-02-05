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

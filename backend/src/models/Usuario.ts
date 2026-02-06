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

  cnpj: { type: String },
  razao_social: { type: String },
  matricula_funcional: { type: String },
  secretaria: { type: String }
}, { 
  timestamps: true 
});

UsuarioSchema.set('toJSON', {
  transform: (_: any, ret: any) => {
    delete ret.senha_hash;
    return ret;
  }
});

UsuarioSchema.set('toObject', {
  transform: (_: any, ret: any) => {
    delete ret.senha_hash;
    return ret;
  }
});

export const UsuarioModel = model('Usuario', UsuarioSchema);

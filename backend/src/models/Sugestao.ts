import { Schema, model } from 'mongoose';

const SugestaoSchema = new Schema({
  autor: { 
    type: Schema.Types.ObjectId, 
    ref: 'Usuario', 
    required: true 
  },
  titulo_sugerido: { type: String, required: true },
  descricao_sugerida: { type: String },
  local_sugerido: { type: String },
  status: { 
    type: String, 
    enum: ['PENDENTE', 'APROVADA', 'REJEITADA'], 
    default: 'PENDENTE' 
  },
  // Campo extra útil para o Gestor dar um feedback caso rejeite
  motivo_rejeicao: { type: String }
}, { 
  timestamps: true 
});

export const SugestaoModel = model('Sugestao', SugestaoSchema);
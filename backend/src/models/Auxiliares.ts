import { Schema, model } from 'mongoose';

// CATEGORIA
const CategoriaSchema = new Schema({
  nome: { type: String, required: true, unique: true },
  icone_url: { type: String }
});
export const CategoriaModel = model('Categoria', CategoriaSchema);

// SUGESTÃO (Feita por cidadãos)
const SugestaoSchema = new Schema({
  autor: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true },
  titulo_sugerido: { type: String, required: true },
  descricao_sugerida: { type: String },
  local_sugerido: { type: String },
  status: { 
    type: String, 
    enum: ['PENDENTE', 'APROVADA', 'REJEITADA'], 
    default: 'PENDENTE' 
  }
}, { timestamps: true });

export const SugestaoModel = model('Sugestao', SugestaoSchema);
import { Schema, model } from 'mongoose';

const RelatorioSchema = new Schema({
  tipo: { type: String, required: true },
  autor: { 
    type: Schema.Types.ObjectId, 
    ref: 'Usuario', 
    required: true 
  },
  dados: { type: Schema.Types.Mixed, required: true }, 
  gerado_em: { type: Date, default: Date.now }
});

export const RelatorioModel = model('Relatorio', RelatorioSchema);
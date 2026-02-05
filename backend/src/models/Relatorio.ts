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
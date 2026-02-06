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

EventoSchema.index({ localizacao: '2dsphere' });

export const EventoModel = model('Evento', EventoSchema);
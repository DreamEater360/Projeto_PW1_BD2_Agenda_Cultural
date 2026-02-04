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
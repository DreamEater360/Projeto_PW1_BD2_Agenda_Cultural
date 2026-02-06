import { Schema, model } from 'mongoose';

const InscricaoSchema = new Schema({
  usuario_id: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true },
  evento_id: { type: Schema.Types.ObjectId, ref: 'Evento', required: true },
}, { timestamps: true });

InscricaoSchema.index({ usuario_id: 1, evento_id: 1 }, { unique: true });

export const InscricaoModel = model('Inscricao', InscricaoSchema);
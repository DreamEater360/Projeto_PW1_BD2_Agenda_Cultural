import { Schema, model } from 'mongoose';

const CategoriaSchema = new Schema({
  nome: { type: String, required: true, unique: true },
  icone_url: { type: String }
}, { timestamps: true });

export const CategoriaModel = model('Categoria', CategoriaSchema);


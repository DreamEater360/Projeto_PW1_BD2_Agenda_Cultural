export type Role = 'ANONIMO' | 'CIDADAO' | 'ORGANIZADOR' | 'GESTOR' | 'ADMIN';

export interface User {
  id?: string;
  nome: string;
  email: string;
  papel: Role;
  token?: string;
}

export interface Evento {
  id: string;
  titulo: string;
  descricao: string;
  data: string;
  local: string;
  latitude: number;
  longitude: number;
  foto_url?: string;
  categoria: string;
  valor: number;
}
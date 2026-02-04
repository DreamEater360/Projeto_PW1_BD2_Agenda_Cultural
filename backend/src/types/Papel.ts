// src/types/Papel.ts
export const Papel = {
  CIDADAO: 'CIDADAO',
  ORGANIZADOR: 'ORGANIZADOR',
  GESTOR_PUBLICO: 'GESTOR_PUBLICO',
  ADMINISTRADOR: 'ADMINISTRADOR',
  PARCEIRO_CULTURAL: 'PARCEIRO_CULTURAL',
} as const;

// Esta linha cria o "tipo" baseado nos valores da constante acima
export type Papel = typeof Papel[keyof typeof Papel];
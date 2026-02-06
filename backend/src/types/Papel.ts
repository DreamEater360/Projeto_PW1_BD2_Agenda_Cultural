export const Papel = {
  CIDADAO: 'CIDADAO',
  ORGANIZADOR: 'ORGANIZADOR',
  GESTOR_PUBLICO: 'GESTOR_PUBLICO',
  ADMINISTRADOR: 'ADMINISTRADOR',
  PARCEIRO_CULTURAL: 'PARCEIRO_CULTURAL',
} as const;

export type Papel = typeof Papel[keyof typeof Papel];
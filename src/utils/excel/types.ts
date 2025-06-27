
export interface PeriodoData {
  id: string;
  nome: string;
  funcionarios: any[];
  totalRegistros: number;
  dataProcessamento: Date;
}

// Dados mestres extraídos da aba "BANCO"
export interface ColaboradorInfo {
  matricula: string;
  nome: string;
  cargo: string;
  idade?: number;
  lider?: string;
  dataAdmissao?: string;
}

// A estrutura de dados final e unificada que queremos
export type FuncionarioUnificado = ColaboradorInfo & {
  contadores: Record<string, number>;
  totalDias: number;
  diasDetalhados: Record<string, string>;
};

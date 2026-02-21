export interface Feature {
  id: number;
  projeto_id: number;
  titulo: string;
  descricao?: string;
  complexidade: 'simples' | 'moderada' | 'complexa' | 'muito_complexa' | 'critica';
  categoria?: string;
  tempo_estimado_horas?: number;
  ordem?: number;
}

export interface Project {
  id: number;
  nome: string;
  cliente_nome: string;
  descricao?: string;
  status: 'rascunho' | 'analise' | 'em_desenvolvimento' | 'concluido';
  prazo_estimado_dias: number;
  created_at: string;
}

export interface PaginatedResponse<T> {
  list: T[];
  pageInfo: {
    totalRows: number;
    page: number;
    pageSize: number;
    isLastPage: boolean;
  };
}
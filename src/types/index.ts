export interface Feature {
  id: number;
  projeto_id: number;
  titulo: string;
  descricao?: string;
  observacoes?: string;
  status: 'pendente' | 'fazendo' | 'concluido';
  complexidade: string;
  categoria?: string;
  data_programada?: string;
  tempo_estimado_horas?: number;
  ordem: number;
}

export interface Project {
  id: number;
  nome: string;
  cliente_nome: string;
  descricao?: string;
  status: 'aguardando_inicio' | 'em_andamento' | 'pausado' | 'concluido' | 'rascunho';
  prazo_entrega?: string;
  prazo_estimado_dias?: number; // Adicionado para corrigir erro no ProjectCard
  started_at?: string;
  finished_at?: string;
  created_at: string;
}

export interface Template {
  id: number;
  nome: string;
  descricao?: string;
  created_at: string;
}

export interface Setting {
  id: number;
  chave: string;
  valor: string;
  updated_at: string;
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
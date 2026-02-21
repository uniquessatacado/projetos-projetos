export interface Feature {
  id: number;
  projeto_id: number;
  titulo: string;
  descricao?: string;
  complexidade: 'simples' | 'moderada' | 'complexa' | 'muito_complexa';
  categoria?: string;
  tempo_estimado_horas: number;
}

export interface Project {
  id: number;
  nome: string;
  cliente_nome: string;
  descricao?: string;
  status: 'rascunho' | 'analise' | 'em_desenvolvimento' | 'concluido';
  prazo_estimado_dias: number;
  created_at: string;
  funcionalidades?: Feature[];
}
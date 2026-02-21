import { User, Star } from 'lucide-react';

export interface ProjectType {
  id: number;
  nome: string;
  cliente_nome: string;
  status: 'rascunho' | 'analise' | 'em_desenvolvimento' | 'concluido';
  is_favorito: boolean;
  prazo_estimado_dias: number;
  complexidade_global: 'baixa' | 'media' | 'alta' | 'muito_alta';
  progresso: number;
}

const ProjectCard = ({ projeto }: { projeto: ProjectType }) => {
    const statusConfig = {
        'rascunho': { label: 'RASCUNHO', classes: 'bg-gray-100 text-gray-700 border-gray-200' },
        'analise': { label: 'ANÁLISE', classes: 'bg-amber-50 text-amber-700 border-amber-200' },
        'em_desenvolvimento': { label: 'EM DESENVOLVIMENTO', classes: 'bg-violet-50 text-violet-700 border-violet-200' },
        'concluido': { label: 'CONCLUÍDO', classes: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
    };

    const { label, classes } = statusConfig[projeto.status] || statusConfig['rascunho'];

    return (
        <div className="group bg-white rounded-2xl p-6 shadow-card hover:shadow-glow transition-all duration-300 border border-gray-100 hover:border-primary-200 cursor-pointer transform hover:-translate-y-1 animate-fade-in">
            <div className="flex justify-between items-start mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${classes}`}>
                    {label}
                </span>
                {projeto.is_favorito && <Star className="w-5 h-5 text-amber-400 fill-current" />}
            </div>
            
            <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1 group-hover:text-primary-600 transition-colors">
                {projeto.nome}
            </h3>
            <p className="text-sm text-gray-500 mb-4 flex items-center gap-1">
                <User className="w-4 h-4" /> {projeto.cliente_nome}
            </p>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-500 mb-1">Prazo Est.</p>
                    <p className="text-lg font-bold text-gray-900">{projeto.prazo_estimado_dias}d</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-500 mb-1">Complexidade</p>
                    <p className="text-lg font-bold text-gray-900 capitalize">{projeto.complexidade_global}</p>
                </div>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div 
                    className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${projeto.progresso}%` }}
                />
            </div>
            <p className="text-xs text-gray-400 text-right">{projeto.progresso}% completo</p>
        </div>
    );
};

export default ProjectCard;
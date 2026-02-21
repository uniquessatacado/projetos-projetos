import { User, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Project } from '@/types';

const ProjectCard = ({ projeto }: { projeto: Project }) => {
    const statusConfig = {
        'rascunho': { label: 'RASCUNHO', classes: 'bg-gray-100 text-gray-700 border-gray-200' },
        'analise': { label: 'ANÁLISE', classes: 'bg-amber-50 text-amber-700 border-amber-200' },
        'em_desenvolvimento': { label: 'EM DESENVOLVIMENTO', classes: 'bg-violet-50 text-violet-700 border-violet-200' },
        'concluido': { label: 'CONCLUÍDO', classes: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
    };

    const { label, classes } = statusConfig[projeto.status] || statusConfig['rascunho'];

    return (
        <Link to={`/projetos/${projeto.id}`} className="block">
            <div className="group bg-white rounded-2xl p-6 shadow-card hover:shadow-glow transition-all duration-300 border border-gray-100 hover:border-primary-200 cursor-pointer transform hover:-translate-y-1 animate-fade-in h-full flex flex-col">
                <div className="flex justify-between items-start mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${classes}`}>
                        {label}
                    </span>
                    {/* is_favorito is not in the API response, so this is commented out for now */}
                    {/* {projeto.is_favorito && <Star className="w-5 h-5 text-amber-400 fill-current" />} */}
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1 group-hover:text-primary-600 transition-colors">
                    {projeto.nome}
                </h3>
                <p className="text-sm text-gray-500 mb-4 flex items-center gap-1">
                    <User className="w-4 h-4" /> {projeto.cliente_nome}
                </p>
                
                <div className="mt-auto bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-500 mb-1 flex items-center gap-1.5"><Calendar className="w-3 h-3" /> Prazo Estimado</p>
                    <p className="text-lg font-bold text-gray-900">{projeto.prazo_estimado_dias} dias</p>
                </div>
            </div>
        </Link>
    );
};

export default ProjectCard;
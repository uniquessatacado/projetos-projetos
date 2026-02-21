import { User, Calendar, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Project } from '@/types';
import { getFeaturesByProjectId } from '@/lib/api';
import { Skeleton } from '../ui/skeleton';

const ProjectCard = ({ projeto }: { projeto: Project }) => {
    const { data: features, isLoading } = useQuery({
        queryKey: ['features', projeto.id],
        queryFn: () => getFeaturesByProjectId(projeto.id),
    });

    const statusConfig = {
        'rascunho': { label: 'RASCUNHO', classes: 'bg-slate-100 text-slate-700 border-slate-200' },
        'analise': { label: 'ANÁLISE', classes: 'bg-amber-100 text-amber-700 border-amber-200' },
        'em_desenvolvimento': { label: 'EM DESENVOLVIMENTO', classes: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
        'concluido': { label: 'CONCLUÍDO', classes: 'bg-emerald-100 text-emerald-700 border-emerald-200' }
    };

    const { label, classes } = statusConfig[projeto.status] || statusConfig['rascunho'];

    return (
        <Link to={`/projetos/${projeto.id}`} className="block">
            <div className="group bg-white rounded-2xl p-5 shadow-card hover:shadow-glow transition-all duration-300 border border-slate-100 hover:border-indigo-200 cursor-pointer transform hover:-translate-y-1 animate-fade-in h-full flex flex-col">
                <div className="flex justify-between items-start mb-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${classes}`}>
                        {label}
                    </span>
                </div>
                
                <h3 className="text-lg font-bold text-slate-900 mb-1 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                    {projeto.nome}
                </h3>
                <p className="text-sm text-slate-500 mb-4 flex items-center gap-2">
                    <User className="w-4 h-4" /> {projeto.cliente_nome}
                </p>
                
                <div className="mt-auto grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-slate-50 rounded-lg p-2">
                        <p className="text-xs text-slate-500 flex items-center gap-1.5"><Calendar className="w-3 h-3" /> Prazo</p>
                        <p className="font-bold text-slate-800">{projeto.prazo_estimado_dias} dias</p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-2">
                        <p className="text-xs text-slate-500 flex items-center gap-1.5"><Layers className="w-3 h-3" /> Funções</p>
                        {isLoading ? <Skeleton className="h-5 w-4 mt-0.5" /> : <p className="font-bold text-slate-800">{features?.length || 0}</p>}
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default ProjectCard;
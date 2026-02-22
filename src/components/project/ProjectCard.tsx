import { User, Calendar, Clock, PlayCircle, PauseCircle, CheckCircle2, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Project } from '@/types';
import { getFeaturesByProjectId } from '@/lib/api';
import { parseMetadata } from '@/lib/meta-utils';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Progress } from '../ui/progress';

const ProjectCard = ({ projeto }: { projeto: Project }) => {
    const { data: features, isLoading } = useQuery({
        queryKey: ['features', projeto.id],
        queryFn: () => getFeaturesByProjectId(projeto.id),
    });

    const meta = parseMetadata<{ 
        status?: string, 
        started_at?: string, 
        paused_at?: string,
        prazo_entrega?: string 
    }>(projeto.descricao);

    const status = meta.status || 'aguardando_inicio';

    const getStatusConfig = () => {
        switch (status) {
            case 'em_andamento':
                return { label: 'ATIVO', color: 'bg-indigo-500', icon: PlayCircle, text: 'text-indigo-600' };
            case 'pausado':
                return { label: 'PAUSADO', color: 'bg-amber-500', icon: PauseCircle, text: 'text-amber-600' };
            case 'concluido':
                return { label: 'CONCLUÍDO', color: 'bg-emerald-500', icon: CheckCircle2, text: 'text-emerald-600' };
            default:
                return { label: 'NA FILA', color: 'bg-slate-400', icon: Clock, text: 'text-slate-500' };
        }
    };

    const cfg = getStatusConfig();

    const getFeatureStats = () => {
        if (!features) return { total: 0, concluidas: 0, fazendo: null };
        const parsed = features.map(f => ({
            ...f,
            meta: parseMetadata<{ status?: string }>(f.descricao)
        }));
        
        const concluidas = parsed.filter(f => f.meta.status === 'concluido').length;
        const fazendo = parsed.find(f => f.meta.status === 'fazendo');
        
        return { 
            total: features.length, 
            concluidas, 
            fazendo: fazendo?.titulo || null 
        };
    };

    const stats = getFeatureStats();
    const percent = stats.total > 0 ? Math.round((stats.concluidas / stats.total) * 100) : 0;

    const getTimeInfo = () => {
        if (status === 'em_andamento' && meta.started_at) {
            return `Ativo há ${formatDistanceToNow(new Date(meta.started_at), { locale: ptBR })}`;
        }
        if (status === 'pausado' && meta.paused_at) {
            return `Pausado há ${formatDistanceToNow(new Date(meta.paused_at), { locale: ptBR })}`;
        }
        return 'Aguardando início';
    };

    return (
        <Link to={`/projetos/${projeto.id}`} className="block h-full">
            <div className={`group bg-white rounded-2xl p-6 shadow-card hover:shadow-glow transition-all duration-300 border-2 ${status === 'em_andamento' ? 'border-indigo-100' : 'border-transparent'} hover:border-indigo-200 transform hover:-translate-y-1 h-full flex flex-col`}>
                
                <div className="flex justify-between items-center mb-4">
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black text-white ${cfg.color} shadow-sm`}>
                        <cfg.icon className="w-3 h-3" />
                        {cfg.label}
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        #{projeto.id}
                    </span>
                </div>

                <div className="mb-4">
                    <h3 className="text-xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                        {projeto.nome}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-sm font-semibold text-slate-500">{projeto.cliente_nome}</span>
                    </div>
                </div>

                <div className="mb-5">
                    <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1.5 uppercase">
                        <span>Progresso</span>
                        <span>{percent}%</span>
                    </div>
                    <Progress value={percent} className={`h-1.5 ${status === 'concluido' ? 'bg-emerald-100' : 'bg-slate-100'}`} />
                </div>

                <div className={`mb-5 p-3 rounded-xl ${status === 'em_andamento' ? 'bg-indigo-50/50' : 'bg-slate-50'} border border-transparent group-hover:border-slate-100`}>
                    <p className={`text-[10px] font-bold uppercase tracking-tight ${cfg.text} mb-0.5`}>Cronômetro</p>
                    <p className="text-xs font-medium text-slate-700">{getTimeInfo()}</p>
                </div>

                <div className="mt-auto space-y-3">
                    {stats.fazendo && (
                        <div className="flex items-start gap-2 bg-amber-50 p-2.5 rounded-lg border border-amber-100/50">
                            <div className="mt-0.5"><div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" /></div>
                            <div>
                                <p className="text-[9px] font-black text-amber-700 uppercase leading-none mb-1">Trabalhando em</p>
                                <p className="text-xs font-bold text-amber-900 line-clamp-1">{stats.fazendo}</p>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-50 rounded-lg p-2 flex flex-col">
                            <span className="text-[9px] font-bold text-slate-400 uppercase">Total</span>
                            <span className="text-sm font-black text-slate-800">{isLoading ? '...' : stats.total} <span className="text-[10px] text-slate-400 font-normal">Funções</span></span>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-2 flex flex-col">
                            <span className="text-[9px] font-bold text-slate-400 uppercase">Faltam</span>
                            <span className="text-sm font-black text-slate-800">{isLoading ? '...' : stats.total - stats.concluidas}</span>
                        </div>
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                     <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {meta.prazo_entrega ? `Entrega: ${meta.prazo_entrega}` : 'Sem prazo'}
                     </span>
                     <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-400 transition-all group-hover:translate-x-1" />
                </div>
            </div>
        </Link>
    );
};

export default ProjectCard;
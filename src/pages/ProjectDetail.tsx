import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProjectById, getFeaturesByProjectId, deleteFeature, updateProject, updateFeature } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Play, Pause, CheckCircle, Clock, Calendar, MessageSquare, ListTodo, MoreHorizontal } from 'lucide-react';
import { showError, showSuccess } from '@/utils/toast';
import { Feature, Project } from '@/types';
import { formatDistanceToNow, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { NewFeatureDialog } from '@/components/project/NewFeatureDialog';
import { WorkflowGuide } from '@/components/project/WorkflowGuide';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: project, isLoading: isLoadingProject } = useQuery({
    queryKey: ['project', id],
    queryFn: () => getProjectById(id!),
    enabled: !!id,
  });

  const { data: features, isLoading: isLoadingFeatures } = useQuery({
    queryKey: ['features', project?.id],
    queryFn: () => getFeaturesByProjectId(project!.id),
    enabled: !!project,
  });

  const updateProjectMutation = useMutation({
    mutationFn: (data: Partial<Project>) => updateProject(project!.id, data),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['project', id] });
        showSuccess('Status do projeto atualizado!');
    }
  });

  const toggleFeatureStatus = useMutation({
    mutationFn: ({ fid, status }: { fid: number, status: string }) => updateFeature(fid, { status: status as any }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['features', project?.id] })
  });

  const calculateProgress = () => {
    if (!features || features.length === 0) return 0;
    const completed = features.filter(f => f.status === 'concluido').length;
    return Math.round((completed / features.length) * 100);
  };

  const getElapsedTime = () => {
    if (!project?.started_at) return "Não iniciado";
    return formatDistanceToNow(new Date(project.started_at), { locale: ptBR, addSuffix: false });
  };

  if (isLoadingProject) return <div className="p-8"><Skeleton className="h-96 w-full" /></div>;

  return (
    <div className="p-4 lg:p-8 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <Button variant="ghost" onClick={() => navigate('/')} className="text-slate-600">
            <ArrowLeft className="w-4 h-4 mr-2" /> Projetos
        </Button>
        <div className="flex gap-2">
            {project?.status === 'aguardando_inicio' && (
                <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => updateProjectMutation.mutate({ status: 'em_andamento', started_at: new Date().toISOString() })}>
                    <Play className="w-4 h-4 mr-2" /> Iniciar Projeto
                </Button>
            )}
            {project?.status === 'em_andamento' && (
                <Button variant="outline" className="text-amber-600 border-amber-200" onClick={() => updateProjectMutation.mutate({ status: 'pausado' })}>
                    <Pause className="w-4 h-4 mr-2" /> Pausar
                </Button>
            )}
            {project?.status === 'pausado' && (
                <Button variant="outline" className="text-emerald-600 border-emerald-200" onClick={() => updateProjectMutation.mutate({ status: 'em_andamento' })}>
                    <Play className="w-4 h-4 mr-2" /> Retomar
                </Button>
            )}
            {project?.status !== 'concluido' && project?.status !== 'aguardando_inicio' && (
                <Button className="bg-indigo-600" onClick={() => updateProjectMutation.mutate({ status: 'concluido', finished_at: new Date().toISOString() })}>
                    <CheckCircle className="w-4 h-4 mr-2" /> Finalizar
                </Button>
            )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
            <header>
                <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">{project?.nome}</h1>
                    <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100 border-none px-3">
                        {project?.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-slate-500 font-medium">
                    <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-indigo-500" /> Iniciado há: {getElapsedTime()}</span>
                    <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-indigo-500" /> Entrega: {project?.prazo_entrega ? format(new Date(project.prazo_entrega), 'dd/MM/yyyy') : 'Não definida'}</span>
                </div>
            </header>

            <Card className="border-none shadow-card bg-white overflow-hidden">
                <CardHeader className="border-b bg-slate-50/50">
                    <div className="flex justify-between items-end">
                        <div>
                            <CardTitle>Fluxo de Trabalho</CardTitle>
                            <CardDescription>Progresso total: {calculateProgress()}%</CardDescription>
                        </div>
                        <NewFeatureDialog projectId={project!.id}>
                            <Button size="sm">Adicionar Função</Button>
                        </NewFeatureDialog>
                    </div>
                    <Progress value={calculateProgress()} className="h-2 mt-4 bg-slate-100" />
                </CardHeader>
                <CardContent className="p-0">
                    <Tabs defaultValue="todas" className="w-full">
                        <TabsList className="w-full justify-start rounded-none border-b bg-transparent px-6 h-12">
                            <TabsTrigger value="todas" className="data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none h-12">Todas</TabsTrigger>
                            <TabsTrigger value="fila" className="data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none h-12">Na Fila</TabsTrigger>
                            <TabsTrigger value="fazendo" className="data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none h-12">Fazendo</TabsTrigger>
                        </TabsList>
                        <TabsContent value="todas" className="p-4 space-y-3">
                            {features?.map((f) => (
                                <div key={f.id} className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white rounded-xl border border-slate-100 hover:border-indigo-200 hover:shadow-soft transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-full ${f.status === 'concluido' ? 'bg-emerald-100 text-emerald-600' : f.status === 'fazendo' ? 'bg-amber-100 text-amber-600 animate-pulse' : 'bg-slate-100 text-slate-400'}`}>
                                            <ListTodo className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className={`font-bold ${f.status === 'concluido' ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{f.titulo}</h4>
                                            <p className="text-xs text-slate-500 line-clamp-1">{f.descricao || "Sem detalhes."}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 mt-4 sm:mt-0">
                                        <select 
                                            value={f.status} 
                                            onChange={(e) => toggleFeatureStatus.mutate({ fid: f.id, status: e.target.value })}
                                            className="text-xs font-semibold border rounded-lg px-2 py-1 bg-slate-50 border-slate-200 outline-none"
                                        >
                                            <option value="pendente">PENDENTE</option>
                                            <option value="fazendo">FAZENDO</option>
                                            <option value="concluido">CONCLUÍDO</option>
                                        </select>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-500">
                                            <MoreHorizontal className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>

        <aside className="space-y-6">
            <WorkflowGuide />
            
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2"><MessageSquare className="w-4 h-4" /> Notas Gerais</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-slate-500 italic">Mantenha aqui anotações sobre credenciais, domínios do Cloudflare ou rotas do Nginx específicas deste projeto.</p>
                    <Button variant="outline" className="w-full mt-4 text-xs">Editar Notas</Button>
                </CardContent>
            </Card>
        </aside>
      </div>
    </div>
  );
};

export default ProjectDetail;
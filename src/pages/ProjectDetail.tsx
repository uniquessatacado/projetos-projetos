import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProjectById, getFeaturesByProjectId, updateProject, updateFeature, deleteFeature } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Play, Pause, CheckCircle, Clock, Calendar, MessageSquare, ListTodo, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { showError, showSuccess } from '@/utils/toast';
import { Feature } from '@/types';
import { formatDistanceToNow, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { NewFeatureDialog } from '@/components/project/NewFeatureDialog';
import { WorkflowGuide } from '@/components/project/WorkflowGuide';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { parseMetadata, stringifyMetadata, getCleanDescription } from '@/lib/meta-utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useState } from 'react';
import { EditProjectDialog } from '@/components/project/EditProjectDialog';
import { EditFeatureDialog } from '@/components/project/EditFeatureDialog';

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditProjectOpen, setIsEditProjectOpen] = useState(false);
  const [editingFeature, setEditingFeature] = useState<Feature | null>(null);

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

  const projectMeta = parseMetadata<{ status?: string, started_at?: string, prazo_entrega?: string }>(project?.descricao);
  const currentProjectStatus = projectMeta.status || 'aguardando_inicio';

  const updateProjectMutation = useMutation({
    mutationFn: (newMeta: any) => {
        const updatedDesc = stringifyMetadata(getCleanDescription(project?.descricao), { ...projectMeta, ...newMeta });
        return updateProject(project!.id, { ...project, descricao: updatedDesc });
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['project', id] });
        showSuccess('Status atualizado!');
    }
  });

  const deleteFeatureMutation = useMutation({
    mutationFn: deleteFeature,
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['features', project?.id] });
        showSuccess('Removido com sucesso!');
    }
  });

  const toggleFeatureStatus = useMutation({
    mutationFn: ({ feature, status }: { feature: Feature, status: string }) => {
        const meta = parseMetadata<any>(feature.descricao);
        const updatedDesc = stringifyMetadata(getCleanDescription(feature.descricao), { ...meta, status });
        return updateFeature(feature.id, { ...feature, descricao: updatedDesc });
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['features', project?.id] });
    }
  });

  const getFeatureData = (f: Feature) => {
    const meta = parseMetadata<{ status?: string, observacoes?: string }>(f.descricao);
    return {
        status: meta.status || 'pendente',
        observacoes: meta.observacoes || '',
        cleanDesc: getCleanDescription(f.descricao)
    };
  };

  const calculateProgress = () => {
    if (!features || features.length === 0) return 0;
    const completed = features.filter(f => getFeatureData(f).status === 'concluido').length;
    return Math.round((completed / features.length) * 100);
  };

  if (isLoadingProject || isLoadingFeatures) return <div className="p-8"><Skeleton className="h-96 w-full" /></div>;

  const renderFeatureList = (filterStatus?: string) => {
    const filtered = filterStatus 
        ? features?.filter(f => getFeatureData(f).status === filterStatus)
        : features;

    if (!filtered || filtered.length === 0) return <p className="text-center py-8 text-slate-400">Vazio.</p>;

    return filtered.map((f) => {
        const data = getFeatureData(f);
        return (
            <div key={f.id} className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-100 hover:shadow-soft transition-all">
                <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full ${data.status === 'concluido' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                        <ListTodo className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className={`font-bold ${data.status === 'concluido' ? 'text-slate-400 line-through' : ''}`}>{f.titulo}</h4>
                        <p className="text-xs text-slate-500">{f.complexidade.toUpperCase()}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <select 
                        value={data.status} 
                        onChange={(e) => toggleFeatureStatus.mutate({ feature: f, status: e.target.value })}
                        className="text-xs border rounded p-1"
                    >
                        <option value="pendente">FILA</option>
                        <option value="fazendo">FAZENDO</option>
                        <option value="concluido">PRONTO</option>
                    </select>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => setEditingFeature(f)}><Edit className="w-4 mr-2" /> Editar</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-500" onClick={() => deleteFeatureMutation.mutate(f.id)}><Trash2 className="w-4 mr-2" /> Excluir</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        );
    });
  };

  return (
    <div className="p-4 lg:p-8 animate-fade-in max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <Button variant="ghost" onClick={() => navigate('/')}><ArrowLeft className="w-4 mr-2" /> Voltar</Button>
        <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsEditProjectOpen(true)}><Edit className="w-4 mr-2" /> Editar</Button>
            {currentProjectStatus === 'aguardando_inicio' ? (
                <Button className="bg-green-600 hover:bg-green-700 shadow-glow" onClick={() => updateProjectMutation.mutate({ status: 'em_andamento', started_at: new Date().toISOString() })}>
                    <Play className="w-4 mr-2" /> Iniciar Agora
                </Button>
            ) : (
                <Button variant="secondary" onClick={() => updateProjectMutation.mutate({ status: 'aguardando_inicio' })}>Reiniciar</Button>
            )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                    <h1 className="text-4xl font-black text-slate-900">{project?.nome}</h1>
                    <Badge variant="outline" className="bg-primary-50 text-primary-700 border-primary-200">
                        {currentProjectStatus.toUpperCase()}
                    </Badge>
                </div>
                <p className="text-slate-500 font-medium flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Cliente: {project?.cliente_nome}
                </p>
            </div>

            <Card className="shadow-card border-none">
                <CardHeader className="flex flex-row items-center justify-between border-b bg-slate-50/50">
                    <div>
                        <CardTitle>Escopo de Funções</CardTitle>
                        <CardDescription>Gerencie as entregas técnicas.</CardDescription>
                    </div>
                    <NewFeatureDialog projectId={project!.id}>
                        <Button size="sm">Nova Função</Button>
                    </NewFeatureDialog>
                </CardHeader>
                <CardContent className="p-0">
                    <Tabs defaultValue="todas">
                        <TabsList className="w-full justify-start rounded-none px-6 border-b bg-transparent">
                            <TabsTrigger value="todas">Todas</TabsTrigger>
                            <TabsTrigger value="fila">Fila</TabsTrigger>
                            <TabsTrigger value="fazendo">Fazendo</TabsTrigger>
                        </TabsList>
                        <div className="p-6 space-y-3">
                            <TabsContent value="todas" className="mt-0">{renderFeatureList()}</TabsContent>
                            <TabsContent value="fila" className="mt-0">{renderFeatureList('pendente')}</TabsContent>
                            <TabsContent value="fazendo" className="mt-0">{renderFeatureList('fazendo')}</TabsContent>
                        </div>
                    </Tabs>
                </CardContent>
            </Card>
        </div>

        <aside className="space-y-6">
            <Card className="bg-indigo-600 text-white border-none shadow-glow">
                <CardHeader>
                    <CardTitle className="text-lg">Progresso Real</CardTitle>
                    <div className="text-3xl font-black">{calculateProgress()}%</div>
                </CardHeader>
                <CardContent>
                    <Progress value={calculateProgress()} className="bg-white/20 h-2 mb-4" />
                    {projectMeta.started_at && (
                        <p className="text-xs text-indigo-100 flex items-center gap-2">
                            <Clock className="w-3" /> Ativo há {getElapsedTime(projectMeta.started_at)}
                        </p>
                    )}
                </CardContent>
            </Card>
            <WorkflowGuide />
        </aside>
      </div>

      {isEditProjectOpen && <EditProjectDialog project={project!} open={isEditProjectOpen} onOpenChange={setIsEditProjectOpen} />}
      {editingFeature && <EditFeatureDialog feature={editingFeature} open={!!editingFeature} onOpenChange={() => setEditingFeature(null)} />}
    </div>
  );
};

function getElapsedTime(date: string) {
    try {
        return formatDistanceToNow(new Date(date), { locale: ptBR });
    } catch(e) { return "---"; }
}

export default ProjectDetail;
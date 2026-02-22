"use client";

import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProjectById, getFeaturesByProjectId, updateProject, updateFeature, deleteFeature, deleteProject } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Play, Pause, CheckCircle, Clock, Calendar, ListTodo, MoreHorizontal, Edit, Trash2, Phone, User, UserPlus } from 'lucide-react';
import { showError, showSuccess } from '@/utils/toast';
import { Feature } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { NewFeatureDialog } from '@/components/project/NewFeatureDialog';
import { WorkflowGuide } from '@/components/project/WorkflowGuide';
import { FinancialInfoCard } from '@/components/project/FinancialInfoCard';
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

  const projectMeta = parseMetadata<any>(project?.descricao);
  const currentProjectStatus = projectMeta.status || 'aguardando_inicio';

  const updateProjectMutation = useMutation({
    mutationFn: (newMeta: any) => {
        const updatedDesc = stringifyMetadata(getCleanDescription(project?.descricao), { ...projectMeta, ...newMeta });
        return updateProject(project!.id, { ...project, descricao: updatedDesc });
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['project', id] });
        queryClient.invalidateQueries({ queryKey: ['projects'] });
        showSuccess('Status atualizado!');
    }
  });

  const deleteProjectMutation = useMutation({
    mutationFn: () => deleteProject(project!.id),
    onSuccess: () => {
        showSuccess('Projeto excluído permanentemente!');
        navigate('/');
    },
    onError: (e: any) => showError(e.message)
  });

  const toggleFeatureStatus = useMutation({
    mutationFn: ({ feature, status }: { feature: Feature, status: string }) => {
        const meta = parseMetadata<any>(feature.descricao);
        const updatedDesc = stringifyMetadata(getCleanDescription(feature.descricao), { ...meta, status });
        return updateFeature(feature.id, { ...feature, descricao: updatedDesc });
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['features', project?.id] });
        queryClient.invalidateQueries({ queryKey: ['projects'] });
    }
  });

  const openWhatsApp = (phone: string) => {
    if (!phone) return;
    const cleanPhone = phone.replace(/\D/g, "");
    window.open(`https://wa.me/55${cleanPhone}`, "_blank");
  };

  const calculateProgress = () => {
    if (!features || features.length === 0) return 0;
    const completed = features.filter(f => {
        const meta = parseMetadata<any>(f.descricao);
        return (meta.status || 'pendente') === 'concluido';
    }).length;
    return Math.round((completed / features.length) * 100);
  };

  if (isLoadingProject || isLoadingFeatures) return <div className="p-8"><Skeleton className="h-96 w-full" /></div>;

  return (
    <div className="p-4 lg:p-8 animate-fade-in max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <Button variant="ghost" onClick={() => navigate('/')}><ArrowLeft className="w-4 mr-2" /> Voltar</Button>
        <div className="flex gap-2">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline"><MoreHorizontal className="w-4 mr-2" /> Ações do Projeto</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setIsEditProjectOpen(true)}><Edit className="w-4 mr-2" /> Editar Dados</DropdownMenuItem>
                    <DropdownMenuItem className="text-red-500" onClick={() => {
                        if(confirm('Tem certeza? Isso apagará todos os dados deste projeto.')) deleteProjectMutation.mutate();
                    }}><Trash2 className="w-4 mr-2" /> Excluir Projeto</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {currentProjectStatus === 'aguardando_inicio' && (
                <Button className="bg-indigo-600" onClick={() => updateProjectMutation.mutate({ status: 'em_andamento', started_at: new Date().toISOString() })}>
                    <Play className="w-4 mr-2" /> Iniciar Projeto
                </Button>
            )}

            {currentProjectStatus === 'em_andamento' && (
                <Button variant="outline" className="border-amber-200 text-amber-600" onClick={() => updateProjectMutation.mutate({ status: 'pausado', paused_at: new Date().toISOString() })}>
                    <Pause className="w-4 mr-2" /> Pausar
                </Button>
            )}

            {currentProjectStatus === 'pausado' && (
                <Button className="bg-indigo-600" onClick={() => updateProjectMutation.mutate({ status: 'em_andamento', started_at: new Date().toISOString(), paused_at: null })}>
                    <Play className="w-4 mr-2" /> Retomar
                </Button>
            )}

            {(currentProjectStatus === 'em_andamento' || currentProjectStatus === 'pausado') && calculateProgress() === 100 && (
                 <Button className="bg-emerald-600" onClick={() => updateProjectMutation.mutate({ status: 'concluido', finished_at: new Date().toISOString() })}>
                    <CheckCircle className="w-4 mr-2" /> Finalizar Entrega
                 </Button>
            )}

            {currentProjectStatus === 'concluido' && (
                <Button variant="outline" onClick={() => updateProjectMutation.mutate({ status: 'em_andamento' })}>
                    Retomar para Ajustes
                </Button>
            )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
            <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">{project?.nome}</h1>
                    <Badge className={`font-black ${currentProjectStatus === 'concluido' ? 'bg-emerald-500' : currentProjectStatus === 'em_andamento' ? 'bg-indigo-500' : 'bg-slate-500'}`}>
                        {currentProjectStatus.toUpperCase()}
                    </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-slate-500 font-bold text-sm">
                    <span className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-full">
                        <User className="w-4 h-4 text-indigo-400" /> {project?.cliente_nome}
                    </span>
                    {projectMeta.cliente_whatsapp && (
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-green-600 hover:text-green-700 hover:bg-green-50 p-0 h-auto"
                            onClick={() => openWhatsApp(projectMeta.cliente_whatsapp)}
                        >
                            <Phone className="w-4 h-4 mr-1.5" /> Falar com Cliente
                        </Button>
                    )}
                    <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-indigo-400" /> Prazo: {projectMeta.prazo_entrega || 'Não definido'}</span>
                </div>
            </div>

            <Card className="shadow-card border-none overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between border-b bg-slate-50/50 p-6">
                    <div>
                        <CardTitle className="text-xl">
                            {currentProjectStatus === 'concluido' ? 'Fase de Ajustes / Adicionais' : 'Funcionalidades do Escopo'}
                        </CardTitle>
                        <CardDescription>
                            {currentProjectStatus === 'concluido' 
                                ? 'Projeto finalizado. Você ainda pode adicionar ajustes cobrados à parte.' 
                                : 'Gerenciamento técnico das entregas.'}
                        </CardDescription>
                    </div>
                    <NewFeatureDialog projectId={project!.id}>
                        <Button size="sm" className="bg-indigo-600">
                            {currentProjectStatus === 'concluido' ? '+ Novo Ajuste' : '+ Nova Função'}
                        </Button>
                    </NewFeatureDialog>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="p-6 space-y-3">
                        {features?.map(f => {
                            const meta = parseMetadata<any>(f.descricao);
                            const status = meta.status || 'pendente';
                            return (
                                <div key={f.id} className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-100">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-full ${status === 'concluido' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                                            <ListTodo className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold">{f.titulo}</h4>
                                            <p className="text-[10px] text-slate-400 uppercase font-black">{f.complexidade}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <select 
                                            value={status} 
                                            onChange={(e) => toggleFeatureStatus.mutate({ feature: f, status: e.target.value })}
                                            className="text-xs font-bold border rounded p-1.5 bg-slate-50 border-slate-200"
                                        >
                                            <option value="pendente">FILA</option>
                                            <option value="fazendo">FAZENDO</option>
                                            <option value="concluido">PRONTO</option>
                                        </select>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>

        <aside className="space-y-6">
            <FinancialInfoCard descricao={project?.descricao} />
            {projectMeta.indicacao_nome && (
                <Card className="border-amber-100 bg-amber-50/30">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-black text-amber-800 uppercase flex items-center gap-2">
                            <UserPlus className="w-4 h-4" /> Indicação
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm font-bold text-slate-700">{projectMeta.indicacao_nome}</p>
                        {projectMeta.indicacao_whatsapp && (
                             <Button 
                                variant="link" 
                                className="p-0 h-auto text-xs text-green-600 font-black mt-2"
                                onClick={() => openWhatsApp(projectMeta.indicacao_whatsapp)}
                             >
                                <Phone className="w-3 h-3 mr-1" /> WhatsApp Parceiro
                             </Button>
                        )}
                    </CardContent>
                </Card>
            )}
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
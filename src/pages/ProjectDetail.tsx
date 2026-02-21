import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProjectById, getFeaturesByProjectId, deleteFeature } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, PlusCircle, Trash2, FileText, User, Info } from 'lucide-react';
import { showError, showSuccess } from '@/utils/toast';
import { Feature } from '@/types';
import { useState } from 'react';
import { NewFeatureDialog } from '@/components/project/NewFeatureDialog';

const complexityConfig = {
    'simples': { label: 'Simples', classes: 'bg-emerald-100 text-emerald-800' },
    'moderada': { label: 'Moderada', classes: 'bg-amber-100 text-amber-800' },
    'complexa': { label: 'Complexa', classes: 'bg-orange-100 text-orange-800' },
    'muito_complexa': { label: 'Muito Complexa', classes: 'bg-red-100 text-red-800' },
    'critica': { label: 'Crítica', classes: 'bg-rose-100 text-rose-800' },
};

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isPromptOpen, setPromptOpen] = useState(false);

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

  const deleteFeatureMutation = useMutation({
    mutationFn: deleteFeature,
    onSuccess: () => {
      showSuccess('Funcionalidade removida!');
      queryClient.invalidateQueries({ queryKey: ['features', project?.id] });
      queryClient.invalidateQueries({ queryKey: ['projects'] }); // To update feature count on dashboard
    },
    onError: (error: Error) => showError(error.message),
  });

  const generatePromptText = () => {
    if (!project || !features) return "";
    let text = `# Escopo do Projeto: ${project.nome}\n\n`;
    text += `**Cliente:** ${project.cliente_nome}\n`;
    text += `**Descrição Geral:**\n${project.descricao || 'N/A'}\n\n`;
    text += `## Funcionalidades\n\n`;
    features.forEach(f => {
      text += `### ${f.titulo}\n`;
      text += `- **Descrição:** ${f.descricao || 'N/A'}\n`;
      text += `- **Complexidade:** ${f.complexidade}\n\n`;
    });
    text += `**Prazo Estimado Total:** ${project.prazo_estimado_dias} dias úteis.\n`;
    return text;
  };

  if (isLoadingProject) return <ProjectDetailSkeleton />;

  return (
    <div className="p-4 lg:p-8 animate-slide-up">
      <Button variant="ghost" onClick={() => navigate('/')} className="mb-4 text-slate-600 hover:text-slate-900">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar para Projetos
      </Button>

      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">{project?.nome}</h1>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-2 text-slate-500">
            <p className="flex items-center gap-2"><User className="w-4 h-4" /> {project?.cliente_nome}</p>
            <p className="flex items-center gap-2"><Info className="w-4 h-4" /> {project?.descricao || "Sem descrição."}</p>
        </div>
      </header>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle>Funcionalidades</CardTitle>
            <CardDescription>Lista de todas as funcionalidades do escopo.</CardDescription>
          </div>
          <div className="flex gap-2">
            <Dialog open={isPromptOpen} onOpenChange={setPromptOpen}>
                <DialogTrigger asChild>
                <Button variant="outline">
                    <FileText className="w-4 h-4 mr-2" /> Gerar Prompt
                </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Prompt de Escopo</DialogTitle>
                </DialogHeader>
                <Textarea readOnly value={generatePromptText()} rows={15} className="font-mono text-sm bg-slate-50" />
                </DialogContent>
            </Dialog>
            <NewFeatureDialog projectId={project!.id}>
                <Button>
                    <PlusCircle className="w-4 h-4 mr-2" /> Adicionar
                </Button>
            </NewFeatureDialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {isLoadingFeatures && Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
            
            {!isLoadingFeatures && features && features.length > 0 ? (
              features.map((feature: Feature) => (
                <div key={feature.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div>
                    <p className="font-semibold text-slate-800">{feature.titulo}</p>
                    <p className="text-sm text-slate-600">{feature.descricao || "Sem descrição."}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${complexityConfig[feature.complexidade]?.classes || ''}`}>
                        {complexityConfig[feature.complexidade]?.label || feature.complexidade}
                    </span>
                    <Button variant="ghost" size="icon" onClick={() => deleteFeatureMutation.mutate(feature.id)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              !isLoadingFeatures && <p className="text-center text-slate-500 py-8">Nenhuma funcionalidade adicionada ainda.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const ProjectDetailSkeleton = () => (
  <div className="p-4 lg:p-8">
    <Skeleton className="h-8 w-40 mb-4" />
    <Skeleton className="h-10 w-1/2 mb-2" />
    <Skeleton className="h-6 w-1/3 mb-8" />
    <Card>
      <CardHeader><Skeleton className="h-8 w-48" /></CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </CardContent>
    </Card>
  </div>
);

export default ProjectDetail;
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProjectById, createFeature, deleteFeature } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, PlusCircle, Trash2, FileText, Calendar, User, BrainCircuit } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { showError, showSuccess } from '@/utils/toast';
import { Feature } from '@/types';
import { useState } from 'react';

const featureSchema = z.object({
  titulo: z.string().min(3, 'Título é obrigatório'),
  complexidade: z.enum(['simples', 'moderada', 'complexa', 'muito_complexa'], { required_error: 'Complexidade é obrigatória' }),
  descricao: z.string().optional(),
});

type FeatureFormData = z.infer<typeof featureSchema>;

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isAddFeatureOpen, setAddFeatureOpen] = useState(false);
  const [isPromptOpen, setPromptOpen] = useState(false);

  const { data: project, isLoading, isError } = useQuery({
    queryKey: ['project', id],
    queryFn: () => getProjectById(id!),
    enabled: !!id,
  });

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<FeatureFormData>({
    resolver: zodResolver(featureSchema),
  });

  const addFeatureMutation = useMutation<Feature, Error, FeatureFormData>({
    mutationFn: (data) => createFeature({ ...data, projeto_id: Number(id!) }),
    onSuccess: () => {
      showSuccess('Funcionalidade adicionada!');
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      reset();
      setAddFeatureOpen(false);
    },
    onError: (error) => showError(error.message),
  });

  const deleteFeatureMutation = useMutation({
    mutationFn: deleteFeature,
    onSuccess: () => {
      showSuccess('Funcionalidade removida!');
      queryClient.invalidateQueries({ queryKey: ['project', id] });
    },
    onError: (error) => showError(error.message),
  });

  const generatePromptText = () => {
    if (!project) return "";
    let text = `**PROJETO:** ${project.nome}\n`;
    text += `**CLIENTE:** ${project.cliente_nome}\n\n`;
    text += `**DESCRIÇÃO:**\n${project.descricao || 'N/A'}\n\n`;
    text += `**FUNCIONALIDADES:**\n`;
    project.funcionalidades?.forEach(f => {
      text += `- ${f.titulo} (Complexidade: ${f.complexidade})\n`;
    });
    text += `\n**PRAZO ESTIMADO:** ${project.prazo_estimado_dias} dias`;
    return text;
  };

  if (isLoading) return <ProjectDetailSkeleton />;
  if (isError) return <div className="p-8 text-center text-red-500">Erro ao carregar o projeto.</div>;

  return (
    <div className="p-4 lg:p-8 animate-slide-up">
      <Button variant="ghost" onClick={() => navigate('/')} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar para Projetos
      </Button>

      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">{project?.nome}</h1>
        <p className="text-gray-500 flex items-center gap-2 mt-1"><User className="w-4 h-4" /> {project?.cliente_nome}</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row justify-between items-center">
              <div>
                <CardTitle>Funcionalidades</CardTitle>
                <CardDescription>Lista de todas as funcionalidades do escopo.</CardDescription>
              </div>
              <Dialog open={isAddFeatureOpen} onOpenChange={setAddFeatureOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <PlusCircle className="w-4 h-4 mr-2" /> Adicionar
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Nova Funcionalidade</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit((data) => addFeatureMutation.mutate(data))} className="space-y-4">
                    <div>
                      <Label htmlFor="titulo">Título</Label>
                      <Input id="titulo" {...register('titulo')} />
                      {errors.titulo && <p className="text-red-500 text-sm mt-1">{errors.titulo.message}</p>}
                    </div>
                    <div>
                      <Label htmlFor="complexidade">Complexidade</Label>
                      <Controller
                        name="complexidade"
                        control={control}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione a complexidade" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="simples">Simples</SelectItem>
                              <SelectItem value="moderada">Moderada</SelectItem>
                              <SelectItem value="complexa">Complexa</SelectItem>
                              <SelectItem value="muito_complexa">Muito Complexa</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.complexidade && <p className="text-red-500 text-sm mt-1">{errors.complexidade.message}</p>}
                    </div>
                    <div>
                      <Label htmlFor="descricao">Descrição</Label>
                      <Textarea id="descricao" {...register('descricao')} />
                    </div>
                    <Button type="submit" disabled={addFeatureMutation.isPending}>
                      {addFeatureMutation.isPending ? 'Salvando...' : 'Salvar'}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {project?.funcionalidades && project.funcionalidades.length > 0 ? (
                  project.funcionalidades.map((feature: Feature) => (
                    <div key={feature.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-semibold">{feature.titulo}</p>
                        <p className="text-sm text-gray-500 capitalize">{feature.complexidade}</p>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => deleteFeatureMutation.mutate(feature.id)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-8">Nenhuma funcionalidade adicionada ainda.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Detalhes do Projeto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-primary-500" />
                <div>
                  <p className="text-sm text-gray-500">Prazo Estimado</p>
                  <p className="font-bold text-lg">{project?.prazo_estimado_dias} dias</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <BrainCircuit className="w-5 h-5 text-primary-500" />
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="font-bold text-lg capitalize">{project?.status.replace('_', ' ')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Dialog open={isPromptOpen} onOpenChange={setPromptOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full">
                <FileText className="w-4 h-4 mr-2" /> Gerar Prompt de Escopo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Prompt de Escopo</DialogTitle>
              </DialogHeader>
              <Textarea readOnly value={generatePromptText()} rows={15} className="font-mono text-sm" />
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

const ProjectDetailSkeleton = () => (
  <div className="p-4 lg:p-8">
    <Skeleton className="h-8 w-40 mb-4" />
    <Skeleton className="h-10 w-1/2 mb-2" />
    <Skeleton className="h-6 w-1/3 mb-8" />
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader><Skeleton className="h-8 w-48" /></CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </CardContent>
        </Card>
      </div>
      <div className="space-y-6">
        <Card>
          <CardHeader><Skeleton className="h-8 w-32" /></CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </CardContent>
        </Card>
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  </div>
);

export default ProjectDetail;
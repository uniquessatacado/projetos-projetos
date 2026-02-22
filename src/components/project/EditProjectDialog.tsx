import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { updateProject } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { showError, showSuccess } from '@/utils/toast';
import { Project } from '@/types';
import { parseMetadata, getCleanDescription, stringifyMetadata } from '@/lib/meta-utils';

const projectSchema = z.object({
  nome: z.string().min(3, { message: 'O nome é obrigatório.' }),
  cliente_nome: z.string().min(3, { message: 'O cliente é obrigatório.' }),
  descricao_limpa: z.string().optional(),
  prazo_entrega: z.string().optional(),
});

type ProjectFormData = z.infer<typeof projectSchema>;

interface EditProjectDialogProps {
  project: Project;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditProjectDialog = ({ project, open, onOpenChange }: EditProjectDialogProps) => {
  const queryClient = useQueryClient();
  const meta = parseMetadata<any>(project.descricao);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      nome: project.nome,
      cliente_nome: project.cliente_nome,
      descricao_limpa: getCleanDescription(project.descricao),
      prazo_entrega: meta.prazo_entrega || '',
    }
  });

  useEffect(() => {
    if (open) {
      reset({
        nome: project.nome,
        cliente_nome: project.cliente_nome,
        descricao_limpa: getCleanDescription(project.descricao),
        prazo_entrega: meta.prazo_entrega || '',
      });
    }
  }, [open, project, reset]);

  const mutation = useMutation({
    mutationFn: (data: ProjectFormData) => {
      const updatedDesc = stringifyMetadata(data.descricao_limpa || '', { ...meta, prazo_entrega: data.prazo_entrega });
      return updateProject(project.id, { 
        nome: data.nome, 
        cliente_nome: data.cliente_nome, 
        descricao: updatedDesc 
      });
    },
    onSuccess: () => {
      showSuccess('Projeto atualizado!');
      queryClient.invalidateQueries({ queryKey: ['project', project.id.toString()] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      onOpenChange(false);
    },
    onError: (error: Error) => showError(error.message),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Projeto</DialogTitle>
          <DialogDescription>Atualize os dados básicos do escopo.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
          <div className="space-y-2">
            <Label>Nome do Projeto</Label>
            <Input {...register('nome')} />
          </div>
          <div className="space-y-2">
            <Label>Cliente</Label>
            <Input {...register('cliente_nome')} />
          </div>
          <div className="space-y-2">
            <Label>Prazo de Entrega</Label>
            <Input type="date" {...register('prazo_entrega')} />
          </div>
          <div className="space-y-2">
            <Label>Descrição</Label>
            <Textarea {...register('descricao_limpa')} />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={mutation.isPending}>Salvar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
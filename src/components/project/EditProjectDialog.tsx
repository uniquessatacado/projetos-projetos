"use client";

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { showError, showSuccess } from '@/utils/toast';
import { Project } from '@/types';
import { parseMetadata, getCleanDescription, stringifyMetadata } from '@/lib/meta-utils';
import { CircleDollarSign } from 'lucide-react';

const projectSchema = z.object({
  nome: z.string().min(3, { message: 'O nome é obrigatório.' }),
  cliente_nome: z.string().min(3, { message: 'O cliente é obrigatório.' }),
  descricao_limpa: z.string().optional(),
  prazo_entrega: z.string().optional(),
  valor_fechado: z.string().optional(),
  forma_pagamento: z.string().optional(),
  indicacao: z.string().optional(),
  comissao_valor: z.string().optional(),
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

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      nome: project.nome,
      cliente_nome: project.cliente_nome,
      descricao_limpa: getCleanDescription(project.descricao),
      prazo_entrega: meta.prazo_entrega || '',
      valor_fechado: meta.valor_fechado || '',
      forma_pagamento: meta.forma_pagamento || 'a_vista',
      indicacao: meta.indicacao || '',
      comissao_valor: meta.comissao_valor || '',
    }
  });

  useEffect(() => {
    if (open) {
      const currentMeta = parseMetadata<any>(project.descricao);
      reset({
        nome: project.nome,
        cliente_nome: project.cliente_nome,
        descricao_limpa: getCleanDescription(project.descricao),
        prazo_entrega: currentMeta.prazo_entrega || '',
        valor_fechado: currentMeta.valor_fechado || '',
        forma_pagamento: currentMeta.forma_pagamento || 'a_vista',
        indicacao: currentMeta.indicacao || '',
        comissao_valor: currentMeta.comissao_valor || '',
      });
    }
  }, [open, project, reset]);

  const mutation = useMutation({
    mutationFn: (data: ProjectFormData) => {
      const updatedMeta = { 
        ...meta, 
        prazo_entrega: data.prazo_entrega,
        valor_fechado: data.valor_fechado,
        forma_pagamento: data.forma_pagamento,
        indicacao: data.indicacao,
        comissao_valor: data.comissao_valor
      };
      const updatedDesc = stringifyMetadata(data.descricao_limpa || '', updatedMeta);
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
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Projeto</DialogTitle>
          <DialogDescription>Atualize os dados e negociação.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-5 pt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nome do Projeto</Label>
              <Input {...register('nome')} />
            </div>
            <div className="space-y-2">
              <Label>Cliente</Label>
              <Input {...register('cliente_nome')} />
            </div>
          </div>

          <div className="p-4 bg-indigo-50/30 rounded-xl border border-indigo-100 space-y-4">
             <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm">
                <CircleDollarSign className="w-4 h-4" /> Gestão Comercial
             </div>
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Valor do Contrato</Label>
                    <Input type="number" step="0.01" {...register('valor_fechado')} />
                </div>
                <div className="space-y-2">
                    <Label>Prazo de Entrega</Label>
                    <Input type="date" {...register('prazo_entrega')} />
                </div>
             </div>
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Indicação</Label>
                    <Input {...register('indicacao')} />
                </div>
                <div className="space-y-2">
                    <Label>Comissão Parceiro</Label>
                    <Input type="number" step="0.01" {...register('comissao_valor')} />
                </div>
             </div>
          </div>

          <div className="space-y-2">
            <Label>Notas do Escopo</Label>
            <Textarea {...register('descricao_limpa')} rows={3} />
          </div>
          
          <DialogFooter>
            <Button type="submit" className="bg-indigo-600" disabled={mutation.isPending}>Salvar Alterações</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
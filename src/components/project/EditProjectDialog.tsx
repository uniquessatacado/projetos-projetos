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
import { CircleDollarSign, UserPlus } from 'lucide-react';

const projectSchema = z.object({
  nome: z.string().min(3),
  cliente_nome: z.string().min(3),
  descricao_limpa: z.string().optional(),
  prazo_entrega: z.string().optional(),
  valor_fechado: z.string().optional(),
  forma_pagamento: z.string().optional(),
  projeto_parcelas: z.string().optional(),
  indicacao_nome: z.string().optional(),
  indicacao_whatsapp: z.string().optional(),
  comissao_tipo: z.string().optional(),
  comissao_valor_base: z.string().optional(),
  comissao_pagamento: z.string().optional(),
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

  const { register, handleSubmit, reset, setValue, watch } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
  });

  const formaPagamento = watch('forma_pagamento');

  useEffect(() => {
    if (open) {
      reset({
        nome: project.nome,
        cliente_nome: project.cliente_nome,
        descricao_limpa: getCleanDescription(project.descricao),
        prazo_entrega: meta.prazo_entrega || '',
        valor_fechado: meta.valor_fechado || '',
        forma_pagamento: meta.forma_pagamento || 'a_vista',
        projeto_parcelas: meta.projeto_parcelas || '1',
        indicacao_nome: meta.indicacao_nome || '',
        indicacao_whatsapp: meta.indicacao_whatsapp || '',
        comissao_tipo: meta.comissao_tipo || 'fixo',
        comissao_valor_base: meta.comissao_valor_base || '',
        comissao_pagamento: meta.comissao_pagamento || 'unico',
      });
    }
  }, [open, project, reset]);

  const mutation = useMutation({
    mutationFn: (data: ProjectFormData) => {
      const updatedMeta = { 
        ...meta, 
        ...data,
      };
      // A descrição limpa não vai para o JSON, ela é a base do texto
      const cleanDesc = data.descricao_limpa || '';
      const { descricao_limpa, ...metaWithoutDesc } = updatedMeta;
      
      const updatedDesc = stringifyMetadata(cleanDesc, metaWithoutDesc);
      
      return updateProject(project.id, { 
        nome: data.nome, 
        cliente_nome: data.cliente_nome, 
        descricao: updatedDesc 
      });
    },
    onSuccess: () => {
      showSuccess('Dados atualizados!');
      queryClient.invalidateQueries({ queryKey: ['project', project.id.toString()] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      onOpenChange(false);
    },
    onError: (error: Error) => showError(error.message),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Negociação</DialogTitle>
          <DialogDescription>Atualize os valores e a inteligência de comissão.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><Label>Projeto</Label><Input {...register('nome')} /></div>
                <div className="space-y-1"><Label>Cliente</Label><Input {...register('cliente_nome')} /></div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl space-y-4">
                <Label className="flex items-center gap-2"><CircleDollarSign className="w-4 h-4" /> Pagamento</Label>
                <div className="grid grid-cols-3 gap-4">
                    <Input type="number" step="0.01" {...register('valor_fechado')} placeholder="Total" />
                    <Select onValueChange={(v) => setValue('forma_pagamento', v)} defaultValue={meta.forma_pagamento || 'a_vista'}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="a_vista">À Vista</SelectItem>
                            <SelectItem value="parcelado">Parcelado</SelectItem>
                        </SelectContent>
                    </Select>
                    {formaPagamento === 'parcelado' && <Input type="number" {...register('projeto_parcelas')} />}
                </div>
            </div>

            <div className="p-4 bg-amber-50 rounded-xl space-y-4">
                <Label className="flex items-center gap-2"><UserPlus className="w-4 h-4" /> Comissão Parceiro</Label>
                <div className="grid grid-cols-2 gap-4">
                    <Input {...register('indicacao_nome')} placeholder="Nome Parceiro" />
                    <Input {...register('indicacao_whatsapp')} placeholder="WhatsApp" />
                </div>
                <div className="grid grid-cols-3 gap-4">
                    <Select onValueChange={(v:any) => setValue('comissao_tipo', v)} defaultValue={meta.comissao_tipo || 'fixo'}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="fixo">Fixo</SelectItem>
                            <SelectItem value="porcentagem">%</SelectItem>
                        </SelectContent>
                    </Select>
                    <Input type="number" step="0.01" {...register('comissao_valor_base')} />
                    <Select onValueChange={(v:any) => setValue('comissao_pagamento', v)} defaultValue={meta.comissao_pagamento || 'unico'}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="unico">Integral</SelectItem>
                            <SelectItem value="proporcional">Proporcional</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-1"><Label>Notas</Label><Textarea {...register('descricao_limpa')} /></div>
            <DialogFooter><Button type="submit">Salvar Alterações</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
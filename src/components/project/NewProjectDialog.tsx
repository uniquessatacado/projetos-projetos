"use client";

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createProject } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, CircleDollarSign, UserPlus, Phone } from 'lucide-react';
import { showError, showSuccess } from '@/utils/toast';
import { Project } from '@/types';
import { stringifyMetadata } from '@/lib/meta-utils';

const projectSchema = z.object({
  nome: z.string().min(3, { message: 'O nome do projeto é obrigatório.' }),
  cliente_nome: z.string().min(3, { message: 'O nome do cliente é obrigatório.' }),
  cliente_whatsapp: z.string().optional(),
  descricao: z.string().optional(),
  valor_fechado: z.string().optional(),
  forma_pagamento: z.string().optional(),
  indicacao_nome: z.string().optional(),
  indicacao_whatsapp: z.string().optional(),
  comissao_valor: z.string().optional(),
});

type ProjectFormData = z.infer<typeof projectSchema>;

export const NewProjectDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      forma_pagamento: 'a_vista'
    }
  });

  const mutation = useMutation<Project, Error, ProjectFormData>({
    mutationFn: (data) => {
      const metadata = {
        valor_fechado: data.valor_fechado,
        forma_pagamento: data.forma_pagamento,
        indicacao_nome: data.indicacao_nome,
        indicacao_whatsapp: data.indicacao_whatsapp,
        cliente_whatsapp: data.cliente_whatsapp,
        comissao_valor: data.comissao_valor,
        status: 'aguardando_inicio'
      };
      
      const fullDescription = stringifyMetadata(data.descricao || '', metadata);
      
      return createProject({
        nome: data.nome,
        cliente_nome: data.cliente_nome,
        descricao: fullDescription
      });
    },
    onSuccess: () => {
      showSuccess('Projeto comercial criado!');
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setIsOpen(false);
      reset();
    },
    onError: (error) => showError(error.message),
  });

  const onSubmit = (data: ProjectFormData) => mutation.mutate(data);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-glow font-bold">
          <PlusCircle className="w-5 h-5 mr-2" />
          Novo Projeto
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Escopo Comercial</DialogTitle>
          <DialogDescription>
            Registre o projeto e os detalhes da negociação.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome do Projeto</Label>
              <Input id="nome" {...register('nome')} placeholder="Ex: E-commerce Peramix" />
              {errors.nome && <p className="text-red-500 text-xs">{errors.nome.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="cliente_nome">Cliente</Label>
              <Input id="cliente_nome" {...register('cliente_nome')} placeholder="Nome do Cliente" />
              {errors.cliente_nome && <p className="text-red-500 text-xs">{errors.cliente_nome.message}</p>}
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label className="flex items-center gap-1"><Phone className="w-3 h-3" /> WhatsApp do Cliente</Label>
              <Input {...register('cliente_whatsapp')} placeholder="Ex: 11999999999" />
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-4">
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm mb-2">
              <CircleDollarSign className="w-4 h-4" /> Detalhes Financeiros
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Valor Fechado (R$)</Label>
                <Input type="number" step="0.01" {...register('valor_fechado')} placeholder="0,00" />
              </div>
              <div className="space-y-2">
                <Label>Forma de Pagamento</Label>
                <Select onValueChange={(v) => setValue('forma_pagamento', v)} defaultValue="a_vista">
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="a_vista">À Vista</SelectItem>
                    <SelectItem value="parcelado">Parcelado</SelectItem>
                    <SelectItem value="50_entrada_50_entrega">50% Entrada / 50% Entrega</SelectItem>
                    <SelectItem value="recorrente">Mensalidade/Recorrente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200">
                <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm mb-4">
                  <UserPlus className="w-4 h-4" /> Indicação / Parceiro
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nome do Indicador</Label>
                    <Input {...register('indicacao_nome')} placeholder="Quem indicou?" />
                  </div>
                  <div className="space-y-2">
                    <Label>WhatsApp Indicador</Label>
                    <Input {...register('indicacao_whatsapp')} placeholder="Contato do parceiro" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Valor da Comissão (R$)</Label>
                    <Input type="number" step="0.01" {...register('comissao_valor')} placeholder="0,00" />
                  </div>
                </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição Técnica / Notas</Label>
            <Textarea id="descricao" {...register('descricao')} className="min-h-[80px]" />
          </div>

          <DialogFooter>
            <Button type="submit" className="w-full md:w-auto bg-indigo-600" disabled={mutation.isPending}>
              {mutation.isPending ? 'Salvando...' : 'Criar Projeto'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
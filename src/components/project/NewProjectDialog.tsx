"use client";

import { useState, useMemo } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createProject, getProjects } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, CircleDollarSign, UserPlus, Repeat, Rocket } from 'lucide-react';
import { showError, showSuccess } from '@/utils/toast';
import { Project } from '@/types';
import { stringifyMetadata, parseMetadata } from '@/lib/meta-utils';
import { SmartCombobox } from '@/components/ui/smart-combobox';

const projectSchema = z.object({
  nome: z.string().min(3, { message: 'O nome do projeto é obrigatório.' }),
  cliente_nome: z.string().min(2, { message: 'Selecione ou digite um cliente.' }),
  cliente_whatsapp: z.string().optional(),
  descricao: z.string().optional(),
  valor_fechado: z.string().optional(),
  forma_pagamento: z.string().optional(),
  projeto_parcelas: z.string().optional(),
  indicacao_nome: z.string().optional(),
  indicacao_whatsapp: z.string().optional(),
  comissao_tipo: z.enum(['fixo', 'porcentagem']).default('fixo'),
  comissao_valor_base: z.string().optional(),
  comissao_pagamento: z.enum(['unico', 'proporcional']).default('unico'),
  modelo_negocio: z.enum(['exclusivo', 'assinatura']).default('exclusivo'),
  valor_assinatura: z.string().optional(),
});

type ProjectFormData = z.infer<typeof projectSchema>;

export const NewProjectDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: projects } = useQuery({
    queryKey: ['projects'],
    queryFn: getProjects,
  });

  const { clientsList, partnersList } = useMemo(() => {
    if (!projects) return { clientsList: [], partnersList: [] };
    const clients = new Map();
    const partners = new Map();
    projects.forEach(p => {
      const meta = parseMetadata<any>(p.descricao);
      if (p.cliente_nome) clients.set(p.cliente_nome, { value: p.cliente_nome, label: p.cliente_nome, whatsapp: meta.cliente_whatsapp });
      if (meta.indicacao_nome) partners.set(meta.indicacao_nome, { value: meta.indicacao_nome, label: meta.indicacao_nome, whatsapp: meta.indicacao_whatsapp });
    });
    return { clientsList: Array.from(clients.values()), partnersList: Array.from(partners.values()) };
  }, [projects]);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      forma_pagamento: 'a_vista',
      projeto_parcelas: '1',
      comissao_tipo: 'fixo',
      comissao_pagamento: 'unico',
      modelo_negocio: 'exclusivo'
    }
  });

  const modeloNegocio = watch('modelo_negocio');
  const comissaoTipo = watch('comissao_tipo');
  const formaPagamento = watch('forma_pagamento');
  const clienteNome = watch('cliente_nome');
  const parceiroNome = watch('indicacao_nome');

  const mutation = useMutation<Project, Error, ProjectFormData>({
    mutationFn: (data) => {
      const metadata = {
        valor_fechado: data.valor_fechado,
        forma_pagamento: data.forma_pagamento,
        projeto_parcelas: data.projeto_parcelas,
        indicacao_nome: data.indicacao_nome,
        indicacao_whatsapp: data.indicacao_whatsapp,
        cliente_whatsapp: data.cliente_whatsapp,
        comissao_tipo: data.comissao_tipo,
        comissao_valor_base: data.comissao_valor_base,
        comissao_pagamento: data.comissao_pagamento,
        modelo_negocio: data.modelo_negocio,
        valor_assinatura: data.valor_assinatura,
        status: 'aguardando_inicio'
      };
      const fullDescription = stringifyMetadata(data.descricao || '', metadata);
      return createProject({ nome: data.nome, cliente_nome: data.cliente_nome, descricao: fullDescription });
    },
    onSuccess: () => {
      showSuccess('Projeto registrado!');
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
          <PlusCircle className="w-5 h-5 mr-2" /> Novo Projeto
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Escopo Comercial</DialogTitle>
          <DialogDescription>Defina o modelo de negócio e valores.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nome do Projeto</Label>
              <Input {...register('nome')} placeholder="Ex: SaaS Financeiro" />
            </div>
            <div className="space-y-2">
              <Label>Cliente</Label>
              <SmartCombobox 
                options={clientsList}
                value={clienteNome}
                onSelect={(val, wa) => {
                    setValue('cliente_nome', val);
                    if (wa) setValue('cliente_whatsapp', wa);
                }}
                placeholder="Selecionar Cliente"
                emptyText="Cliente não encontrado."
              />
            </div>
          </div>

          <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 space-y-4">
            <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm mb-2">
              <Rocket className="w-4 h-4" /> Modelo de Entrega
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Tipo de Contrato</Label>
                    <Select onValueChange={(v: any) => setValue('modelo_negocio', v)} defaultValue="exclusivo">
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="exclusivo">Sistema Exclusivo (Venda Única)</SelectItem>
                            <SelectItem value="assinatura">Modelo de Assinatura (SaaS/Recorrente)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                {modeloNegocio === 'assinatura' && (
                    <div className="space-y-2 animate-fade-in">
                        <Label>Valor Mensalidade (R$)</Label>
                        <Input type="number" step="0.01" {...register('valor_assinatura')} placeholder="0,00" />
                        <p className="text-[10px] text-slate-500 font-medium italic">Pode definir depois se preferir.</p>
                    </div>
                )}
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-4">
            <div className="flex items-center gap-2 text-slate-700 font-bold text-sm mb-2">
              <CircleDollarSign className="w-4 h-4" /> Setup / Implementação
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Valor Total (R$)</Label>
                <Input type="number" step="0.01" {...register('valor_fechado')} placeholder="0,00" />
              </div>
              <div className="space-y-2">
                <Label>Forma</Label>
                <Select onValueChange={(v) => setValue('forma_pagamento', v)} defaultValue="a_vista">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="a_vista">À Vista</SelectItem>
                    <SelectItem value="parcelado">Parcelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {formaPagamento === 'parcelado' && (
                <div className="space-y-2 animate-fade-in">
                  <Label>Parcelas Setup</Label>
                  <Input type="number" {...register('projeto_parcelas')} min="1" />
                </div>
              )}
            </div>
          </div>

          <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-100 space-y-4">
                <div className="flex items-center gap-2 text-amber-700 font-bold text-sm mb-2">
                  <UserPlus className="w-4 h-4" /> Comissão Parceiro
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Parceiro</Label>
                    <SmartCombobox 
                        options={partnersList}
                        value={parceiroNome || ''}
                        onSelect={(val, wa) => {
                            setValue('indicacao_nome', val);
                            if (wa) setValue('indicacao_whatsapp', wa);
                        }}
                        placeholder="Selecionar Parceiro"
                        emptyText="Parceiro não encontrado."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>WhatsApp</Label>
                    <Input {...register('indicacao_whatsapp')} placeholder="Contato" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-amber-100 pt-4">
                  <div className="space-y-2">
                    <Label>Tipo</Label>
                    <Select onValueChange={(v: any) => setValue('comissao_tipo', v)} defaultValue="fixo">
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="fixo">Fixo</SelectItem><SelectItem value="porcentagem">%</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Valor/Base</Label>
                    <Input type="number" step="0.01" {...register('comissao_valor_base')} placeholder="0,00" />
                  </div>
                  <div className="space-y-2">
                    <Label>Fluxo</Label>
                    <Select onValueChange={(v: any) => setValue('comissao_pagamento', v)} defaultValue="unico">
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="unico">Integral</SelectItem><SelectItem value="proporcional">Parcelado</SelectItem></SelectContent>
                    </Select>
                  </div>
                </div>
          </div>

          <DialogFooter>
            <Button type="submit" className="w-full bg-indigo-600" disabled={mutation.isPending}>
              {mutation.isPending ? 'Processando...' : 'Registrar Projeto'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
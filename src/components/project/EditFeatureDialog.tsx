import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { updateFeature } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { showError, showSuccess } from '@/utils/toast';
import { Feature } from '@/types';
import { parseMetadata, getCleanDescription, stringifyMetadata } from '@/lib/meta-utils';

const featureSchema = z.object({
  titulo: z.string().min(3),
  complexidade: z.string(),
  descricao_limpa: z.string().optional(),
  observacoes: z.string().optional(),
});

type FeatureFormData = z.infer<typeof featureSchema>;

interface EditFeatureDialogProps {
  feature: Feature;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditFeatureDialog = ({ feature, open, onOpenChange }: EditFeatureDialogProps) => {
  const queryClient = useQueryClient();
  const meta = parseMetadata<any>(feature.descricao);

  const { register, handleSubmit, control, reset } = useForm<FeatureFormData>({
    resolver: zodResolver(featureSchema),
    defaultValues: {
      titulo: feature.titulo,
      complexidade: feature.complexidade,
      descricao_limpa: getCleanDescription(feature.descricao),
      observacoes: meta.observacoes || '',
    }
  });

  useEffect(() => {
    if (open) {
      reset({
        titulo: feature.titulo,
        complexidade: feature.complexidade,
        descricao_limpa: getCleanDescription(feature.descricao),
        observacoes: meta.observacoes || '',
      });
    }
  }, [open, feature, reset]);

  const mutation = useMutation({
    mutationFn: (data: FeatureFormData) => {
      const updatedDesc = stringifyMetadata(data.descricao_limpa || '', { ...meta, observacoes: data.observacoes });
      return updateFeature(feature.id, { 
        titulo: data.titulo, 
        complexidade: data.complexidade, 
        descricao: updatedDesc 
      });
    },
    onSuccess: () => {
      showSuccess('Funcionalidade atualizada!');
      queryClient.invalidateQueries({ queryKey: ['features', feature.projeto_id] });
      onOpenChange(false);
    },
    onError: (error: Error) => showError(error.message),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Editar Funcionalidade</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
          <div>
            <Label>Título</Label>
            <Input {...register('titulo')} />
          </div>
          <div>
            <Label>Complexidade</Label>
            <Controller
              name="complexidade"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="simples">Simples</SelectItem>
                    <SelectItem value="moderada">Moderada</SelectItem>
                    <SelectItem value="complexa">Complexa</SelectItem>
                    <SelectItem value="muito_complexa">Muito Complexa</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div>
            <Label>Descrição</Label>
            <Textarea {...register('descricao_limpa')} />
          </div>
          <div>
            <Label>Observações Internas</Label>
            <Textarea {...register('observacoes')} />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={mutation.isPending}>Salvar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createFeature } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { showError, showSuccess } from '@/utils/toast';
import { Feature } from '@/types';

const featureSchema = z.object({
  titulo: z.string().min(3, { message: 'O título é obrigatório.' }),
  complexidade: z.enum(['simples', 'moderada', 'complexa', 'muito_complexa', 'critica'], { required_error: 'A complexidade é obrigatória.' }),
  descricao: z.string().optional(),
  categoria: z.string().optional(),
});

type FeatureFormData = z.infer<typeof featureSchema>;

interface NewFeatureDialogProps {
  projectId: number;
  children: React.ReactNode;
}

export const NewFeatureDialog = ({ projectId, children }: NewFeatureDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<FeatureFormData>({
    resolver: zodResolver(featureSchema),
  });

  const mutation = useMutation<Feature, Error, FeatureFormData>({
    mutationFn: (formData) => createFeature({
        titulo: formData.titulo,
        complexidade: formData.complexidade,
        descricao: formData.descricao,
        categoria: formData.categoria,
        projeto_id: projectId,
    }),
    onSuccess: () => {
      showSuccess('Funcionalidade adicionada!');
      queryClient.invalidateQueries({ queryKey: ['features', projectId] });
      setIsOpen(false);
      reset();
    },
    onError: (error: Error) => {
      showError(error.message);
    },
  });

  const onSubmit = (data: FeatureFormData) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Adicionar Funcionalidade</DialogTitle>
          <DialogDescription>
            Descreva a nova funcionalidade para o escopo do projeto.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <div>
            <Label htmlFor="titulo">Título da Funcionalidade</Label>
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
                    <SelectItem value="critica">Crítica</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.complexidade && <p className="text-red-500 text-sm mt-1">{errors.complexidade.message}</p>}
          </div>
          <div>
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea id="descricao" {...register('descricao')} placeholder="Detalhe o que esta funcionalidade deve fazer..." />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Adicionando...' : 'Adicionar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
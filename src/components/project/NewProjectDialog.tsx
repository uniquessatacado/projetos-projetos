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
import { PlusCircle } from 'lucide-react';
import { showError, showSuccess } from '@/utils/toast';
import { Project } from '@/types';

const projectSchema = z.object({
  nome: z.string().min(3, { message: 'O nome do projeto é obrigatório.' }),
  cliente_nome: z.string().min(3, { message: 'O nome do cliente é obrigatório.' }),
  descricao: z.string().optional(),
});

type ProjectFormData = z.infer<typeof projectSchema>;

export const NewProjectDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
  });

  const mutation = useMutation<Project, Error, ProjectFormData>({
    mutationFn: createProject,
    onSuccess: () => {
      showSuccess('Projeto criado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setIsOpen(false);
      reset();
    },
    onError: (error) => {
      showError(error.message);
    },
  });

  const onSubmit = (data: ProjectFormData) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary-600 hover:bg-primary-700">
          <PlusCircle className="w-5 h-5 mr-2" />
          Novo Projeto
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Criar Novo Projeto</DialogTitle>
          <DialogDescription>
            Preencha as informações abaixo para iniciar um novo escopo.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nome" className="text-right">
                Projeto
              </Label>
              <Input id="nome" {...register('nome')} className="col-span-3" />
              {errors.nome && <p className="col-span-4 text-red-500 text-sm text-right">{errors.nome.message}</p>}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="cliente_nome" className="text-right">
                Cliente
              </Label>
              <Input id="cliente_nome" {...register('cliente_nome')} className="col-span-3" />
              {errors.cliente_nome && <p className="col-span-4 text-red-500 text-sm text-right">{errors.cliente_nome.message}</p>}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="descricao" className="text-right">
                Descrição
              </Label>
              <Textarea id="descricao" {...register('descricao')} className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Criando...' : 'Criar Projeto'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
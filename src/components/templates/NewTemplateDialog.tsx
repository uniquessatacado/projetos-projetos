import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createTemplate, Template } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle } from 'lucide-react';
import { showError, showSuccess } from '@/utils/toast';

const templateSchema = z.object({
  nome: z.string().min(3, { message: 'O nome é obrigatório.' }),
  descricao: z.string().optional(),
});

type TemplateFormData = z.infer<typeof templateSchema>;

export const NewTemplateDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<TemplateFormData>({
    resolver: zodResolver(templateSchema),
  });

  const mutation = useMutation<Template, Error, TemplateFormData>({
    mutationFn: (data) => createTemplate({ nome: data.nome, descricao: data.descricao || '' }),
    onSuccess: () => {
      showSuccess('Template criado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      setIsOpen(false);
      reset();
    },
    onError: (error) => {
      showError(error.message);
    },
  });

  const onSubmit = (data: TemplateFormData) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary-600 hover:bg-primary-700">
          <PlusCircle className="w-5 h-5 mr-2" />
          Novo Template
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Criar Novo Template</DialogTitle>
          <DialogDescription>
            Crie um modelo base para futuros projetos.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nome" className="text-right">
                Nome
              </Label>
              <Input id="nome" {...register('nome')} className="col-span-3" />
              {errors.nome && <p className="col-span-4 text-red-500 text-sm text-right">{errors.nome.message}</p>}
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
              {mutation.isPending ? 'Criando...' : 'Criar Template'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
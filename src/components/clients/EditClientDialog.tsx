import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const clientSchema = z.object({
  new_name: z.string().min(2, { message: 'O nome é obrigatório.' }),
  new_whatsapp: z.string().optional(),
});

type ClientFormData = z.infer<typeof clientSchema>;

interface EditClientDialogProps {
  client: { nome: string; whatsapp: string; };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: ClientFormData) => void;
  isSaving: boolean;
}

export const EditClientDialog = ({ client, open, onOpenChange, onSave, isSaving }: EditClientDialogProps) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
  });

  useEffect(() => {
    if (client) {
      reset({
        new_name: client.nome,
        new_whatsapp: client.whatsapp,
      });
    }
  }, [client, reset]);

  const onSubmit = (data: ClientFormData) => {
    onSave(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Cliente</DialogTitle>
          <DialogDescription>
            Atualize as informações do cliente. Isso será refletido em todos os projetos associados.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <div>
            <Label htmlFor="new_name">Nome do Cliente</Label>
            <Input id="new_name" {...register('new_name')} />
            {errors.new_name && <p className="text-red-500 text-sm mt-1">{errors.new_name.message}</p>}
          </div>
          <div>
            <Label htmlFor="new_whatsapp">WhatsApp</Label>
            <Input id="new_whatsapp" {...register('new_whatsapp')} placeholder="(XX) XXXXX-XXXX" />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
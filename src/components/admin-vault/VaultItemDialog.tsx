import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AdminVaultItem } from '@/types';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { KeyRound, StickyNote, User } from 'lucide-react';

const vaultItemSchema = z.object({
  title: z.string().min(3, { message: 'O título é obrigatório.' }),
  item_type: z.enum(['login', 'api', 'note']),
  link: z.string().optional(),
  username: z.string().optional(),
  secret_value: z.string().optional(),
});

type VaultItemFormData = z.infer<typeof vaultItemSchema>;

interface VaultItemDialogProps {
  item?: AdminVaultItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: VaultItemFormData, id?: number) => void;
  isSaving: boolean;
}

export const VaultItemDialog = ({ item, open, onOpenChange, onSave, isSaving }: VaultItemDialogProps) => {
  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<VaultItemFormData>({
    resolver: zodResolver(vaultItemSchema),
  });

  const itemType = watch('item_type');

  useEffect(() => {
    if (open) {
      reset({
        title: item?.title || '',
        item_type: item?.item_type || 'login',
        link: item?.link || '',
        username: item?.username || '',
        secret_value: item?.secret_value || '',
      });
    }
  }, [open, item, reset]);

  const onSubmit = (data: VaultItemFormData) => {
    onSave(data, item?.id);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{item ? 'Editar Item' : 'Adicionar ao Cofre'}</DialogTitle>
          <DialogDescription>
            Salve suas credenciais e notas de forma segura.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label>Tipo de Item</Label>
            <ToggleGroup 
              type="single" 
              defaultValue={itemType || 'login'} 
              onValueChange={(value: 'login' | 'api' | 'note') => value && setValue('item_type', value)}
              className="w-full grid grid-cols-3"
            >
              <ToggleGroupItem value="login" className="flex flex-col h-16 gap-1"><User className="w-5 h-5" /> <span className="text-xs">Login</span></ToggleGroupItem>
              <ToggleGroupItem value="api" className="flex flex-col h-16 gap-1"><KeyRound className="w-5 h-5" /> <span className="text-xs">API Key</span></ToggleGroupItem>
              <ToggleGroupItem value="note" className="flex flex-col h-16 gap-1"><StickyNote className="w-5 h-5" /> <span className="text-xs">Nota</span></ToggleGroupItem>
            </ToggleGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input id="title" {...register('title')} placeholder="Ex: Acesso ao Servidor Principal" />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
          </div>

          {itemType === 'note' ? (
            <div className="space-y-2">
              <Label htmlFor="secret_value">Conteúdo da Nota</Label>
              <Textarea id="secret_value" {...register('secret_value')} className="min-h-[120px] font-mono" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="link">URL / Host</Label>
                <Input id="link" {...register('link')} placeholder="https://meusite.com/admin" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Usuário / E-mail</Label>
                  <Input id="username" {...register('username')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secret_value">{itemType === 'login' ? 'Senha' : 'Chave da API'}</Label>
                  <Input id="secret_value" {...register('secret_value')} />
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="submit" disabled={isSaving} className="bg-indigo-600 hover:bg-indigo-700">
              {isSaving ? 'Salvando...' : 'Salvar no Cofre'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
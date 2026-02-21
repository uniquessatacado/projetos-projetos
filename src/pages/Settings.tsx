import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSettings, saveSetting } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { showSuccess, showError } from "@/utils/toast";
import { Skeleton } from "@/components/ui/skeleton";
import { DeployApiButton } from "@/components/DeployApiButton";

interface SettingsForm {
  empresa_nome: string;
  valor_hora: string;
  moeda: string;
}

const Settings = () => {
  const queryClient = useQueryClient();
  const { register, handleSubmit, setValue } = useForm<SettingsForm>();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: getSettings,
  });

  useEffect(() => {
    if (settings) {
      settings.forEach(s => {
        if (s.chave === 'empresa_nome') setValue('empresa_nome', s.valor);
        if (s.chave === 'valor_hora') setValue('valor_hora', s.valor);
        if (s.chave === 'moeda') setValue('moeda', s.valor);
      });
    }
  }, [settings, setValue]);

  const mutation = useMutation({
    mutationFn: async (data: SettingsForm) => {
        await saveSetting({ chave: 'empresa_nome', valor: data.empresa_nome });
        await saveSetting({ chave: 'valor_hora', valor: data.valor_hora });
        await saveSetting({ chave: 'moeda', valor: data.moeda });
    },
    onSuccess: () => {
      showSuccess('Configurações salvas!');
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
    onError: (error: Error) => showError(error.message),
  });

  const onSubmit = (data: SettingsForm) => {
    mutation.mutate(data);
  };

  if (isLoading) return <div className="p-8"><Skeleton className="h-[400px] w-full max-w-2xl" /></div>;

  return (
    <div className="p-4 lg:p-8 animate-slide-up">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Configurações</h1>
        <DeployApiButton />
      </div>
      
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Geral</CardTitle>
          <CardDescription>Defina as preferências globais do sistema.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="empresa_nome">Nome da Empresa</Label>
              <Input id="empresa_nome" {...register('empresa_nome')} placeholder="Minha Agência" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                <Label htmlFor="moeda">Moeda</Label>
                <Input id="moeda" {...register('moeda')} placeholder="BRL" />
                </div>
                <div className="grid gap-2">
                <Label htmlFor="valor_hora">Valor Hora Padrão</Label>
                <Input id="valor_hora" {...register('valor_hora')} type="number" placeholder="150.00" />
                </div>
            </div>

            <Button type="submit" disabled={mutation.isPending} className="mt-4">
              {mutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;